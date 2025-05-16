"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from "@solana/web3.js"
import { useToast } from "@/components/ui/use-toast"


const MERCHANT_WALLET = new PublicKey("8ZNnKDZFP5MBLMpQcQCQBtEWYS6xNfJXLbW7jjwQ2jLU")

export const useSolanaPay = () => {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const { toast } = useToast()


  const makePayment = async (amount: number, memo = "SolMart Purchase") => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a payment",
        variant: "destructive",
      })
      return false
    }

    try {
    
      const transaction = new Transaction()

     
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: MERCHANT_WALLET,
          lamports: Math.round(amount * LAMPORTS_PER_SOL),
        }),
      )

     
      transaction.add(
        new TransactionInstruction({
          keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
          data: Buffer.from(memo, "utf-8"),
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        }),
      )

   
      const { blockhash } = await connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = publicKey

   
      const signature = await sendTransaction(transaction, connection)

   
      const confirmation = await connection.confirmTransaction(signature, "confirmed")

      if (confirmation.value.err) {
        throw new Error("Transaction failed")
      }

      toast({
        title: "Payment successful!",
        description: `Transaction signature: ${signature.substring(0, 8)}...`,
      })

      return true
    } catch (error: any) {
    
      if (error?.name === "WalletSendTransactionError" || 
          (error instanceof Error && error.message.includes("User rejected the request"))) {
        toast({
          title: "Transaction cancelled",
          description: "You have cancelled the transaction. No payment was made.",
          variant: "default",
        })
        return false
      }

      let errorMessage = "An unexpected error occurred"
      
      if (error instanceof Error) {
        if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient SOL balance to complete the transaction"
        } else if (error.message.includes("Transaction failed")) {
          errorMessage = "The transaction failed to confirm on the network"
        } else {
          errorMessage = error.message
        }
      }

      toast({
        title: "Payment failed",
        description: errorMessage,
        variant: "destructive",
      })
      
      return false
    }
  }

  return { makePayment }
}
