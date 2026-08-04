'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import { X, Plus, Package } from 'lucide-react'

interface RestockModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  onSuccess: () => void
}

export default function RestockModal({ isOpen, onClose, product, onSuccess }: RestockModalProps) {
  const [addQty, setAddQty] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault()
    const addedCount = parseInt(addQty)
    if (isNaN(addedCount) || addedCount <= 0) {
      alert('Please enter a valid quantity!')
      return
    }

    setLoading(true)
    const newStock = product.stock_quantity + addedCount

    try {
      const { error } = await supabase
        .from('products')
        .update({ stock_quantity: newStock })
        .eq('id', product.id)

      if (error) throw error

      alert(`Successfully added +${addedCount} units to ${product.name}! 🎉`)
      setAddQty('')
      onSuccess()
      onClose()
    } catch (err: any) {
      alert('Failed to update stock: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Quick Restock</h3>
            <p className="text-slate-400 text-xs">{product.name}</p>
          </div>
        </div>

        {/* Current Info */}
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl mb-6 flex justify-between items-center text-sm">
          <span className="text-slate-400">Current Stock:</span>
          <span className="font-bold text-sky-400">{product.stock_quantity} Units</span>
        </div>

        <form onSubmit={handleRestock} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Quantity to Add (+)
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 50"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              required
              autoFocus
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 text-lg font-mono font-bold"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl text-sm font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-slate-950 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" /> {loading ? 'Updating...' : 'Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}