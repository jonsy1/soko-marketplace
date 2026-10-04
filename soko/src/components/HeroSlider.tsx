'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Shown when no seller has an active Featured promotion.
const DEMO_SLIDES: any[] = [
  {
    id: 'demo-welcome',
    kind: 'info',
    title: 'Welcome to Soko',
    subtitle: 'Discover products from Tanzanian sellers',
    badge: 'Soko',
    ctaText: 'Browse categories',
    ctaLink: '/categories',
    bg: 'from-clay-600 via-clay-500 to-clay-400',
  },
  {
    id: 'demo-sell',
    kind: 'ad',
    title: 'Your product could be here',
    subtitle: 'Feature a product and it appears on this banner for every visitor.',
    badge: 'For sellers',
    ctaText: 'Promote your product',
    ctaLink: '/dashboard/business/billing',
    bg: 'from-night via-market-600 to-market-500',
  },
];

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
          setSlides(DEMO_SLIDES);
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
          setSlides(heroSlides);
        }
        setLoading(false);
      })
      .catch(() => {
        setSlides(DEMO_SLIDES);
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
      <div className="relative overflow-hidden rounded-2xl h-[220px] md:h-[280px] bg-clay-50 animate-pulse flex items-center justify-center">
        <p className="text-clay-600/50">Loading...</p>
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
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            {/* Product slides: photo + orange overlay. Demo slides: plain gradient. */}
            {slide.kind === 'product' ? (
              <>
                {slide.image && (
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${slide.image})` }}
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-clay-600/90 via-clay-500/75 to-clay-400/40" />
              </>
            ) : (
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.bg}`} />
            )}

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

                  {slide.price !== undefined && slide.price !== null && (
                    <p className="text-white text-lg md:text-xl font-semibold mt-1">
                      TZS {Number(slide.price).toLocaleString()}
                    </p>
                  )}

                  <Link
                    href={slide.ctaLink}
                    className={`inline-flex items-center gap-2 mt-3 px-4 py-2 text-white text-sm font-semibold rounded-xl transition-all hover:scale-[1.02] shadow-lg ${
                      slide.kind === 'ad'
                        ? 'bg-clay-500 hover:bg-clay-600'
                        : 'bg-market-500 hover:bg-market-600'
                    }`}
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