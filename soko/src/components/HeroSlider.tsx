'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const WELCOME_SLIDE: any = {
  id: 'demo-welcome',
  kind: 'info',
  title: 'Welcome to Soko',
  subtitle: 'Discover products from Tanzanian sellers',
  badge: 'Soko',
  ctaText: 'Browse categories',
  ctaLink: '/categories',
  emoji: '🛍️',
};

// Always shown as the last slide, so sellers keep seeing that the space is for sale.
const SELLER_AD_SLIDE: any = {
  id: 'demo-sell',
  kind: 'ad',
  title: 'Your product could be here',
  subtitle: 'Feature a product and it appears on this banner for every visitor.',
  badge: 'For sellers',
  ctaText: 'Promote your product',
  ctaLink: '/dashboard/business/billing',
  emoji: '📣',
};

export default function HeroSlider() {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch only products with an active Featured promotion
  useEffect(() => {
    fetch('/api/products?hero=1')
      .then((r) => r.json())
      .then((data) => {
        const products = Array.isArray(data) ? data : [];
        if (products.length === 0) {
          setSlides([WELCOME_SLIDE, SELLER_AD_SLIDE]);
        } else {
          const heroSlides = products.map((product: any) => ({
            id: product.id,
            kind: 'product',
            title: product.name,
            subtitle: `From ${product.business?.name || 'Soko Seller'}`,
            image: product.imageUrl,
            ctaText: 'View Product',
            ctaLink: `/product/${product.id}`,
            badge: product.category?.name || 'Featured',
            price: product.price,
          }));
          setSlides([...heroSlides, SELLER_AD_SLIDE]);
        }
        setLoading(false);
      })
      .catch(() => {
        setSlides([WELCOME_SLIDE, SELLER_AD_SLIDE]);
        setLoading(false);
      });
  }, []);

  // Auto play
  useEffect(() => {
    if (isAutoPlaying && slides.length > 1) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [isAutoPlaying, slides.length]);

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(true);
  };

  const goToPrev = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(true);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(true);
  };

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl h-[240px] md:h-[300px] bg-market-100 animate-pulse flex items-center justify-center">
        <p className="text-market-600/50">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-[240px] md:h-[300px] lg:h-[340px] bg-[#1D55D6]">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            {/* Blue brand background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A3AA8] via-[#1D55D6] to-[#2F6FED]" />

            {/* Right side: product photo in a rounded panel, or a big symbol on demo slides */}
            {slide.kind === 'product' ? (
              <div className="absolute right-0 top-0 h-full w-[44%] md:w-[42%] rounded-l-[80px] overflow-hidden border-l-[6px] border-[#F0602E] bg-white">
                {slide.image && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${slide.image}")` }}
                  />
                )}
              </div>
            ) : (
              <div className="absolute right-0 top-0 h-full w-[44%] md:w-[42%] flex items-center justify-center rounded-l-[80px] bg-white/10 border-l-[6px] border-[#F0602E]">
                <span className="text-7xl md:text-9xl">{slide.emoji}</span>
              </div>
            )}

            {/* Text */}
            <div className="relative h-full flex items-center pl-12 pr-4 md:pl-20 md:pr-10">
              <div className="max-w-[54%] md:max-w-[52%]">
                {slide.badge && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold mb-2 bg-[#F0602E] text-white">
                    ⚡ {slide.badge}
                  </span>
                )}

                <h1 className="font-display font-bold text-2xl md:text-5xl text-white leading-tight line-clamp-2">
                  {slide.title}
                </h1>

                <p className="text-white/85 font-medium text-xs md:text-base mt-1.5 line-clamp-2">
                  {slide.subtitle}
                </p>

                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-[#F0602E] hover:bg-[#D9501F] text-white text-sm md:text-base font-bold rounded-full transition-all hover:scale-[1.03] shadow-lg"
                >
                  {slide.price !== undefined && slide.price !== null
                    ? `TZS ${Number(slide.price).toLocaleString()}`
                    : slide.ctaText}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}

        {/* Dots + arrows */}
        {slides.length > 1 && (
          <>
            <div className="absolute bottom-4 left-12 md:left-20 flex gap-2 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-night/80 hover:bg-night transition flex items-center justify-center text-white z-10 shadow-md"
              aria-label="Previous slide"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-night/80 hover:bg-night transition flex items-center justify-center text-white z-10 shadow-md"
              aria-label="Next slide"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}