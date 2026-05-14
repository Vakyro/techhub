"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "./product-card"
import { getProducts } from "@/lib/supabase-queries"

type FeaturedProduct = {
  id: string
  name: string
  image_url: string
  price: number
  wholesale_price: number | null
  minimum_wholesale_quantity: number | null
  rating: number
  reviews_count: number
  stock: number
  categories: { name: string } | null
}

function getStockStatus(stock: number): "in_stock" | "low_stock" | "out_of_stock" {
  if (stock <= 0) return "out_of_stock"
  if (stock <= 5) return "low_stock"
  return "in_stock"
}

export function FeaturedProducts() {
  const [products, setProducts] = useState<FeaturedProduct[]>([])

  useEffect(() => {
    const loadFeaturedProducts = async () => {
      const response = await getProducts(8, 0)
      if (response.error || !response.data) {
        return
      }

      setProducts(response.data as FeaturedProduct[])
    }

    void loadFeaturedProducts()
  }, [])

  return (
    <section className="py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-bold text-foreground sm:text-3xl">
              Productos destacados
            </h2>
            <p className="text-muted-foreground">
              Los favoritos de la comunidad maker de Tijuana
            </p>
          </div>
          <Link href="/productos">
            <Button variant="outline" className="w-fit rounded-xl border-primary/20 hover:bg-primary/10">
              Ver todo el catálogo
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              category={product.categories?.name || "General"}
              image={product.image_url}
              retailPrice={product.price}
              wholesalePrice={product.wholesale_price ?? undefined}
              wholesaleMinQty={product.minimum_wholesale_quantity ?? undefined}
              rating={product.rating}
              reviewCount={product.reviews_count}
              stock={getStockStatus(product.stock)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
