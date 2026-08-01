'use client'

import React from 'react'
import { Product } from '@/types'
import { Plus } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div
      onClick={() => onAddToCart(product)}
      className="bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/50 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-1 shadow-md group"
    >
      <div>
        <div className="h-28 w-full bg-slate-800 rounded-lg overflow-hidden mb-3">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No Image
            </div>
          )}
        </div>
        <h3 className="font-semibold text-white text-sm line-clamp-1">{product.name}</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Stock:{' '}
          <span className={product.stock_quantity < 5 ? 'text-red-400 font-bold' : 'text-slate-300'}>
            {product.stock_quantity}
          </span>
        </p>
      </div>
      <div className="flex items-center justify-between mt-4">
        <span className="text-sky-400 font-bold text-base">LKR {product.price.toFixed(2)}</span>
        <button className="bg-sky-500/10 text-sky-400 p-1.5 rounded-md group-hover:bg-sky-500 group-hover:text-slate-950 transition">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}