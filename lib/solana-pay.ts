"use client"

import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, TransactionInstruction } from "@solana/web3.js"
import { useToast } from "@/components/ui/use-toast"
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress, createAssociatedTokenAccountInstruction, createTransferInstruction } from "@solana/spl-token"


const MERCHANT_WALLET = new PublicKey("8ZNnKDZFP5MBLMpQcQCQBtEWYS6xNfJXLbW7jjwQ2jLU")

const USDC_MINT = new PublicKey("Es9vMFrzrA4kZ2kTpsuRWpuNzX6b2k6agjHgNs26T1G")

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

      // Find or create associated token accounts for USDC
      const userUsdcAta = await getAssociatedTokenAddress(
        USDC_MINT,
        publicKey,
      )
      const merchantUsdcAta = await getAssociatedTokenAddress(
        USDC_MINT,
        MERCHANT_WALLET,
      )

      // Check if merchant's ATA exists
      const merchantAtaInfo = await connection.getAccountInfo(merchantUsdcAta)
      if (!merchantAtaInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            merchantUsdcAta,
            MERCHANT_WALLET,
            USDC_MINT,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        )
      }

      // Check if user's ATA exists
      const userAtaInfo = await connection.getAccountInfo(userUsdcAta)
      if (!userAtaInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            publicKey, // payer
            userUsdcAta,
            publicKey,
            USDC_MINT,
            TOKEN_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        )
      }

      // USDC has 6 decimals
      const usdcAmount = Math.round(amount * 1_000_000)

      // Transfer USDC
      transaction.add(
        createTransferInstruction(
          userUsdcAta,
          merchantUsdcAta,
          publicKey,
          usdcAmount,
          [],
          TOKEN_PROGRAM_ID
        )
      )

      // Add memo
      transaction.add(
        new TransactionInstruction({
          keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
          data: Buffer.from(memo, "utf-8"),
          programId: new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"),
        })
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
      if (
        error?.name === "WalletSendTransactionError" ||
        (error instanceof Error && error.message.includes("User rejected the request"))
      ) {
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
          errorMessage = "Insufficient USDC balance to complete the transaction"
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
