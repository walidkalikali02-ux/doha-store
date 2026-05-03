import {Outlet} from 'react-router-dom';

export function CheckoutLayout() {
  return (
    <div className="min-h-screen bg-brand-gray-50">
      <Outlet />
    </div>
  );
}
