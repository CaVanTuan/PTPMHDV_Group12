using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Models;
using System.Security.Claims;

namespace Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class FeedbackController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FeedbackController(AppDbContext context)
        {
            _context = context;
        }

        // Lấy UserId và Role từ JWT
        private (int userId, string role) GetUserInfo()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var role = User.FindFirstValue(ClaimTypes.Role);
            return (userId, role);
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll()
        {
            var feedbacks = await _context.Feedbacks
                .Include(f => f.User)
                .Include(f => f.Product)
                .Select(f => new
                {
                    f.Id,
                    f.Content,
                    f.Rating,
                    f.ProductId,
                    f.UserId,
                    UserName = f.User.FullName,
                    f.CreatedAt
                })
                .ToListAsync();

            return Ok(feedbacks);
        }

        [HttpGet("product/{productId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var feedbacks = await _context.Feedbacks
                .Where(f => f.ProductId == productId)
                .Include(f => f.User)
                .Select(f => new
                {
                    f.Id,
                    f.Content,
                    f.Rating,
                    f.ProductId,
                    f.UserId,
                    UserName = f.User.FullName
                })
                .ToListAsync();

            return Ok(feedbacks);
        }

        // POST: api/Feedback
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateFeedbackDto dto)
        {
            var (userId, role) = GetUserInfo();

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var feedback = new Feedback
            {
                Content = dto.Content,
                Rating = dto.Rating,
                ProductId = dto.ProductId,
                UserId = userId,
                CreatedAt = DateTime.UtcNow
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();

            var result = new
            {
                feedback.Id,
                feedback.Content,
                feedback.Rating,
                feedback.ProductId,
                feedback.UserId,
                UserName = (await _context.users.FindAsync(userId))?.FullName
            };

            return Ok(result);
        }

        // PUT: api/Feedback/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateFeedbackDto dto)
        {
            var (userId, role) = GetUserInfo();

            var existing = await _context.Feedbacks.FindAsync(id);
            if (existing == null)
                return NotFound("Feedback not found");

            // User chỉ sửa feedback của mình, Admin được sửa tất cả
            if (role != "Admin" && existing.UserId != userId)
                return Forbid("You cannot edit this feedback");

            existing.Content = dto.Content;
            existing.Rating = dto.Rating;

            // Nếu admin muốn update productId
            if (dto.ProductId.HasValue && role == "Admin")
                existing.ProductId = dto.ProductId.Value;

            existing.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new
            {
                existing.Id,
                existing.Content,
                existing.Rating,
                existing.ProductId,
                existing.UserId,
                UserName = (await _context.users.FindAsync(existing.UserId))?.FullName
            });
        }

        // DELETE: api/Feedback/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var (userId, role) = GetUserInfo();

            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
                return NotFound("Feedback not found");

            // User chỉ xoá feedback của mình, Admin được xoá tất cả
            if (role != "Admin" && feedback.UserId != userId)
                return Forbid("Không thể xoá feedback này");

            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Xóa feedback thành công" });
        }
    }
    public class UpdateFeedbackDto
    {
        public string Content { get; set; }
        public int Rating { get; set; }
        public int? ProductId { get; set; }
    }
    public class CreateFeedbackDto
    {
        public string Content { get; set; }

        public int Rating { get; set; }

        public int ProductId { get; set; }
    }
}
