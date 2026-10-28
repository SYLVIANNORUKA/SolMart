"use client"

import { type FC, type ReactNode, createContext, useCallback, useContext, useEffect, useState } from "react"
import {
  isConnected as freighterIsConnected,
  isAllowed as freighterIsAllowed,
  requestAccess,
  getAddress,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api"
import { Horizon, Networks } from "@stellar/stellar-sdk"
import { Wallet, Copy, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export const STELLAR_NETWORK_PASSPHRASE = Networks.TESTNET
export const HORIZON_URL = "https://horizon-testnet.stellar.org"
export const STELLAR_EXPLORER_URL = "https://stellar.expert/explorer/testnet"

export const horizon = new Horizon.Server(HORIZON_URL)

interface WalletContextValue {
  publicKey: string | null
  connected: boolean
  connecting: boolean
  connect: () => Promise<void>
  disconnect: () => void
  signTransaction: (xdr: string) => Promise<string>
}

const WalletContext = createContext<WalletContextValue | null>(null)

const DISCONNECTED_KEY = "stellar-wallet-disconnected"

interface WalletContextProviderProps {
  children: ReactNode
}

export const WalletContextProvider: FC<WalletContextProviderProps> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [connecting, setConnecting] = useState(false)

  // Reconnect silently if the user previously granted access to this site
  useEffect(() => {
    const autoConnect = async () => {
      if (localStorage.getItem(DISCONNECTED_KEY)) return
      const { isConnected } = await freighterIsConnected()
      if (!isConnected) return
      const { isAllowed } = await freighterIsAllowed()
      if (!isAllowed) return
      const { address, error } = await getAddress()
      if (!error && address) setPublicKey(address)
    }
    autoConnect().catch(() => {})
  }, [])

  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      const { isConnected } = await freighterIsConnected()
      if (!isConnected) {
        window.open("https://www.freighter.app/", "_blank", "noopener,noreferrer")
        throw new Error("Freighter wallet is not installed")
      }
      const { address, error } = await requestAccess()
      if (error) throw new Error(error.message)
      localStorage.removeItem(DISCONNECTED_KEY)
      setPublicKey(address)
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    localStorage.setItem(DISCONNECTED_KEY, "1")
    setPublicKey(null)
  }, [])

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!publicKey) throw new Error("Wallet not connected")
      const { signedTxXdr, error } = await freighterSignTransaction(xdr, {
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
        address: publicKey,
      })
      if (error) throw new Error(error.message || "User rejected the request")
      return signedTxXdr
    },
    [publicKey],
  )

  return (
    <WalletContext.Provider
      value={{ publicKey, connected: !!publicKey, connecting, connect, disconnect, signTransaction }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) throw new Error("useWallet must be used within a WalletContextProvider")
  return context
}

export const shortenAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(-4)}`

export function WalletMultiButton({ className }: { className?: string }) {
  const { publicKey, connecting, connect, disconnect } = useWallet()

  if (!publicKey) {
    return (
      <Button className={cn(className)} disabled={connecting} onClick={() => connect().catch(console.error)}>
        <Wallet className="mr-2 h-4 w-4" />
        {connecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className={cn(className)}>
          <Wallet className="mr-2 h-4 w-4" />
          {shortenAddress(publicKey)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(publicKey)}>
          <Copy className="mr-2 h-4 w-4" />
          Copy address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={disconnect}>
          <LogOut className="mr-2 h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
