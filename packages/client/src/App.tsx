import './global.css';
import { useState } from 'react';
import { QueryClientProvider, QueryClient } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { getFetch } from '@trpc/client';
import { loggerLink } from '@trpc/client/links/loggerLink';
import { httpBatchLink } from '@trpc/client/links/httpBatchLink';
import { trpc } from './utils/trpc';

function AppContent() {
  const hello = trpc.useQuery(['hello']);
  return (
    <div className='container mx-auto bg-ct-dark-200 rounded-xl shadow border p-8 m-10'>
      <p className='text-3xl text-gray-700 font-bold mb-5'>Welcome!</p>
      <p className='text-ct-blue-600 text-lg'>{hello.data?.message}</p>
    </div>
  );
}

function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
          },
        },
      })
  );
  const url = 'http://localhost:8000/api/trpc';
  const links = [
    loggerLink(),
    httpBatchLink({
      maxBatchSize: 10,
      url,
    }),
  ];
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links,
      fetch: async (input, init?) => {
        const fetch = getFetch();
        return fetch(input, {
          ...init,
          credentials: 'include',
        });
      },
    })
  );
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
