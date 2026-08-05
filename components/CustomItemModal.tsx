'use client'

import React, { useState } from 'react'
import { PlusCircle, X, DollarSign, Tag } from 'lucide-react'

interface CustomItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAddItem: (item: { name: string; price: number; quantity: number }) => void
}

export default function CustomItemModal({
  isOpen,
  onClose,
  onAddItem,
}: CustomItemModalProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedPrice = parseFloat(price)
    const parsedQty = parseFloat(quantity)

    if (!name.trim()) {
      alert('Please enter item name')
      return
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Please enter a valid price')
      return
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    onAddItem({
      name: name.trim(),
      price: parsedPrice,
      quantity: parsedQty,
    })

    // Reset Form
    setName('')
    setPrice('')
    setQuantity('1')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-slate-100 relative shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-sky-400" /> Add Custom Item
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Item Name / Description
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Miscellaneous / Special Item"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Unit Price (LKR)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-sky-500/20"
            >
              Add to Cart
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}