/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {RouterProvider} from 'react-router-dom';
import {QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import {router} from './routes';
import {ErrorBoundary, ToastProvider, ToastContainer} from '@/components/common';
import {queryClient} from '@/lib/queryClient';

const isDevelopment = import.meta.env.DEV;

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <ToastProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </ToastProvider>
      </ErrorBoundary>
      {isDevelopment && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
