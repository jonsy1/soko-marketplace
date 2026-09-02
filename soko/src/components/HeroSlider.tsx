'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  category: { name: string; slug: string };
}

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
        // Create slides from products
        const heroSlides = products.map((product: any, index: number) => ({
          id: product.id,
          title: product.name,
          subtitle: `From ${product.business?.name || 'Soko Seller'}`,
          description: `TZS ${Number(product.price).toLocaleString()}`,
          image: product.imageUrl || '/images/placeholder.jpg',
          ctaText: 'View Product',
          ctaLink: `/product/${product.id}`,
          badge: product.category?.name || 'Featured',
          badgeColor: 'bg-gold/20 text-gold',
          price: product.price,
        }));
        setSlides(heroSlides);
        setLoading(false);
      })
      .catch(() => {
        // Fallback slides if API fails
        setSlides([
          {
            id: '1',
            title: 'Welcome to Soko',
            subtitle: 'Discover amazing products',
            description: 'Shop from verified sellers across Tanzania',
            image: '/images/hero/fallback-1.jpg',
            ctaText: 'Shop Now',
            ctaLink: '/',
            badge: 'Featured',
            badgeColor: 'bg-gold/20 text-gold',
          }
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

  // Pause on hover
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
      <div className="relative overflow-hidden rounded-2xl h-[400px] md:h-[500px] bg-night/10 animate-pulse flex items-center justify-center">
        <p className="text-night/30">Loading products...</p>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-2xl h-[400px] md:h-[500px] bg-gradient-to-r from-night to-market-600 flex items-center justify-center text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Welcome to Soko</h2>
          <p className="text-white/70 mt-2">Discover amazing products from Tanzanian sellers</p>
          <Link href="/" className="inline-block mt-4 px-6 py-3 bg-gold text-night rounded-xl font-semibold">
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
      <div className="relative h-[400px] md:h-[500px] lg:h-[550px] bg-night">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            {/* Product Image as Background */}
            {slide.image && (
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ 
                  backgroundImage: `url(${slide.image})`,
                }}
              />
            )}
            
            {/* Gradient Overlay - dark for readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/70 to-night/40" />
            
            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-6xl mx-auto px-4 w-full">
                <div className="max-w-2xl">
                  {/* Badge - Category or Featured */}
                  {slide.badge && (
                    <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 ${slide.badgeColor || 'bg-white/20 text-white'}`}>
                      {slide.badge}
                    </span>
                  )}
                  
                  {/* Product Name */}
                  <h1 className="font-display font-bold text-3xl md:text-5xl text-white leading-tight line-clamp-2">
                    {slide.title}
                  </h1>
                  
                  {/* Seller / Subtitle */}
                  <p className="text-gold font-medium text-lg md:text-xl mt-2">
                    {slide.subtitle}
                  </p>
                  
                  {/* Price */}
                  <p className="text-white/90 text-2xl md:text-3xl font-semibold mt-2">
                    TZS {Number(slide.price).toLocaleString()}
                  </p>
                  
                  {/* CTA Button */}
                  <Link
                    href={slide.ctaLink}
                    className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-gold text-night font-semibold rounded-xl hover:bg-gold/90 transition-all hover:scale-[1.02] shadow-lg"
                  >
                    {slide.ctaText}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
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
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide 
                      ? 'w-8 bg-gold' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation arrows */}
            <button
              onClick={goToPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition flex items-center justify-center text-white z-10"
              aria-label="Previous slide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 transition flex items-center justify-center text-white z-10"
              aria-label="Next slide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}