'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  badge?: string;
  badgeColor?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Women's Clothing",
    subtitle: "Catch The Chance >>",
    description: "Discover the latest fashion trends",
    image: "/images/hero/hero-1.jpg",
    ctaText: "Shop Now",
    ctaLink: "/category/fashion",
    badge: "Premium Sale",
    badgeColor: "bg-gold/20 text-gold"
  },
  {
    id: 2,
    title: "Electronics Deals",
    subtitle: "Up to 50% Off",
    description: "Gadgets, phones, and more",
    image: "/images/hero/hero-2.jpg",
    ctaText: "Explore",
    ctaLink: "/category/electronics",
    badge: "Flash Sale",
    badgeColor: "bg-red-500/20 text-red-500"
  },
  {
    id: 3,
    title: "Home & Living",
    subtitle: "Make Your Space Beautiful",
    description: "Furniture, decor, and appliances",
    image: "/images/hero/hero-3.jpg",
    ctaText: "View Collection",
    ctaLink: "/category/home",
    badge: "New Arrival",
    badgeColor: "bg-blue-500/20 text-blue-500"
  }
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const slideIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto play
  useEffect(() => {
    if (isAutoPlaying) {
      slideIntervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => {
      if (slideIntervalRef.current) {
        clearInterval(slideIntervalRef.current);
      }
    };
  }, [isAutoPlaying]);

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

  return (
    <div 
      className="relative overflow-hidden rounded-2xl"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Slides container */}
      <div 
        className="relative h-[400px] md:h-[500px] lg:h-[550px] transition-all duration-700 ease-in-out"
        style={{ 
          backgroundColor: '#0E2A2F'
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-700 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay',
            }}
          >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-night/90 via-night/60 to-transparent" />
            
            {/* Content */}
            <div className="relative h-full flex items-center">
              <div className="max-w-6xl mx-auto px-4 w-full">
                <div className="max-w-2xl">
                  {/* Badge */}
                  {slide.badge && (
                    <span className={`inline-block px-4 py-1 rounded-full text-xs font-semibold mb-4 ${slide.badgeColor || 'bg-white/20 text-white'}`}>
                      {slide.badge}
                    </span>
                  )}
                  
                  {/* Title */}
                  <h1 className="font-display font-bold text-3xl md:text-5xl text-white leading-tight">
                    {slide.title}
                  </h1>
                  
                  {/* Subtitle */}
                  <p className="text-gold font-medium text-lg md:text-xl mt-2">
                    {slide.subtitle}
                  </p>
                  
                  {/* Description */}
                  <p className="text-white/70 text-sm md:text-base mt-2 max-w-md">
                    {slide.description}
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
      </div>
    </div>
  );
}