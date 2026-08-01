'use client'

import React from 'react'
import { Product } from '@/types'
import ProductCard from './ProductCard'

interface ProductGridProps {
  products: Product[]
  loading: boolean
  onAddToCart: (product: Product) => void
}

export default function ProductGrid({ products, loading, onAddToCart }: ProductGridProps) {
  if (loading) {
    return <p className="text-slate-400 col-span-full text-center py-10">Loading catalog...</p>
  }

  if (products.length === 0) {
    return <p className="text-slate-400 col-span-full text-center py-10">No products found.</p>
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 align-content-start">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}