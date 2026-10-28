"use client"

import { useState, useEffect } from "react"
import type { Horizon } from "@stellar/stellar-sdk"
import { useWallet, horizon, STELLAR_EXPLORER_URL } from "@/components/wallet-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDownUp, ExternalLink } from "lucide-react"

export function TransactionHistory() {
  const { publicKey } = useWallet()
  const [transactions, setTransactions] = useState<Horizon.ServerApi.TransactionRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey) return

      setIsLoading(true)
      try {
        const page = await horizon.transactions().forAccount(publicKey).order("desc").limit(5).call()
        setTransactions(page.records)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (publicKey) {
      fetchTransactions()
    }
  }, [publicKey])

  if (!publicKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Connect your wallet to view your transaction history.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatHash = (hash: string) => {
    return `${hash.slice(0, 4)}...${hash.slice(-4)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your recent transactions on Stellar</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Loading state
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.hash} className="flex items-start justify-between border-b pb-4 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <ArrowDownUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Transaction {formatHash(tx.hash)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`${STELLAR_EXPLORER_URL}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                  >
                    View
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No transactions found for this wallet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
