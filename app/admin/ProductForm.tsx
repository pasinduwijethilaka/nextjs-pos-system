'use client'

import React from 'react'
import { Category } from '@/types'
import { Plus, Pencil, X } from 'lucide-react'

interface ProductFormProps {
  editingProductId: number | null
  categories: Category[]
  name: string
  setName: (v: string) => void
  barcode: string
  setBarcode: (v: string) => void
  price: string
  setPrice: (v: string) => void
  costPrice: string
  setCostPrice: (v: string) => void
  stock: string
  setStock: (v: string) => void
  categoryId: string
  setCategoryId: (v: string) => void
  imageUrl: string
  setImageUrl: (v: string) => void
  submitting: boolean
  handleSubmitProduct: (e: React.FormEvent) => void
  resetForm: () => void
}

export default function ProductForm({
  editingProductId,
  categories,
  name,
  setName,
  barcode,
  setBarcode,
  price,
  setPrice,
  costPrice,
  setCostPrice,
  stock,
  setStock,
  categoryId,
  setCategoryId,
  imageUrl,
  setImageUrl,
  submitting,
  handleSubmitProduct,
  resetForm,
}: ProductFormProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          {editingProductId ? (
            <>
              <Pencil className="w-5 h-5 text-amber-400" /> Edit Product
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 text-sky-400" /> Add New Product
            </>
          )}
        </h2>
        {editingProductId && (
          <button
            onClick={resetForm}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2 py-1 rounded"
          >
            <X className="w-3 h-3" /> Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmitProduct} className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-slate-400">Product Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sprite 1.5L"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white mt-1 focus:border-sky-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-400">Price (LKR) *</label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="450.00"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white mt-1 focus:border-sky-500 outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-400">Stock Qty *</label>
            <input
              type="number"
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="20"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white mt-1 focus:border-sky-500 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white mt-1 focus:border-sky-500 outline-none"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400">Barcode / SKU</label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="1004"
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white mt-1 focus:border-sky-500 outline-none"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-400">Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-white mt-1 focus:border-sky-500 outline-none"
          />
        </div>

        <button
          disabled={submitting}
          type="submit"
          className={`w-full font-bold py-3 rounded-xl transition ${
            editingProductId
              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
          }`}
        >
          {submitting
            ? 'Saving...'
            : editingProductId
            ? 'Update Product Details'
            : 'Save Product'}
        </button>
      </form>
    </div>
  )
}