"use client"

import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"


const WalletMultiButtonDynamic = dynamic(
  () => import("@solana/wallet-adapter-react-ui").then(mod => mod.WalletMultiButton),
  { ssr: false }
)

export function Navbar() {
  const { connected } = useWallet()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">SolMart</span>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary">Home</Link>
            <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary">Products</Link>
            <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary">Dashboard</Link>
            <Link href="/seller/signup" className="text-sm font-medium transition-colors hover:text-primary">Become a Seller</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>
          </Link>

          <WalletMultiButtonDynamic className="!bg-primary hover:!bg-primary/90 rounded-md h-9 !justify-center border border-primary/20 shadow-sm" />

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

   
      <div className={cn("container md:hidden", isMenuOpen ? "block" : "hidden")}>
        <nav className="flex flex-col space-y-3 pb-3">
          <Link href="/" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link href="/products" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMenuOpen(false)}>Products</Link>
          <Link href="/dashboard" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
          <Link href="/seller/signup" className="text-sm font-medium transition-colors hover:text-primary" onClick={() => setIsMenuOpen(false)}>Become a Seller</Link>
        </nav>
      </div>
    </header>
  )
}
