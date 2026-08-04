'use client'

import React, { useState } from 'react'
import { Product } from '@/types'
import { Edit2, Trash2, AlertTriangle, PlusCircle, Printer, Percent, PackageCheck } from 'lucide-react'
import RestockModal from './RestockModal'

interface InventoryTableProps {
  products: Product[]
  handleEditClick: (product: Product) => void
  onDeleteClick: (id: number, name: string) => void
  onStockUpdated?: () => void
}

// 🏷️ Effective Price (Discount එක කැපුනාට පස්සේ ගණන) Calculate කරන Helper Function එක
const getEffectivePrice = (price: number, discountPercentage?: number): number => {
  if (discountPercentage && discountPercentage > 0) {
    const discountAmount = (price * discountPercentage) / 100
    return price - discountAmount
  }
  return price
}

export default function InventoryTable({
  products,
  handleEditClick,
  onDeleteClick,
  onStockUpdated,
}: InventoryTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isRestockOpen, setIsRestockOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false) // 🚨 Low Stock Quick Filter State

  const handleOpenRestock = (product: Product) => {
    setSelectedProduct(product)
    setIsRestockOpen(true)
  }

  // Low stock products count
  const lowStockProducts = products.filter((p) => p.stock_quantity <= 5)

  // Filter products by search AND Low Stock Toggle
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery))

    const matchesLowStock = showLowStockOnly ? p.stock_quantity <= 5 : true

    return matchesSearch && matchesLowStock
  })

  // Supplier Purchase Order Print
  const handlePrintRestockList = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const lowStockHtml = lowStockProducts
      .map(
        (p) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${p.barcode || '-'}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; color: red; font-weight: bold;">${p.stock_quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">[ &nbsp; &nbsp; ]</td>
      </tr>
    `
      )
      .join('')

    printWindow.document.write(`
      <html>
        <head>
          <title>Low Stock Purchase Order List</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h2 { margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th { background: #f4f4f4; padding: 8px; text-align: left; border-bottom: 2px solid #ccc; }
          </style>
        </head>
        <body>
          <h2>Low Stock Purchase Order</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <hr />
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th style="text-align: center;">Barcode</th>
                <th style="text-align: center;">Current Stock</th>
                <th style="text-align: center;">Order Qty (Fill)</th>
              </tr>
            </thead>
            <tbody>
              ${lowStockHtml.length > 0 ? lowStockHtml : '<tr><td colspan="4" style="text-align:center; padding: 20px;">No Low Stock Items! 🎉</td></tr>'}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }

  return (
    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
      <div>
        {/* Table Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Inventory Items
              {lowStockProducts.length > 0 && (
                <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {lowStockProducts.length} Low Stock
                </span>
              )}
            </h2>
            <p className="text-slate-400 text-xs mt-1">Manage stock levels and products</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search product/barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-sky-500"
            />

            {/* 🚨 Quick Filter Button for Low Stock */}
            <button
              type="button"
              onClick={() => setShowLowStockOnly(!showLowStockOnly)}
              className={`text-xs px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition border ${
                showLowStockOnly
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {showLowStockOnly ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <PackageCheck className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>Low Stock Only</span>
              {lowStockProducts.length > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5 ${
                    showLowStockOnly
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {lowStockProducts.length}
                </span>
              )}
            </button>

            {/* Print Purchase Order Button */}
            {lowStockProducts.length > 0 && (
              <button
                onClick={handlePrintRestockList}
                className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs px-3 py-2 rounded-xl font-semibold flex items-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" /> Restock List
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">Product</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Orig. Price</th>
                <th className="p-3 text-center">Discount</th>
                <th className="p-3">Selling Price</th>
                <th className="p-3 text-center">Stock Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-500">
                    {showLowStockOnly
                      ? '🎉 No low stock items found!'
                      : 'No products matched your search.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isLow = p.stock_quantity <= 5
                  const isOutOfStock = p.stock_quantity === 0
                  const hasDiscount = p.discount_percentage && p.discount_percentage > 0
                  const finalSellingPrice = getEffectivePrice(p.price, p.discount_percentage)

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition ${
                        isOutOfStock
                          ? 'bg-rose-500/5'
                          : isLow
                          ? 'bg-amber-500/5'
                          : ''
                      }`}
                    >
                      {/* Product Name */}
                      <td className="p-3 font-semibold text-white">{p.name}</td>

                      {/* Barcode */}
                      <td className="p-3 font-mono text-slate-400">{p.barcode || '-'}</td>

                      {/* Original Price */}
                      <td className="p-3 font-mono">
                        <span className={hasDiscount ? 'line-through text-slate-500' : 'text-slate-200'}>
                          LKR {p.price.toFixed(2)}
                        </span>
                      </td>

                      {/* Discount Badge */}
                      <td className="p-3 text-center">
                        {hasDiscount ? (
                          <span className="inline-flex items-center gap-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold px-2 py-0.5 rounded-md text-[10px]">
                            <Percent className="w-3 h-3" />
                            {p.discount_percentage}%
                          </span>
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </td>

                      {/* Final Selling Price */}
                      <td className="p-3 font-mono">
                        <span className={hasDiscount ? 'text-emerald-400 font-bold' : 'text-slate-200 font-semibold'}>
                          LKR {finalSellingPrice.toFixed(2)}
                        </span>
                      </td>

                      {/* Stock Status */}
                      <td className="p-3 text-center">
                        {isOutOfStock ? (
                          <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase flex items-center justify-center gap-1 mx-auto w-fit">
                            <AlertTriangle className="w-3 h-3" /> Low: {p.stock_quantity}
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
                            {p.stock_quantity} in stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {/* Quick Restock Button */}
                          <button
                            onClick={() => handleOpenRestock(p)}
                            title="Add Quick Stock"
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition"
                          >
                            <PlusCircle className="w-4 h-4" />
                          </button>

                          {/* Edit Button */}
                          <button
                            onClick={() => handleEditClick(p)}
                            title="Edit Details"
                            className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => onDeleteClick(p.id, p.name)}
                            title="Delete Item"
                            className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Restock Modal */}
      {selectedProduct && (
        <RestockModal
          isOpen={isRestockOpen}
          onClose={() => setIsRestockOpen(false)}
          product={selectedProduct}
          onSuccess={() => {
            if (onStockUpdated) onStockUpdated()
          }}
        />
      )}
    </div>
  )
}