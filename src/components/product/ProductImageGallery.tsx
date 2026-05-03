import {useState} from 'react';
import type {ProductImage} from '@/types';

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({images, productName}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-stone-100 flex items-center justify-center text-stone-400">
        No Image Available
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  if (!selectedImage) {
    return (
      <div className="aspect-square bg-stone-100 flex items-center justify-center text-stone-400">
        No Image Available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square overflow-hidden rounded-lg bg-stone-100">
        <img
          src={selectedImage.url}
          alt={selectedImage.alt || productName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                index === selectedIndex ? 'border-amber-600' : 'border-transparent'
              }`}
            >
              <img
                src={image.url}
                alt={image.alt || `${productName} - ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
