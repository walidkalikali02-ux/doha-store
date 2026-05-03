export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill';
  blur?: number;
}

const DEFAULT_QUALITY = 80;

export function getOptimizedImageUrl(src: string, options: ImageOptions = {}): string {
  if (!src) return '';

  if (src.startsWith('data:') || src.startsWith('blob:')) {
    return src;
  }

  const params = new URLSearchParams();

  if (options.width) params.append('w', String(options.width));
  if (options.height) params.append('h', String(options.height));
  if (options.quality) params.append('q', String(options.quality));
  if (options.format) params.append('f', options.format);
  if (options.fit) params.append('fit', options.fit);
  if (options.blur) params.append('blur', String(options.blur));

  const separator = src.includes('?') ? '&' : '?';
  return `${src}${separator}${params.toString()}`;
}

export function getResponsiveImageSet(
  src: string,
  sizes: number[],
  options: Omit<ImageOptions, 'width'> = {}
): string {
  return sizes
    .map(size => {
      const url = getOptimizedImageUrl(src, {...options, width: size});
      return `${url} ${size}w`;
    })
    .join(', ');
}

export function getSrcSet(
  src: string,
  options: ImageOptions = {}
): {srcSet: string; sizes: string} {
  const widths = [320, 640, 960, 1280, 1920];
  const srcSet = widths
    .map(w => `${getOptimizedImageUrl(src, {...options, width: w})} ${w}w`)
    .join(', ');

  const sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return {srcSet, sizes};
}

export function preloadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(sources: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(sources.map(preloadImage));
}

export function getImagePlaceholder(width: number, height: number): string {
  const aspectRatio = width / height;
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="${Math.min(width, height) / 8}">
        ${Math.round(aspectRatio * 100) / 100}:1
      </text>
    </svg>
  `;
  return `data:image/svg+xml,${encodeURIComponent(svg.trim())}`;
}

export function isImageLoaded(img: HTMLImageElement): boolean {
  return img.complete && img.naturalHeight !== 0;
}

export function getBlurDataURL(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#d1d5db');
    gradient.addColorStop(1, '#e5e7eb');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  return canvas.toDataURL('image/jpeg', 0.1);
}

export const IMAGE_PRESETS = {
  thumbnail: {width: 150, height: 150, quality: 70, fit: 'cover' as const},
  card: {width: 400, height: 300, quality: DEFAULT_QUALITY, fit: 'cover' as const},
  product: {width: 800, height: 800, quality: DEFAULT_QUALITY, fit: 'contain' as const},
  hero: {width: 1920, height: 1080, quality: DEFAULT_QUALITY, fit: 'cover' as const},
  avatar: {width: 200, height: 200, quality: DEFAULT_QUALITY, fit: 'cover' as const},
  banner: {width: 1200, height: 400, quality: DEFAULT_QUALITY, fit: 'cover' as const},
};

export function getOptimizedProductImage(
  src: string,
  preset: keyof typeof IMAGE_PRESETS = 'product'
): string {
  return getOptimizedImageUrl(src, IMAGE_PRESETS[preset]);
}

export function lazyLoadImages(selector: string = 'img[data-src]'): void {
  if (typeof IntersectionObserver === 'undefined') {
    document.querySelectorAll(selector).forEach(img => {
      const el = img as HTMLImageElement;
      if (el.dataset.src) {
        el.src = el.dataset.src;
      }
    });
    return;
  }

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            obs.unobserve(img);
          }
        }
      });
    },
    {rootMargin: '50px', threshold: 0.1}
  );

  document.querySelectorAll(selector).forEach(img => observer.observe(img));
}
