import { describe, it, expect } from 'vitest'
import { deriveSafeWallet } from '@/lib/derive-wallet'

describe('deriveSafeWallet', () => {
  it('derives the correct Safe wallet for a known EOA', () => {
    const eoa = '0x802f71cBf691D4623374E8ec37e32e26d5f74d87'
    const expected = '0x49674eDa070C172E9bfE3984Fd5f63B2Af96e7AE'
    expect(deriveSafeWallet(eoa)).toBe(expected)
  })

  it('produces different wallets for different EOAs', () => {
    const a = deriveSafeWallet('0x0000000000000000000000000000000000000001')
    const b = deriveSafeWallet('0x0000000000000000000000000000000000000002')
    expect(a).not.toBe(b)
  })

  it('returns a valid 42-char address', () => {
    const result = deriveSafeWallet('0x802f71cBf691D4623374E8ec37e32e26d5f74d87')
    expect(result).toMatch(/^0x[a-fA-F0-9]{40}$/)
  })
})
