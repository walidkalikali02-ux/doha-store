import {useRef, useCallback} from 'react';
import {useLoadScript, Autocomplete} from '@react-google-maps/api';
import {MapPin, Loader2} from 'lucide-react';
import {GOOGLE_MAPS_CONFIG, parseGoogleMapsAddress, type GoogleMapsAddress} from '@/lib/googleMaps';
import type {Address} from '@/types';

interface AddressAutocompleteProps {
  onSelect: (address: Partial<Address>) => void;
  onError?: (error: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const libraries: 'places'[] = ['places'];

export function AddressAutocomplete({
  onSelect,
  onError,
  placeholder = 'ابدأ بكتابة عنوانك...',
  className = '',
  disabled = false,
}: AddressAutocompleteProps) {
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {isLoaded, loadError} = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries,
    language: GOOGLE_MAPS_CONFIG.language,
    region: GOOGLE_MAPS_CONFIG.region,
  });

  const onLoad = useCallback((autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  }, []);

  const buildAddressLine = useCallback((parsed: Partial<GoogleMapsAddress>): string => {
    const parts: string[] = [];
    if (parsed.streetNumber && parsed.street) {
      parts.push(`${parsed.streetNumber} ${parsed.street}`);
    } else if (parsed.street) {
      parts.push(parsed.street);
    }
    if (parsed.neighborhood) {
      parts.push(parsed.neighborhood);
    }
    return parts.join('، ');
  }, []);

  const onPlaceChanged = useCallback(() => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();

    if (!place || !place.address_components) {
      onError?.('لم يتم العثور على عنوان. يرجى المحاولة مرة أخرى.');
      return;
    }

    const parsed = parseGoogleMapsAddress(place.address_components);

    const addressData: Partial<Address> = {
      address1: buildAddressLine(parsed),
      city: parsed.city ?? '',
      state: parsed.governorate ?? parsed.city ?? '',
      postalCode: parsed.postalCode ?? '',
      country: parsed.country ?? 'الكويت',
    };

    onSelect(addressData);
  }, [onSelect, onError, buildAddressLine]);

  if (loadError) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
        <p>خطأ في تحميل خرائط جوجل. يرجى تحديث الصفحة.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-2 px-4 py-3 bg-stone-100 rounded-lg text-stone-500">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>جاري تحميل خدمة العناوين...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <Autocomplete
          onLoad={onLoad}
          onPlaceChanged={onPlaceChanged}
          options={{
            componentRestrictions: GOOGLE_MAPS_CONFIG.componentRestrictions,
            types: ['address'],
            bounds: new google.maps.LatLngBounds(
              {
                lat: GOOGLE_MAPS_CONFIG.countryRestriction.bounds.south,
                lng: GOOGLE_MAPS_CONFIG.countryRestriction.bounds.west,
              },
              {
                lat: GOOGLE_MAPS_CONFIG.countryRestriction.bounds.north,
                lng: GOOGLE_MAPS_CONFIG.countryRestriction.bounds.east,
              }
            ),
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            disabled={disabled}
            className="w-full pr-10 pl-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent text-right bg-white disabled:bg-stone-100 disabled:cursor-not-allowed"
            dir="rtl"
          />
        </Autocomplete>
      </div>
      <p className="mt-2 text-xs text-stone-500 text-right" dir="rtl">
        ابدأ بكتابة عنوانك واختر من الاقتراحات
      </p>
    </div>
  );
}
