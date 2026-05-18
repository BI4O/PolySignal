import { createPublicClient, http } from 'viem'
import { polygon } from 'viem/chains'
import { deriveSafeWallet } from '@/lib/derive-wallet'

const PUSD = '0xC011a7E12a19f7B1f670d46F03B03f3342E82DFB'
const ABI = [{ name: 'balanceOf', type: 'function', inputs: [{ name: 'account', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] }] as const

const client = createPublicClient({
  chain: polygon,
  transport: http(process.env.POLYGON_RPC_URL!),
})

export async function POST(request: Request) {
  const body = await request.json()

  try {
    // If EOA is given, derive the Safe wallet and query its balance
    if (body.eoa) {
      const safeWallet = deriveSafeWallet(body.eoa)
      const result = await client.readContract({
        address: PUSD,
        abi: ABI,
        functionName: 'balanceOf',
        args: [safeWallet],
      })
      return Response.json({ balance: Number(result) / 1_000_000, wallet: safeWallet })
    }

    // Otherwise query multiple addresses via multicall
    const { addresses } = body
    if (!Array.isArray(addresses) || addresses.length === 0) {
      return Response.json({ balance: 0 })
    }

    const results = await client.multicall({
      contracts: addresses.map((addr: string) => ({
        address: PUSD,
        abi: ABI,
        functionName: 'balanceOf',
        args: [addr as `0x${string}`],
      })),
    })

    const total = results.reduce((sum, r) => {
      if (r.status === 'success' && r.result) {
        return sum + Number(r.result) / 1_000_000
      }
      return sum
    }, 0)

    return Response.json({ balance: total })
  } catch {
    return Response.json({ balance: 0 })
  }
}
