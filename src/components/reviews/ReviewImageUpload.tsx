import {useState, useRef} from 'react';
import {Upload, X, Image as ImageIcon} from 'lucide-react';

interface ReviewImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  maxSizeKB?: number;
}

export function ReviewImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  maxSizeKB = 5000,
}: ReviewImageUploadProps) {
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError('');

    if (images.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }

    setUploading(true);

    try {
      const newImages: string[] = [];

      for (const file of Array.from(files)) {
        if (file.size > maxSizeKB * 1024) {
          setError(`Image "${file.name}" is too large. Maximum size is ${maxSizeKB / 1000}MB`);
          continue;
        }

        if (!file.type.startsWith('image/')) {
          setError(`"${file.name}" is not a valid image file`);
          continue;
        }

        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newImages.push(dataUrl);
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages].slice(0, maxImages));
      }
    } catch (err) {
      setError('Failed to upload images. Please try again.');
      console.error('Image upload error:', err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const fakeEvent = {
        target: {files},
      } as React.ChangeEvent<HTMLInputElement>;
      await handleFileSelect(fakeEvent);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Add Photos (Optional)
        <span className="text-gray-500 font-normal ml-1">
          Up to {maxImages} images, {maxSizeKB / 1000}MB each
        </span>
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          uploading ? 'border-coffee-300 bg-coffee-50' : 'border-gray-300'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600" />
            <p className="mt-2 text-sm text-gray-600">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 text-sm font-medium text-coffee-600 bg-white border border-coffee-600 rounded-md hover:bg-coffee-50"
              >
                Choose files
              </button>
              <p className="mt-2 text-sm text-gray-500">or drag and drop images here</p>
            </div>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {images.length > 0 && (
        <div className="grid grid-cols-5 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                {image.startsWith('data:') ? (
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-full h-full p-4 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="absolute top-1 right-1 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
