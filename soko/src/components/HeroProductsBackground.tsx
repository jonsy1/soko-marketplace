'use client';

import { useEffect, useState } from 'react';

type Slot = {
  top: string;
  left: string;
  size: string;
  rotate: number;
  tilt: number;
  delay: string;
};

const SLOTS: Slot[] = [
  { top: '6%', left: '56%', size: 'w-16 h-16 sm:w-24 sm:h-24', rotate: -8, tilt: -6, delay: '0s' },
  { top: '10%', left: '78%', size: 'w-20 h-20 sm:w-28 sm:h-28', rotate: 6, tilt: 8, delay: '0.6s' },
  { top: '46%', left: '68%', size: 'w-16 h-16 sm:w-24 sm:h-24', rotate: -5, tilt: -10, delay: '1.1s' },
  { top: '58%', left: '88%', size: 'w-14 h-14 sm:w-20 sm:h-20', rotate: 10, tilt: 6, delay: '1.6s' },
  { top: '72%', left: '52%', size: 'w-14 h-14 sm:w-20 sm:h-20', rotate: -10, tilt: 4, delay: '0.3s' },
  { top: '30%', left: '92%', size: 'w-12 h-12 sm:w-16 sm:h-16', rotate: 4, tilt: -8, delay: '2s' },
];

export default function HeroProductsBackground() {
  const [images, setImages] = useState<string[]>([]);
  const [indices, setIndices] = useState<number[]>(SLOTS.map((_, i) => i));

  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (!Array.isArray(data)) return;
        const urls = data.map((p: any) => p.imageUrl).filter(Boolean).slice(0, 16);
        setImages(urls);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (images.length < 2) return;
    const timers = SLOTS.map((_, slot) =>
      setInterval(() => {
        setIndices((prev) => {
          const next = [...prev];
          next[slot] = (next[slot] + 1) % images.length;
          return next;
        });
      }, 3200 + slot * 500)
    );
    return () => timers.forEach(clearInterval);
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden perspective-1000 hidden sm:block">
      {SLOTS.map((slot, i) => {
        const imgIndex = indices[i] % images.length;
        const url = images[imgIndex];
        return (
          <div
            key={i}
            className={`absolute animate-float-3d ${slot.size}`}
            style={{
              top: slot.top,
              left: slot.left,
              animationDelay: slot.delay,
              ['--card-rot' as any]: `${slot.rotate}deg`,
              ['--card-tilt' as any]: `${slot.tilt}deg`,
            }}
          >
            <div className="w-full h-full rounded-2xl bg-white/95 p-1.5 shadow-2xl ring-1 ring-white/40">
              <div className="w-full h-full rounded-xl overflow-hidden bg-market-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={imgIndex}
                  src={url}
                  alt=""
                  className="w-full h-full object-cover animate-flip-in-3d"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}