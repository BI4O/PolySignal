import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, polygon } from '@reown/appkit/networks'
import type { AppKitNetwork } from '@reown/appkit/networks'

const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID!

export const networks = [mainnet, polygon] as [AppKitNetwork, ...AppKitNetwork[]]

export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
})

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  metadata: {
    name: 'Polymarket Signals',
    description: 'AI-powered Polymarket prediction market analysis',
    url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    icons: [],
  },
  features: {
    email: false,
    socials: ['google'],
    emailShowWallets: false,
  },
  allWallets: 'HIDE',
})
