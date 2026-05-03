import {useState} from 'react';
import {Input} from '@/components/common/Input';
import type {Address} from '@/types';

interface AddressFormProps {
  address?: Partial<Address>;
  onChange: (address: Partial<Address>) => void;
  onSubmit?: (address: Address) => void;
  submitLabel?: string;
  showSubmit?: boolean;
}

export function AddressForm({
  address = {},
  onChange,
  onSubmit,
  submitLabel = 'Save Address',
  showSubmit = false,
}: AddressFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!address.firstName) newErrors.firstName = 'First name is required';
    if (!address.lastName) newErrors.lastName = 'Last name is required';
    if (!address.address1) newErrors.address1 = 'Address is required';
    if (!address.city) newErrors.city = 'City is required';
    if (!address.state) newErrors.state = 'State is required';
    if (!address.postalCode) newErrors.postalCode = 'ZIP code is required';
    if (!address.country) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && onSubmit) {
      onSubmit(address as Address);
    }
  };

  const handleChange = (field: keyof Address, value: string) => {
    onChange({...address, [field]: value});
    if (errors[field]) {
      setErrors({...errors, [field]: ''});
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          required
          value={address.firstName ?? ''}
          onChange={e => handleChange('firstName', e.target.value)}
          error={errors.firstName ?? ''}
        />
        <Input
          label="Last Name"
          required
          value={address.lastName ?? ''}
          onChange={e => handleChange('lastName', e.target.value)}
          error={errors.lastName ?? ''}
        />
      </div>

      <Input
        label="Address Line 1"
        required
        placeholder="Street address"
        value={address.address1 ?? ''}
        onChange={e => handleChange('address1', e.target.value)}
        error={errors.address1 ?? ''}
      />

      <Input
        label="Address Line 2 (optional)"
        placeholder="Apartment, suite, etc."
        value={address.address2 ?? ''}
        onChange={e => handleChange('address2', e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          required
          value={address.city ?? ''}
          onChange={e => handleChange('city', e.target.value)}
          error={errors.city ?? ''}
        />
        <Input
          label="State/Province"
          required
          value={address.state ?? ''}
          onChange={e => handleChange('state', e.target.value)}
          error={errors.state ?? ''}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="ZIP/Postal Code"
          required
          value={address.postalCode ?? ''}
          onChange={e => handleChange('postalCode', e.target.value)}
          error={errors.postalCode ?? ''}
        />
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">
            Country <span className="text-red-500">*</span>
          </label>
          <select
            value={address.country || 'US'}
            onChange={e => handleChange('country', e.target.value)}
            className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
          </select>
          {errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
        </div>
      </div>

      <Input
        label="Phone (optional)"
        type="tel"
        placeholder="+1 (555) 555-5555"
        value={address.phone || ''}
        onChange={e => handleChange('phone', e.target.value)}
      />

      {showSubmit && (
        <button
          type="submit"
          className="w-full py-3 bg-amber-600 text-white rounded-md font-medium hover:bg-amber-700 transition-colors"
        >
          {submitLabel}
        </button>
      )}
    </form>
  );
}
