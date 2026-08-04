'use client'

import React from 'react'
import { Category } from '@/types'
import { PlusCircle, Save, RefreshCw, Scale } from 'lucide-react'

interface ProductFormProps {
  editingProductId: number | null
  categories: Category[]
  name: string
  setName: (val: string) => void
  barcode: string
  setBarcode: (val: string) => void
  price: string
  setPrice: (val: string) => void
  costPrice: string
  setCostPrice: (val: string) => void
  discount: string
  setDiscount: (val: string) => void
  stock: string
  setStock: (val: string) => void
  categoryId: string
  setCategoryId: (val: string) => void
  imageUrl: string
  setImageUrl: (val: string) => void
  unitType: 'unit' | 'kg' | 'g'
  setUnitType: (val: 'unit' | 'kg' | 'g') => void
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
  discount,
  setDiscount,
  stock,
  setStock,
  categoryId,
  setCategoryId,
  imageUrl,
  setImageUrl,
  unitType,
  setUnitType,
  submitting,
  handleSubmitProduct,
  resetForm,
}: ProductFormProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">
          {editingProductId ? 'Edit Product' : 'Add New Product'}
        </h2>
        {editingProductId && (
          <button
            type="button"
            onClick={resetForm}
            className="text-xs text-sky-400 hover:underline flex items-center gap-1"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        )}
      </div>

      <form onSubmit={handleSubmitProduct} className="space-y-4">
        {/* Product Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Product Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sugar / Milk Powder 400g"
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl p-3 outline-none focus:border-sky-500"
          />
        </div>

        {/* ⚖️ Selling Unit Type Selection */}
        <div>
          <label className="block text-xs font-semibold text-emerald-400 mb-1 flex items-center gap-1">
            <Scale className="w-3.5 h-3.5" /> Selling Unit Type *
          </label>
          <select
            value={unitType}
            onChange={(e) => setUnitType(e.target.value as 'unit' | 'kg')}
            className="w-full bg-slate-950 border border-emerald-500/40 text-sm text-emerald-300 font-semibold rounded-xl p-3 outline-none focus:border-emerald-500"
          >
            <option value="unit">Packet / Piece / Unit (Pcs)</option>
            <option value="kg">Per Kilogram (Loose / Weighted - Kg)</option>
          </select>
        </div>

        {/* Prices Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              {unitType === 'kg' ? 'Price Per 1 Kg (LKR) *' : 'Selling Price (LKR) *'}
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl p-3 outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Cost Price (LKR)</label>
            <input
              type="number"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl p-3 outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        {/* 🏷️ Discount % & Stock Quantity */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-amber-400 mb-1">Discount (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              placeholder="0%"
              className="w-full bg-slate-950 border border-slate-800 text-sm text-amber-400 font-bold rounded-xl p-3 outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              {unitType === 'kg' ? 'Stock Quantity (Kg) *' : 'Stock Quantity (Units) *'}
            </label>
            <input
              type="number"
              step={unitType === 'kg' ? "0.001" : "1"}
              required
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder={unitType === 'kg' ? "e.g. 50 (50Kg)" : "0"}
              className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl p-3 outline-none focus:border-sky-500 font-mono"
            />
          </div>
        </div>

        {/* Barcode & Category Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Barcode</label>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="Scan or enter"
              className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl p-3 outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-sm text-slate-300 rounded-xl p-3 outline-none focus:border-sky-500"
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Image URL</label>
          <input
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-xl p-3 outline-none focus:border-sky-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-sky-500/20 disabled:opacity-50"
        >
          {editingProductId ? (
            <>
              <Save className="w-4 h-4" /> {submitting ? 'Updating...' : 'Update Product'}
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" /> {submitting ? 'Adding...' : 'Add Product'}
            </>
          )}
        </button>
      </form>
    </div>
  )
}