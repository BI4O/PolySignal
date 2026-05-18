'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react'

type AuthMethod = 'wallet' | 'google' | null

interface AuthContextValue {
  address: string | null
  isConnected: boolean
  authMethod: AuthMethod
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  address: null,
  isConnected: false,
  authMethod: null,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { address, isConnected } = useAppKitAccount()
  const { open } = useAppKit()
  const { disconnect } = useDisconnect()
  const [authMethod, setAuthMethod] = useState<AuthMethod>(null)

  useEffect(() => {
    if (isConnected && address) {
      setAuthMethod('wallet')
    } else {
      setAuthMethod(null)
    }
  }, [isConnected, address])

  const login = useCallback(() => {
    open()
  }, [open])

  const logout = useCallback(() => {
    disconnect()
  }, [disconnect])

  return (
    <AuthContext.Provider value={{ address: address ?? null, isConnected, authMethod, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
