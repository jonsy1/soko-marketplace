'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function HeroSlider() {
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch products for hero slides
  useEffect(() => {
    fetch('/api/products?take=5')
      .then((r) => r.json())
      .then((data) => {
        const products = Array.isArray(data) ? data : [];
        const heroSlides = products.map((product: any) => ({
          id: product.id,
          title: product.name,
          subtitle: `From ${product.business?.name || 'Soko Seller'}`,
          image: product.imageUrl || '/images/placeholder.jpg',
          ctaText: 'View Product',
          ctaLink: `/product/${product.id}`,
          badge: product.category?.name || 'Featured',
          price: product.price,
        }));
        setSlides(heroSlides);
        setLoading(false);
      })
      .catch(() => {
        setSlides([
          {
            id: '1',
            title: 'Welcome to Soko',
            subtitle: 'Discover amazing products',
            image: '/images/hero/fallback-1.jpg',
            ctaText: 'Shop Now',
            ctaLink: '/',
            badge: 'Featured',
          },
        ]);
        setLoading(false);
      });
  }, []);

  // Auto play
  useEffect(() => {
    if (isAutoPlaying && slides.length > 0) {
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
      <div className="relative overflow-hidden rounded-2xl h-[220px] md:h-[280px] bg-clay-50 animate-pulse flex items-center justify-center">
        <p className="text-clay-600/50">Loading products...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl h-[220px] md:h-[280px] bg-gradient-to-r from-clay-600 via-clay-500 to-clay-400 flex items-center justify-center text-white">
        <div className="text-center px-4">
          <h2 className="text-xl md:text-2xl font-bold">Welcome to Soko</h2>
          <p className="text-white/80 mt-1 text-sm">Discover amazing products from Tanzanian sellers</p>
          <Link href="/" className="inline-block mt-3 px-5 py-2.5 bg-market-500 text-white rounded-xl font-semibold text-sm hover:bg-market-600 transition">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-[220px] md:h-[280px] lg:h-[320px] bg-clay-500">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            {/* Product Image as Background */}
            {slide.image && (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
            )}

            {/* Orange gradient overlay - kama pichani */}
            <div className="absolute inset-0 bg-gradient-to-r from-clay-600/90 via-clay-500/75 to-clay-400/40" />

            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-6xl mx-auto px-4 w-full">
                <div className="max-w-md">
                  {slide.badge && (
                    <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold mb-2 bg-white/20 text-white">
                      {slide.badge}
                    </span>
                  )}

                  <h1 className="font-display font-bold text-xl md:text-3xl text-white leading-tight line-clamp-2">
                    {slide.title}
                  </h1>

                  <p className="text-white/80 font-medium text-xs md:text-sm mt-1">
                    {slide.subtitle}
                  </p>

                  <p className="text-white text-lg md:text-xl font-semibold mt-1">
                    TZS {Number(slide.price).toLocaleString()}
                  </p>

                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-market-500 text-white text-sm font-semibold rounded-xl hover:bg-market-600 transition-all hover:scale-[1.02] shadow-lg"
                  >
                    {slide.ctaText}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Dots indicator */}
        {slides.length > 1 && (
          <>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition flex items-center justify-center text-white z-10"
              aria-label="Previous slide"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/15 backdrop-blur-sm hover:bg-white/25 transition flex items-center justify-center text-white z-10"
              aria-label="Next slide"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}