"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { getAll, Product as ProductAPI } from "@/services/product-services";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface ProductHero {
  id: number;
  name: string;
  price: number;
  imageUrl?: string | null;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);

/* ================= CONTENT ================= */
const SlideContent = ({ product }: { product: ProductHero }) => (
  <div className="absolute inset-0 z-20 flex items-center">
    <div className="mx-auto w-[90%] text-white font-[Times_New_Roman]">
      <h2 className="text-4xl md:text-5xl font-bold drop-shadow-lg">
        {product.name}
      </h2>

      <p className="mt-4 text-2xl md:text-3xl font-semibold drop-shadow-md">
        {formatPrice(product.price)}
      </p>

      <Link
        href={`/product/${product.id}`}
        className="mt-6 inline-block rounded-xl
                   border-2 border-white px-8 py-3
                   font-semibold
                   transition-all duration-300
                   hover:bg-white hover:text-black hover:scale-105"
      >
        🛍️ Xem chi tiết
      </Link>
    </div>
  </div>
);

/* ================= HERO ================= */
export default function HeroBanner() {
  const [products, setProducts] = useState<ProductHero[]>([]);
  const swiperRef = useRef<any>(null);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  /* ===== LOAD DATA ===== */
  useEffect(() => {
    (async () => {
      const data: ProductAPI[] | undefined = await getAll();
      if (!data?.length) return;

      setProducts(
        data.slice(0, 5).map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          imageUrl: p.imageUrl || null,
        }))
      );
    })();
  }, []);

  /* ===== HOVER AUTO SLIDE (DESKTOP) ===== */
  const startHover = (dir: "next" | "prev") => {
    stopHover();
    hoverTimer.current = setInterval(() => {
      dir === "next"
        ? swiperRef.current?.slideNext(700)
        : swiperRef.current?.slidePrev(700);
    }, 1600);
  };

  const stopHover = () => {
    if (hoverTimer.current) {
      clearInterval(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  if (!products.length) return null;

  return (
    <section className="relative h-[85vh] w-full font-[Times_New_Roman]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        slidesPerView={1}
        loop
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 9000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        onSwiper={(s) => (swiperRef.current = s)}
        className="h-full"
      >
        {products.map((p) => (
          <SwiperSlide key={p.id} className="relative">
            <img
              src={p.imageUrl || "/images/banner/banner-01.jpg"}
              alt={p.name}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-black/40 z-10" />

            <SlideContent product={p} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* ===== HOVER TRÁI ===== */}
      <div
        className="absolute left-0 top-0 h-full w-[5%] z-30 hidden lg:block"
        onMouseEnter={() => startHover("prev")}
        onMouseLeave={stopHover}
      />

      {/* ===== HOVER PHẢI ===== */}
      <div
        className="absolute right-0 top-0 h-full w-[5%] z-30 hidden lg:block"
        onMouseEnter={() => startHover("next")}
        onMouseLeave={stopHover}
      />

      <style jsx global>{`
        .swiper-button-next,
        .swiper-button-prev {
          color: #fff;
          opacity: 0.7;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          transform: scale(1.2);
          opacity: 1;
        }
      `}</style>
    </section>
  );
}