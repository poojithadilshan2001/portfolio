import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export interface LightboxItem {
  url: string;
  caption?: string | null;
  type?: string;
}

interface MediaLightboxProps {
  items: LightboxItem[];
  startIndex?: number;
  title?: string;
  onClose: () => void;
}

export default function MediaLightbox({ items, startIndex = 0, title, onClose }: MediaLightboxProps) {
  const [index, setIndex] = useState(startIndex);
  if (items.length === 0) return null;
  const item = items[index];

  const prev = () => setIndex((i) => (i - 1 + items.length) % items.length);
  const next = () => setIndex((i) => (i + 1) % items.length);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-navy-950/90 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in"
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
        aria-label="Close"
      >
        <X size={24} />
      </button>

      {title && (
        <div className="absolute top-5 left-5 text-white/80 text-sm font-medium">
          {title} {items.length > 1 && `(${index + 1}/${items.length})`}
        </div>
      )}

      {items.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-4 sm:left-8 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Previous"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      <div className="flex flex-col items-center max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        {item.type === 'video' ? (
          <video
            src={item.url}
            controls
            autoPlay
            loop
            className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain"
          />
        ) : (
          <img src={item.url} alt={item.caption || title || ''} className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain" />
        )}
        {item.caption && <p className="mt-4 text-white/80 text-sm text-center">{item.caption}</p>}
      </div>

      {items.length > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-4 sm:right-8 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Next"
        >
          <ChevronRight size={28} />
        </button>
      )}
    </div>
  );
}
