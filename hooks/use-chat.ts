import { useState, useCallback } from 'react';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

const predefinedResponses = {
  'connect wallet': 'To connect your Solana wallet, click the "Connect Wallet" button in the top right corner. We support Phantom, Solflare, and other Solana wallets.',
  'how to buy': 'To purchase items on SolMart: \n1. Connect your Solana wallet\n2. Browse products and click on one you like\n3. Click "Add to Cart"\n4. Go to cart and click "Checkout"\n5. Confirm the transaction in your wallet',
  'payment methods': 'We accept SOL (Solana) and USDC on the Solana network for all purchases.',
  'shipping': 'Shipping information and tracking will be provided via email after your purchase is confirmed on the Solana blockchain.',
  'return policy': 'We have a 14-day return policy. Please contact our support team with your order details to initiate a return.',
  'seller registration': 'To become a seller on SolMart:\n1. Connect your Solana wallet\n2. Go to the "Become a Seller" page\n3. Fill out the registration form\n4. Pay a small registration fee in SOL\n5. Start listing your products!',
  'help': 'I can help you with:\n- Connecting your wallet\n- Making purchases\n- Payment methods\n- Shipping information\n- Returns\n- Seller registration\n\nJust ask me about any of these topics!',
};

const findBestMatch = (input: string): string => {
  input = input.toLowerCase();
  
  // Check for exact matches first
  for (const [key, value] of Object.entries(predefinedResponses)) {
    if (input.includes(key)) {
      return value;
    }
  }

  // If no exact match, check if the input contains certain keywords
  if (input.includes('wallet')) {
    return predefinedResponses['connect wallet'];
  }
  if (input.includes('purchase') || input.includes('checkout')) {
    return predefinedResponses['how to buy'];
  }
  if (input.includes('pay')) {
    return predefinedResponses['payment methods'];
  }
  if (input.includes('ship')) {
    return predefinedResponses['shipping'];
  }
  if (input.includes('return')) {
    return predefinedResponses['return policy'];
  }
  if (input.includes('sell')) {
    return predefinedResponses['seller registration'];
  }

  // Default response
  return predefinedResponses['help'];
};

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content,
        role: 'user',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, userMessage]);

      // Simulate a small delay for more natural feeling
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get predefined response
      const response = findBestMatch(content);

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError('Failed to send message. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  };
}