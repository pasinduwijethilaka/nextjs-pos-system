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
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400 text-center py-10 animate-pulse">
          Loading catalog...
        </p>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-slate-400 text-center py-10">No products found.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 align-content-start">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />
      ))}
    </div>
  )
}