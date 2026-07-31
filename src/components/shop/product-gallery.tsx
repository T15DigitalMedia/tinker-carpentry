"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  fallbackAlt,
}: {
  images: { url: string; alt: string }[];
  fallbackAlt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-ui border border-line bg-panel font-mono text-xs uppercase tracking-wider text-ink-3">
        No photos yet
      </div>
    );
  }

  const active = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square w-full overflow-hidden rounded-ui border border-line bg-paper-2">
        <Image
          src={active.url}
          alt={active.alt || fallbackAlt}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          loading="eager"
          className="object-cover"
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`Show photo ${index + 1}`}
              aria-current={index === activeIndex}
              className={`relative aspect-square w-16 overflow-hidden rounded-ui border transition-colors ${
                index === activeIndex ? "border-walnut" : "border-line hover:border-line-strong"
              }`}
            >
              <Image src={image.url} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
