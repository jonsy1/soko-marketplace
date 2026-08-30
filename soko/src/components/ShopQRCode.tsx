'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

export default function ShopQRCode({ slug }: { slug: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const url = typeof window !== 'undefined' ? `${window.location.origin}/business/${slug}` : '';

  useEffect(() => {
    if (!canvasRef.current || !url) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 280,
      margin: 1,
      color: { dark: '#2A0E52', light: '#FFFFFF' },
    }).then(() => setReady(true));
  }, [url]);

  function download() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${slug}-qr.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="card p-5">
      <h2 className="font-semibold mb-1">Duka QR Code</h2>
      <p className="text-xs text-night/50 mb-4">
        Chapisha na ubandike dukani — wateja wanaweza ku-scan waone bei zote bila kuuliza.
      </p>
      <div className="flex flex-col items-center gap-4">
        <canvas ref={canvasRef} className="rounded-card border border-night/10" />
        <button onClick={download} disabled={!ready} className="btn btn-primary w-full">
          ⬇ Pakua QR Code
        </button>
      </div>
    </div>
  );
}