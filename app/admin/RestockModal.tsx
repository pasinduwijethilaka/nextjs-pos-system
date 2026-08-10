'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Product } from '@/types'
import { X, Plus, Loader2 } from 'lucide-react'

interface RestockModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  onSuccess: () => void
}

export default function RestockModal({ isOpen, onClose, product, onSuccess }: RestockModalProps) {
  const [addQty, setAddQty] = useState('')
  const [costPrice, setCostPrice] = useState(product.cost_price ? product.cost_price.toString() : '')
  const [sellingPrice, setSellingPrice] = useState(product.price ? product.price.toString() : '')
  const [batchCode, setBatchCode] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addQty || parseFloat(addQty) <= 0) {
      alert('කරුණාකර ප්‍රමාණය (Quantity) ඇතුළත් කරන්න.')
      return
    }

    setLoading(true)

    try {
      const addedQuantity = parseFloat(addQty)
      const cost = costPrice ? parseFloat(costPrice) : product.cost_price || 0
      const price = sellingPrice ? parseFloat(sellingPrice) : product.price

      // 1. පරණ Batches මොකුත් නැත්නම් සහ කලින් direct stock එකක් තිබ්බා නම්, පරණ Stock එකෙන් auto Batch #1 එකක් හදනවා.
      const existingBatchesCount = product.batches ? product.batches.length : 0
      const existingStock = Number(product.stock_quantity || 0)

      if (existingBatchesCount === 0 && existingStock > 0) {
        const { error: initialBatchErr } = await supabase.from('product_batches').insert([
          {
            product_id: product.id,
            batch_code: 'BATCH-01 (Existing Stock)',
            cost_price: product.cost_price || 0,
            selling_price: product.price || 0,
            stock_quantity: existingStock,
          },
        ])

        if (initialBatchErr) throw initialBatchErr
      }

      // 2. දැන් අලුතෙන් දාන New Batch එක එකතු කිරීම
      const { error: batchErr } = await supabase.from('product_batches').insert([
        {
          product_id: product.id,
          batch_code: batchCode.trim() || `BATCH-${Date.now().toString().slice(-6)}`,
          cost_price: cost,
          selling_price: price,
          stock_quantity: addedQuantity,
        },
      ])

      if (batchErr) throw batchErr

      alert('Stock Batch එක සාර්ථකව එකතු කළා! 🎉')
      setAddQty('')
      setBatchCode('')
      onSuccess()
      onClose()
    } catch (err: any) {
      alert('Stock එකතු කිරීමට නොහැකි විය: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 text-white">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-lg">Add New Batch - {product.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleRestockSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Batch Code / Number (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. LOT-2026-A"
              value={batchCode}
              onChange={(e) => setBatchCode(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Cost Price (LKR)</label>
              <input
                type="number"
                step="0.01"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Selling Price (LKR)</label>
              <input
                type="number"
                step="0.01"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Add Quantity ({product.unit_type || 'units'})
            </label>
            <input
              type="number"
              step="any"
              placeholder="e.g. 50"
              value={addQty}
              onChange={(e) => setAddQty(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-sky-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Save Batch Stock
          </button>
        </form>
      </div>
    </div>
  )
}