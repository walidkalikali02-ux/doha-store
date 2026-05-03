import type {UserRole, ProductType, OrderStatus, RoastLevel, GrindOption} from '@/types';

export function isUserRole(value: unknown): value is UserRole {
  return (
    typeof value === 'string' &&
    ['guest', 'customer', 'wholesale', 'admin', 'super_admin'].includes(value)
  );
}

export function isProductType(value: unknown): value is ProductType {
  return (
    typeof value === 'string' &&
    ['coffee', 'equipment', 'accessories', 'merchandise', 'gift'].includes(value)
  );
}

export function isOrderStatus(value: unknown): value is OrderStatus {
  return (
    typeof value === 'string' &&
    ['pending', 'processing', 'roasting', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(
      value
    )
  );
}

export function isRoastLevel(value: unknown): value is RoastLevel {
  return typeof value === 'string' && ['light', 'medium', 'medium-dark', 'dark'].includes(value);
}

export function isGrindOption(value: unknown): value is GrindOption {
  return (
    typeof value === 'string' &&
    [
      'whole_bean',
      'espresso',
      'filter',
      'french_press',
      'pour_over',
      'turkish',
      'cold_brew',
    ].includes(value)
  );
}

export function assertNonNull<T>(value: T | null | undefined, message?: string): T {
  if (value === null || value === undefined) {
    throw new Error(message ?? 'Expected non-null value');
  }
  return value;
}

export function hasOwnProperty<X extends Record<string, unknown>, Y extends PropertyKey>(
  obj: X,
  prop: Y
): obj is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}
