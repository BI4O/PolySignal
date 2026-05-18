import { getCreate2Address, keccak256, encodeAbiParameters } from 'viem'

// Polymarket Safe wallet constants (Polygon)
const SAFE_FACTORY = '0xaacfeea03eb1561c4e67d661e40682bd20e3541b'
const SAFE_INIT_CODE_HASH = '0x2bce2127ff07fb632d16c8347c4ebf501f4841168bed00d9e6ef715ddb6fcecf'

/** Derives a Polymarket Safe wallet address from a user's EOA. */
export function deriveSafeWallet(eoa: string): `0x${string}` {
  const salt = keccak256(encodeAbiParameters([{ type: 'address' }], [eoa as `0x${string}`]))
  return getCreate2Address({ from: SAFE_FACTORY, salt, bytecodeHash: SAFE_INIT_CODE_HASH })
}
