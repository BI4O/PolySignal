'use client'

import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiAdapter } from '@/lib/appkit'
import { AuthProvider } from '@/lib/auth-provider'
import { UserDataProvider } from '@/lib/user-data-provider'
import { useState } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <UserDataProvider>
            {children}
          </UserDataProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
