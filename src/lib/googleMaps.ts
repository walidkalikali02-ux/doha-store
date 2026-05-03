/// <reference types="google.maps" />

export const GOOGLE_MAPS_CONFIG = {
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  placesApiKey:
    import.meta.env.VITE_GOOGLE_PLACES_API_KEY ?? import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',
  geocodingApiKey:
    import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY ?? import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '',

  libraries: ['places', 'geocoding'] as const,

  countryRestriction: {
    country: 'kw',
    bounds: {
      north: 30.1035,
      south: 28.5244,
      east: 48.6319,
      west: 46.553,
    },
  },

  defaultLocation: {
    lat: 29.3759,
    lng: 47.9774,
  },

  defaultZoom: 12,

  componentRestrictions: {
    country: ['kw'],
  },

  language: 'ar',
  region: 'kw',

  placeFields: [
    'formatted_address',
    'geometry',
    'name',
    'place_id',
    'address_components',
    'types',
    'international_phone_number',
  ] as const,

  autocompletionRequest: {
    componentRestrictions: {
      country: 'kw',
    },
    types: ['address', 'geocode'],
    language: 'ar',
  },
};

export function isGoogleMapsConfigured(): boolean {
  return Boolean(GOOGLE_MAPS_CONFIG.apiKey);
}

export function getGoogleMapsApiKey(): string {
  return GOOGLE_MAPS_CONFIG.apiKey;
}

export function getPlacesApiKey(): string {
  return GOOGLE_MAPS_CONFIG.placesApiKey;
}

export function getGeocodingApiKey(): string {
  return GOOGLE_MAPS_CONFIG.geocodingApiKey;
}

export interface GoogleMapsAddress {
  streetNumber?: string;
  street?: string;
  neighborhood?: string;
  city?: string;
  governorate?: string;
  country?: string;
  postalCode?: string;
  formattedAddress: string;
  placeId: string;
  lat: number;
  lng: number;
}

export function parseGoogleMapsAddress(
  addressComponents: google.maps.GeocoderAddressComponent[]
): Partial<GoogleMapsAddress> {
  const result: Partial<GoogleMapsAddress> = {};

  for (const component of addressComponents) {
    const types = component.types;

    if (types.includes('street_number')) {
      result.streetNumber = component.long_name;
    } else if (types.includes('route')) {
      result.street = component.long_name;
    } else if (types.includes('sublocality') || types.includes('neighborhood')) {
      result.neighborhood = component.long_name;
    } else if (types.includes('locality')) {
      result.city = component.long_name;
    } else if (types.includes('administrative_area_level_1')) {
      result.governorate = component.long_name;
    } else if (types.includes('country')) {
      result.country = component.long_name;
    } else if (types.includes('postal_code')) {
      result.postalCode = component.long_name;
    }
  }

  return result;
}

export function formatAddressForKuwait(address: GoogleMapsAddress): string {
  const parts: string[] = [];

  if (address.streetNumber && address.street) {
    parts.push(`${address.streetNumber} ${address.street}`);
  } else if (address.street) {
    parts.push(address.street);
  }

  if (address.neighborhood) {
    parts.push(address.neighborhood);
  }

  if (address.city) {
    parts.push(address.city);
  }

  if (address.governorate && address.governorate !== address.city) {
    parts.push(address.governorate);
  }

  if (address.postalCode) {
    parts.push(address.postalCode);
  }

  parts.push('الكويت');

  return parts.join('، ');
}

export const KUWAIT_GOVERNORATES = [
  {nameAr: 'محافظة العاصمة', nameEn: 'Capital Governorate'},
  {nameAr: 'محافظة الأحمدي', nameEn: 'Ahmadi Governorate'},
  {nameAr: 'محافظة حولي', nameEn: 'Hawalli Governorate'},
  {nameAr: 'محافظة الفروانية', nameEn: 'Farwaniya Governorate'},
  {nameAr: 'محافظة الجهراء', nameEn: 'Jahra Governorate'},
  {nameAr: 'محافظة مبارك الكبير', nameEn: 'Mubarak Al-Kabeer Governorate'},
];

export function getGovernorateFromArabic(
  nameAr: string
): (typeof KUWAIT_GOVERNORATES)[number] | undefined {
  return KUWAIT_GOVERNORATES.find(g => g.nameAr === nameAr);
}

export function getGovernorateFromEnglish(
  nameEn: string
): (typeof KUWAIT_GOVERNORATES)[number] | undefined {
  return KUWAIT_GOVERNORATES.find(g => g.nameEn === nameEn);
}
