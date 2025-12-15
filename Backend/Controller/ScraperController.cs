using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using Newtonsoft.Json.Linq;
using HtmlAgilityPack;
using System.Text.RegularExpressions;

namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ScraperController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly HttpClient _httpClient;
        private static readonly Random _random = new Random();

        public ScraperController(AppDbContext context)
        {
            _context = context;

            _httpClient = new HttpClient();
            _httpClient.DefaultRequestHeaders.Add(
                "User-Agent",
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            );
            _httpClient.DefaultRequestHeaders.Add("Referer", "https://yame.vn");
        }

        // ================================
        // FETCH PRODUCTS FROM YAME
        // ================================
        [HttpGet("fetch-products")]
        public async Task<IActionResult> FetchProducts()
        {
            const string url = "https://yame.vn/products.json";

            try
            {
                var response = await _httpClient.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return StatusCode((int)response.StatusCode, "Failed to fetch data");

                var content = await response.Content.ReadAsStringAsync();
                var json = JObject.Parse(content);
                var productsArray = json["products"] as JArray;

                if (productsArray == null || !productsArray.Any())
                    return BadRequest("No products found");

                // Load sẵn data để tránh query nhiều lần
                var existingCategories = await _context.categories.ToListAsync();
                var existingProductNames = new HashSet<string>(
                    await _context.products.Select(p => p.Name).ToListAsync()
                );

                var newProducts = new List<Product>();

                foreach (var item in productsArray)
                {
                    // ================================
                    // CATEGORY
                    // ================================
                    string categoryName = item["product_type"]?.ToString()?.Trim();
                    if (string.IsNullOrEmpty(categoryName))
                        categoryName = "Khác";

                    var category = existingCategories
                        .FirstOrDefault(c => c.Name == categoryName);

                    if (category == null)
                    {
                        category = new Category
                        {
                            Name = categoryName,
                            Description = categoryName
                        };

                        _context.categories.Add(category);
                        await _context.SaveChangesAsync();

                        existingCategories.Add(category);
                    }

                    // ================================
                    // DESCRIPTION (HTML → TEXT)
                    // ================================
                    string description = CleanHtml(item["body_html"]?.ToString());

                    // ================================
                    // VARIANT + IMAGE
                    // ================================
                    var firstVariant = item["variants"]?.FirstOrDefault();
                    var firstImage = item["images"]?.FirstOrDefault();

                    decimal price = 0;
                    decimal.TryParse(firstVariant?["price"]?.ToString(), out price);

                    // ================================
                    // PRODUCT
                    // ================================
                    string productName = item["title"]?.ToString()?.Trim() ?? "No Name";

                    if (existingProductNames.Contains(productName))
                        continue;

                    var product = new Product
                    {
                        Name = productName,
                        Description = description,
                        Price = price,
                        Instock = _random.Next(50, 201),
                        ImageUrl = firstImage?["src"]?.ToString(),
                        CategoryId = category.Id
                    };

                    newProducts.Add(product);
                    existingProductNames.Add(productName);
                }

                if (newProducts.Any())
                {
                    _context.products.AddRange(newProducts);
                    await _context.SaveChangesAsync();
                }

                return Ok(new
                {
                    message = "Fetch thành công 🎉",
                    totalAdded = newProducts.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    message = "Scraping failed ❌",
                    error = ex.Message
                });
            }
        }

        // ================================
        // CLEAN HTML → TEXT
        // ================================
        private static string CleanHtml(string html)
        {
            if (string.IsNullOrWhiteSpace(html))
                return "";

            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            string text = HtmlEntity.DeEntitize(doc.DocumentNode.InnerText);

            text = text
                .Replace("\r", " ")
                .Replace("\n", " ")
                .Replace("\t", " ");

            text = Regex.Replace(text, @"\s+", " ").Trim();

            if (text.Length > 4000)
                text = text.Substring(0, 4000);

            return text;
        }
    }
}
