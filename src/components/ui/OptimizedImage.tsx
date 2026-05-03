import {useState, useEffect, useRef, useCallback} from 'react';
import {motion} from 'motion/react';
import {cn} from '@/utils/helpers';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  containerClassName?: string;
  fallback?: string;
  placeholder?: 'blur' | 'skeleton' | 'none';
  blurDataURL?: string;
  sizes?: string;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none';
  objectPosition?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const defaultBreakpoints = [400, 640, 768, 1024, 1280, 1536];

function generateSrcSet(src: string, widths: number[]): string {
  if (!src || src.startsWith('data:')) return '';

  const baseUrl = src.split('?')[0];
  const existingParams = src.includes('?')
    ? new URLSearchParams(src.split('?')[1])
    : new URLSearchParams();

  return widths
    .map(w => {
      existingParams.set('w', String(w));
      existingParams.set('q', '75');
      existingParams.set('format', 'webp');
      return `${baseUrl}?${existingParams.toString()} ${w}w`;
    })
    .join(', ');
}

function generateDefaultSizes(): string {
  return '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw';
}

const shimmerGradient = `
  background: linear-gradient(
    90deg,
    rgba(200, 200, 200, 0.1) 0%,
    rgba(200, 200, 200, 0.2) 20%,
    rgba(200, 200, 200, 0.1) 40%,
    rgba(200, 200, 200, 0) 100%
  )
`;

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  containerClassName,
  fallback = '/images/placeholder.webp',
  placeholder = 'blur',
  blurDataURL,
  sizes,
  priority = false,
  objectFit = 'cover',
  objectPosition = 'center',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLDivElement>(null);

  const srcSet = generateSrcSet(src, defaultBreakpoints);
  const imageSizes = sizes || generateDefaultSizes();

  useEffect(() => {
    if (priority) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [priority]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setHasError(true);
    onError?.();
  }, [onError]);

  const objectFitClass = {
    contain: 'object-contain',
    cover: 'object-cover',
    fill: 'object-fill',
    none: 'object-none',
  }[objectFit];

  const imageSrc = hasError ? fallback : src;

  return (
    <div
      ref={imgRef}
      className={cn('relative overflow-hidden bg-stone-100', containerClassName)}
      style={{
        width: width ? `${width}px` : '100%',
        height: height ? `${height}px` : '100%',
      }}
    >
      {placeholder === 'blur' && !isLoaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: blurDataURL
              ? `url(${blurDataURL}) center/cover no-repeat`
              : 'linear-gradient(135deg, #e7e5e4 0%, #d6d3d1 50%, #e7e5e4 100%)',
          }}
        />
      )}

      {placeholder === 'skeleton' && !isLoaded && (
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            background: shimmerGradient,
            backgroundSize: '200% 100%',
          }}
        />
      )}

      {isInView && (
        <motion.img
          src={imageSrc}
          srcSet={priority ? undefined : srcSet}
          sizes={priority ? undefined : imageSizes}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? undefined : 'lazy'}
          decoding={priority ? undefined : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          initial={{opacity: 0}}
          animate={{opacity: isLoaded ? 1 : 0}}
          transition={{duration: 0.3}}
          className={cn(
            objectFitClass,
            'w-full h-full',
            objectPosition && `object-${objectPosition}`,
            className
          )}
        />
      )}
    </div>
  );
}

export interface ProductImageProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'portrait' | 'landscape' | 'auto';
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  className,
  aspectRatio = 'square',
  priority = false,
}: ProductImageProps) {
  const aspectRatioClass = {
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
    auto: '',
  }[aspectRatio];

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      placeholder="blur"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
      priority={priority}
      containerClassName={cn(aspectRatioClass, className)}
      objectFit="cover"
    />
  );
}

export function ImageGallery({
  images,
  alt,
  className,
}: {
  images: string[];
  alt: string;
  className?: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <div className={cn('space-y-4', className)}>
      <OptimizedImage
        src={images[selectedIndex] || '/images/placeholder.webp'}
        alt={`${alt} - Image ${selectedIndex + 1}`}
        containerClassName="aspect-square rounded-lg"
        objectFit="cover"
        priority
      />

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'flex-shrink-0 rounded-lg overflow-hidden transition-all',
                selectedIndex === index
                  ? 'ring-2 ring-amber-500'
                  : 'ring-1 ring-stone-200 hover:ring-stone-300'
              )}
            >
              <OptimizedImage
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                width={80}
                height={80}
                containerClassName="w-20 h-20"
                objectFit="cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function AvatarImage({
  src,
  alt,
  size = 'md',
  className,
}: {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}) {
  const sizeClass = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  const fallbackText = alt
    .split(' ')
    .map(word => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (!src) {
    return (
      <div
        className={cn(
          sizeClass,
          'rounded-full bg-stone-200 flex items-center justify-center text-stone-600 font-medium',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-sm',
          size === 'lg' && 'text-base',
          size === 'xl' && 'text-lg',
          className
        )}
      >
        {fallbackText}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      containerClassName={cn(sizeClass, 'rounded-full overflow-hidden', className)}
      objectFit="cover"
    />
  );
}

export function CardImage({src, alt, className}: {src: string; alt: string; className?: string}) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      placeholder="skeleton"
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      containerClassName={cn('aspect-square rounded-lg', className)}
      objectFit="cover"
    />
  );
}
