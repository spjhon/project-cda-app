"use client"

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function TanstackContext({ children }: { children: React.ReactNode }) {
  // Solo necesitamos el useState. 
  // La función dentro se ejecuta una vez para inicializar el cliente.
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 0,
        
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}