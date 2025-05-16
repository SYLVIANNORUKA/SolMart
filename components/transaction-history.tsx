"use client"

import { useState, useEffect } from "react"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import type { ConfirmedSignatureInfo, ParsedTransactionWithMeta } from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowDownUp, ExternalLink } from "lucide-react"

export function TransactionHistory() {
  const { publicKey } = useWallet()
  const { connection } = useConnection()
  const [transactions, setTransactions] = useState<(ParsedTransactionWithMeta | null)[]>([])
  const [signatures, setSignatures] = useState<ConfirmedSignatureInfo[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!publicKey || !connection) return

      setIsLoading(true)
      try {
      
        const sigs = await connection.getSignaturesForAddress(publicKey, { limit: 5 })
        setSignatures(sigs)

     
        const txPromises = sigs.map((sig) => connection.getParsedTransaction(sig.signature))
        const txs = await Promise.all(txPromises)
        setTransactions(txs)
      } catch (error) {
        console.error("Error fetching transactions:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (publicKey) {
      fetchTransactions()
    }
  }, [publicKey, connection])

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString()
  }

  const formatSignature = (signature: string) => {
    return `${signature.slice(0, 4)}...${signature.slice(-4)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your recent transactions on Solana</CardDescription>
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
        ) : signatures.length > 0 ? (
          <div className="space-y-4">
            {signatures.map((sig, index) => (
              <div key={sig.signature} className="flex items-start justify-between border-b pb-4 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <ArrowDownUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Transaction {formatSignature(sig.signature)}</p>
                    <p className="text-sm text-muted-foreground">
                      {sig.blockTime ? formatDate(sig.blockTime) : "Processing..."}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <a
                    href={`https://explorer.solana.com/tx/${sig.signature}?cluster=devnet`}
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
