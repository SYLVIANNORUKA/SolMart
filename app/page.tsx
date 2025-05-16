"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import { products } from "@/lib/utils"
import { ShoppingBag, Zap, Shield, ArrowRight, Sparkles, Wallet } from "lucide-react"
import { useEffect, useState } from "react"

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }


  const featuredProducts = products.slice(0, 3)


  const featuredSellers = [
    {
      id: "seller1",
      name: "Green Farms",
      description: "Organic produce from sustainable farms",
      image:
        "https://images.unsplash.com/photo-1595351298020-038700609878?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.8,
    },
    {
      id: "seller2",
      name: "TechGadgets",
      description: "Latest technology at competitive prices",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.6,
    },
    {
      id: "seller3",
      name: "StyleHub",
      description: "Trendy fashion for all seasons",
      image: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      rating: 4.5,
    },
  ]

  return (
    <div className="flex flex-col min-h-screen">
   
      <section className="relative overflow-hidden">
     
        <div className="absolute inset-0 bg-primary/10 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-50"></div>
        </div>

    
        <div className="container relative z-10 px-4 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Sparkles className="mr-1 h-3.5 w-3.5" />
                <span>Decentralized Shopping Experience</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Shop with <span className="text-primary">SOL</span> in our Decentralized Marketplace
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                SolMart brings the power of Solana blockchain to everyday shopping. Connect your wallet and experience
                the future of commerce.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="bg-primary hover:bg-primary/90 cursor-pointer">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Start Shopping
                </Button>
                <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 cursor-pointer">
                  <Wallet className="mr-2 h-5 w-5" />
                  Connect Wallet
                </Button>
              </div>

              <div className="pt-4 grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <p className="text-2xl font-bold">100+</p>
                  <p className="text-sm text-muted-foreground">Products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">50+</p>
                  <p className="text-sm text-muted-foreground">Sellers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">1000+</p>
                  <p className="text-sm text-muted-foreground">Customers</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-primary rounded-2xl blur-2xl opacity-30"></div>
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-2xl">
                <div className="aspect-[4/3] relative">
                  <Image
                    src="https://images.unsplash.com/photo-1607083206968-13611e3d76db"
                    alt="SolMart Shopping Experience"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <p className="font-medium">Featured Collection</p>
                      <p className="text-sm opacity-80">Summer Essentials</p>
                    </div>
                    <Button size="sm" variant="secondary" className="rounded-full" asChild>
                      <Link href="/products">
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

             
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200 w-40">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Fast Transactions</p>
                      <p className="text-xs text-muted-foreground">Under 1 second</p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-24 left-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200 w-40">
                  <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-medium">Secure Payments</p>
                      <p className="text-xs text-muted-foreground">Blockchain protected</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

   
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full h-auto">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"
            ></path>
          </svg>
        </div>
      </section>

   
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Featured Products</h2>
              <p className="text-muted-foreground">Discover our top picks for you</p>
            </div>
            <Link href="/products">
              <Button variant="link" className="mt-4 md:mt-0">
                View all products
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

     
      <section className="py-12 md:py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/products?category=groceries">
              <div className="relative h-[200px] rounded-lg overflow-hidden group">
                <Image
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Groceries"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Groceries</h3>
                </div>
              </div>
            </Link>
            <Link href="/products?category=electronics">
              <div className="relative h-[200px] rounded-lg overflow-hidden group">
                <Image
                  src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Electronics"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Electronics</h3>
                </div>
              </div>
            </Link>
            <Link href="/products?category=fashion">
              <div className="relative h-[200px] rounded-lg overflow-hidden group">
                <Image
                  src="https://images.unsplash.com/photo-1445205170230-053b83016050?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                  alt="Fashion"
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <h3 className="text-white text-2xl font-bold">Fashion</h3>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

    
      <section className="py-12 md:py-16">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl mb-8 text-center">Top Sellers</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredSellers.map((seller) => (
              <div key={seller.id} className="border rounded-lg overflow-hidden">
                <div className="relative h-[150px]">
                  <Image src={seller.image || "/placeholder.svg"} alt={seller.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg">{seller.name}</h3>
                  <div className="flex items-center mt-1 mb-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(seller.rating) ? "text-yellow-500" : "text-gray-300"}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">{seller.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{seller.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-12 md:py-16 bg-muted/50">
        <div className="container px-4 md:px-6">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl mb-8 text-center">How SolMart Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Browse Products</h3>
              <p className="text-muted-foreground">
                Explore our wide range of products across multiple categories from trusted sellers.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
              <p className="text-muted-foreground">
                Connect your Phantom wallet to enable secure and fast transactions on the Solana blockchain.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary text-primary-foreground p-4 rounded-full mb-4">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Purchase</h3>
              <p className="text-muted-foreground">
                Complete your purchase with SOL tokens. All transactions are secure and recorded on the blockchain.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
