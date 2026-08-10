'use client'

import React from 'react'
import { Product } from '@/types'
import { Plus, Percent, Layers } from 'lucide-react'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // 📦 Batches වලින් Stock එක සහ Prices Calculate කරගැනීම
  const activeBatches = product.batches?.filter((b) => Number(b.stock_quantity) > 0) || []

  // Total Stock එක Calculate කිරීම (Batches තිබ්බොත් ඒවල එකතුව, නැත්නම් Main Product Stock එක)
  const totalStock = product.batches && product.batches.length > 0
    ? activeBatches.reduce((sum, batch) => sum + Number(batch.stock_quantity), 0)
    : Number(product.stock_quantity || 0)

  // Display එකට ගන්න Price එක (Single Price ද, Minimum Price එක ද කියන එක)
  const prices = activeBatches.map((b) => Number(b.selling_price))
  const displayPrice = prices.length > 0 
    ? Math.min(...prices) 
    : Number(product.price || 0)
    
  const isMultiPrice = activeBatches.length > 1

  // 🏷️ Discount Logic
  const hasDiscount = Boolean(product.discount_percentage && product.discount_percentage > 0)
  const finalPrice = hasDiscount
    ? displayPrice - (displayPrice * (product.discount_percentage || 0)) / 100
    : displayPrice

  return (
    <div
      onClick={() => onAddToCart(product)}
      className="bg-slate-900/60 border border-slate-800/80 hover:border-sky-500/50 rounded-xl p-4 flex flex-col justify-between cursor-pointer transition transform hover:-translate-y-1 shadow-md group relative"
    >
      <div>
        <div className="h-28 w-full bg-slate-800 rounded-lg overflow-hidden mb-3 relative flex items-center justify-center">
          {/* Discount Badge on Image */}
          {hasDiscount && (
            <span className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow-md z-10 flex items-center gap-0.5">
              <Percent className="w-2.5 h-2.5" />
              {product.discount_percentage}% OFF
            </span>
          )}

          {/* Multiple Batches Badge */}
          {isMultiPrice && (
            <span className="absolute top-2 left-2 bg-sky-500/90 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded-full shadow-md z-10 flex items-center gap-1 backdrop-blur-sm">
              <Layers className="w-2.5 h-2.5" />
              {activeBatches.length} Prices
            </span>
          )}

          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              onError={(e) => {
                ;(e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400'
              }}
              className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No Image
            </div>
          )}
        </div>

        <h3 className="font-semibold text-white text-sm line-clamp-1">{product.name}</h3>
        
        {/* Stock Status */}
        <p className="text-xs text-slate-400 mt-0.5">
          Stock:{' '}
          <span className={totalStock < 5 ? 'text-red-400 font-bold' : 'text-slate-300'}>
            {totalStock} {product.unit_type || 'unit'}
          </span>
        </p>
      </div>

      {/* Price & Action Section */}
      <div className="flex items-center justify-between mt-4 gap-1">
        <div className="flex flex-col">
          {isMultiPrice && (
            <span className="text-[10px] text-sky-400 font-medium">Starts from</span>
          )}

          {hasDiscount ? (
            <>
              {/* Original Price */}
              <span className="text-[11px] text-slate-500 line-through font-mono leading-none">
                LKR {displayPrice.toFixed(2)}
              </span>
              {/* Final Selling Price */}
              <span className="text-emerald-400 font-bold text-base leading-tight">
                LKR {finalPrice.toFixed(2)}
              </span>
            </>
          ) : (
            /* Normal Price */
            <span className="text-sky-400 font-bold text-base">
              LKR {displayPrice.toFixed(2)}
            </span>
          )}
        </div>

        <button className="bg-sky-500/10 text-sky-400 p-1.5 rounded-md group-hover:bg-sky-500 group-hover:text-slate-950 transition">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}