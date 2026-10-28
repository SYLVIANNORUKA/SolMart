"use client"

import { Asset, Memo, Operation, StrKey, TransactionBuilder, BASE_FEE } from "@stellar/stellar-sdk"
import { useWallet, horizon, STELLAR_NETWORK_PASSPHRASE } from "@/components/wallet-provider"
import { useToast } from "@/components/ui/use-toast"

// Stellar account that receives payments. Set NEXT_PUBLIC_MERCHANT_ADDRESS in .env.local
const MERCHANT_ADDRESS = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS || ""

// Stellar text memos are limited to 28 bytes
const MAX_MEMO_BYTES = 28

const truncateMemo = (memo: string) => {
  const encoder = new TextEncoder()
  let result = memo
  while (encoder.encode(result).length > MAX_MEMO_BYTES) {
    result = result.slice(0, -1)
  }
  return result
}

export const useStellarPay = () => {
  const { publicKey, signTransaction } = useWallet()
  const { toast } = useToast()

  // Returns the transaction hash on success, or false if the payment did not go through
  const makePayment = async (amount: number, memo = "Orbita Purchase"): Promise<string | false> => {
    if (!publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a payment",
        variant: "destructive",
      })
      return false
    }

    if (!StrKey.isValidEd25519PublicKey(MERCHANT_ADDRESS)) {
      toast({
        title: "Payments unavailable",
        description: "The store's Stellar merchant address is not configured.",
        variant: "destructive",
      })
      return false
    }

    try {
      const account = await horizon.loadAccount(publicKey)

      // Pay in native XLM (7 decimal places)
      const transaction = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
      })
        .addOperation(
          Operation.payment({
            destination: MERCHANT_ADDRESS,
            asset: Asset.native(),
            amount: amount.toFixed(7),
          }),
        )
        .addMemo(Memo.text(truncateMemo(memo)))
        .setTimeout(180)
        .build()

      const signedXdr = await signTransaction(transaction.toXDR())
      const signedTransaction = TransactionBuilder.fromXDR(signedXdr, STELLAR_NETWORK_PASSPHRASE)
      const result = await horizon.submitTransaction(signedTransaction)

      if (!result.successful) {
        throw new Error("Transaction failed")
      }

      toast({
        title: "Payment successful!",
        description: `Transaction hash: ${result.hash.substring(0, 8)}...`,
      })

      return result.hash
    } catch (error: any) {
      if (error instanceof Error && /reject|declined|denied/i.test(error.message)) {
        toast({
          title: "Transaction cancelled",
          description: "You have cancelled the transaction. No payment was made.",
          variant: "default",
        })
        return false
      }

      let errorMessage = "An unexpected error occurred"
      const resultCodes = error?.response?.data?.extras?.result_codes
      if (resultCodes?.operations?.includes("op_underfunded")) {
        errorMessage = "Insufficient XLM balance to complete the transaction"
      } else if (resultCodes?.operations?.includes("op_no_destination")) {
        errorMessage = "The merchant account does not exist on the Stellar network"
      } else if (error?.response?.status === 404) {
        errorMessage = "Your wallet account is not funded on Stellar Testnet. Fund it with Friendbot first."
      } else if (error instanceof Error) {
        errorMessage = error.message.includes("Transaction failed")
          ? "The transaction failed to confirm on the network"
          : error.message
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
