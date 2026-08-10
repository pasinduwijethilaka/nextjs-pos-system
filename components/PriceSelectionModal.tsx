'use client'

import React from 'react'
import { Product, ProductBatch } from '@/types'
import { X, Tag, Calendar, Layers } from 'lucide-react'

interface PriceSelectionModalProps {
  isOpen: boolean
  product: Product | null
  onClose: () => void
  onSelectBatch: (product: Product, batch: ProductBatch) => void
}

export default function PriceSelectionModal({
  isOpen,
  product,
  onClose,
  onSelectBatch,
}: PriceSelectionModalProps) {
  if (!isOpen || !product) return null

  const batches = product.batches || []

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 relative shadow-2xl space-y-4">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Tag className="w-4 h-4 text-sky-400" /> Select Batch / Price
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Batches List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {batches.length === 0 ? (
            <div className="text-center py-6 text-slate-500 text-sm">
              No active batches available for this product.
            </div>
          ) : (
            batches.map((batch) => (
              <button
                key={batch.id}
                onClick={() => onSelectBatch(product, batch)}
                className="w-full bg-slate-950 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500/50 p-3 rounded-xl flex items-center justify-between text-left transition group"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-slate-300">
                      Batch: {batch.batch_number || `#${batch.id}`}
                    </span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">
                      Stock: {batch.quantity ?? batch.stock_quantity ?? 0}
                    </span>
                  </div>

                  {batch.expiry_date && (
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Calendar className="w-3 h-3 text-amber-500/80" />
                      <span>Exp: {batch.expiry_date}</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-sm font-bold text-sky-400 group-hover:text-sky-300">
                  LKR {(batch.unit_price ?? batch.selling_price ?? 0).toFixed(2)}
                  </p>
                  <span className="text-[10px] text-slate-500">Click to Select</span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <button
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-sm transition"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}