import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from "@/lib/supabase"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: "groceries" | "electronics" | "fashion"
  seller: {
    id: string
    name: string
    rating: number
  }
}

export type CartItem = {
  product: Product
  quantity: number
}


export const products: Product[] = [
  {
    id: "1",
    name: "Organic Apples",
    description: "Fresh organic apples from local farms. Perfect for healthy snacking or baking.",
    price: 0.005,
    image:
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "groceries",
    seller: {
      id: "seller1",
      name: "Green Farms",
      rating: 4.8,
    },
  },
  {
    id: "2",
    name: "Wireless Earbuds",
    description: "High-quality wireless earbuds with noise cancellation and long battery life.",
    price: 0.05,
    image:
      "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "electronics",
    seller: {
      id: "seller2",
      name: "TechGadgets",
      rating: 4.6,
    },
  },
  {
    id: "3",
    name: "Cotton T-Shirt",
    description: "Comfortable cotton t-shirt available in various colors and sizes.",
    price: 0.02,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "fashion",
    seller: {
      id: "seller3",
      name: "StyleHub",
      rating: 4.5,
    },
  },
  {
    id: "4",
    name: "Organic Milk",
    description: "Fresh organic milk from grass-fed cows. No hormones or antibiotics.",
    price: 0.003,
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "groceries",
    seller: {
      id: "seller1",
      name: "Green Farms",
      rating: 4.8,
    },
  },
  {
    id: "5",
    name: "Smart Watch",
    description: "Feature-rich smart watch with health tracking and notifications.",
    price: 0.08,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "electronics",
    seller: {
      id: "seller2",
      name: "TechGadgets",
      rating: 4.6,
    },
  },
  {
    id: "6",
    name: "Running Shoes",
    description: "Lightweight and comfortable running shoes with excellent support.",
    price: 0.04,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "fashion",
    seller: {
      id: "seller3",
      name: "StyleHub",
      rating: 4.5,
    },
  },
  {
    id: "7",
    name: "Fresh Bread",
    description: "Artisanal bread baked daily with organic ingredients.",
    price: 0.002,
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "groceries",
    seller: {
      id: "seller4",
      name: "Artisan Bakery",
      rating: 4.9,
    },
  },
  {
    id: "8",
    name: "Laptop",
    description: "Powerful laptop for work and entertainment with long battery life.",
    price: 0.5,
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "electronics",
    seller: {
      id: "seller2",
      name: "TechGadgets",
      rating: 4.6,
    },
  },
  {
    id: "9",
    name: "Denim Jeans",
    description: "Classic denim jeans with a comfortable fit and durable construction.",
    price: 0.03,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    category: "fashion",
    seller: {
      id: "seller3",
      name: "StyleHub",
      rating: 4.5,
    },
  },
]


export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}


export function getProductsByCategory(category: string): Product[] {
  if (category === "all") return products
  return products.filter((product) => product.category === category)
}


export function formatSolPrice(price: number): string {
  return `${price.toFixed(3)} SOL`
}

export async function fetchProductsFromSupabase() {
  // Fetch products with seller info (join users table)
  const { data: products, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      description,
      price_usdc,
      image_url,
      category,
      seller_id,
      seller:users(id, username)
    `)

  if (error) throw error
  if (!products) return []

  // Map to UI Product type
  return products.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price_usdc), // You may want to convert USDC to SOL if needed
    image: p.image_url,
    category: p.category,
    seller: {
      id: p.seller?.id || p.seller_id,
      name: p.seller?.username || "Unknown",
      rating: 5, // Placeholder, as rating is not in schema
    },
  }))
}
