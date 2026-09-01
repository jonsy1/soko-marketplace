'use client';

import { useEffect, useState } from 'react';

const SLOT_POSITIONS = ['6%', '24%', '48%', '72%', '92%'];

export default function HeaderProductsBackground() {
  const [images, setImages] = useState<string[]>([]);
  const [indices, setIndices] = useState<number[]>([0, 1, 2, 3, 4]);

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
    const timers = SLOT_POSITIONS.map((_, slot) =>
      setInterval(() => {
        setIndices((prev) => {
          const next = [...prev];
          next[slot] = (next[slot] + 1) % images.length;
          return next;
        });
      }, 3000 + slot * 650)
    );
    return () => timers.forEach(clearInterval);
  }, [images]);

  if (images.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden perspective-1000 hidden md:block">
      {SLOT_POSITIONS.map((left, slot) => {
        const imgIndex = indices[slot] % images.length;
        const url = images[imgIndex];
        return (
          <div
            key={slot}
            className="absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl overflow-hidden opacity-[0.18] blur-[0.5px]"
            style={{ left }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={imgIndex}
              src={url}
              alt=""
              className="w-full h-full object-cover animate-flip-in-3d"
            />
          </div>
        );
      })}
    </div>
  );
}