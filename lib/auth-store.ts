"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

type SellerInfo = {
  storeName: string
  storeDescription: string
  businessAddress: string
  phoneNumber: string
}

type User = {
  id: string
  name: string
  email: string
  isSeller: boolean
  sellerInfo?: SellerInfo
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string, isSeller: boolean, sellerInfo?: SellerInfo) => Promise<boolean>
  logout: () => void
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        
        if (email && password) {
       
          await new Promise((resolve) => setTimeout(resolve, 500))

          set({
            user: {
              id: "user1",
              name: "John Doe",
              email,
              isSeller: true,
            },
            isAuthenticated: true,
          })
          return true
        }
        return false
      },

      register: async (name: string, email: string, password: string, isSeller: boolean, sellerInfo?: SellerInfo) => {
        
        if (name && email && password) {
         
          await new Promise((resolve) => setTimeout(resolve, 500))

          set({
            user: {
              id: "user1",
              name,
              email,
              isSeller,
              ...(isSeller && sellerInfo && { sellerInfo }),
            },
            isAuthenticated: true,
          })
          return true
        }
        return false
      },

      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: "solmart-auth",
    },
  ),
)
