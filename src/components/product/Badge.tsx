interface BadgeProps {
  variant: 'new' | 'sale' | 'limited' | 'organic' | 'single_origin';
}

export function Badge({variant}: BadgeProps) {
  const styles = {
    new: 'bg-green-500 text-white',
    sale: 'bg-red-500 text-white',
    limited: 'bg-purple-500 text-white',
    organic: 'bg-green-600 text-white',
    single_origin: 'bg-amber-600 text-white',
  };

  const labels = {
    new: 'New',
    sale: 'Sale',
    limited: 'Limited',
    organic: 'Organic',
    single_origin: 'Single Origin',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded ${styles[variant]}`}>
      {labels[variant]}
    </span>
  );
}
