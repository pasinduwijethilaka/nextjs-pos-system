'use client'

import React, { useState } from 'react'
import { Product } from '@/types'
import { Edit2, Trash2, AlertTriangle, PlusCircle, Printer, Percent, PackageCheck, ChevronDown, ChevronRight, Layers } from 'lucide-react'
import RestockModal from './RestockModal'

interface InventoryTableProps {
  products: Product[]
  handleEditClick: (product: Product) => void
  onDeleteClick: (id: number, name: string) => void
  onDeleteBatchClick?: (batchId: number) => void
  onStockUpdated?: () => void
}

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
  onDeleteBatchClick,
  onStockUpdated,
}: InventoryTableProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isRestockOpen, setIsRestockOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLowStockOnly, setShowLowStockOnly] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({})

  const toggleRow = (productId: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [productId]: !prev[productId],
    }))
  }

  const getProductTotalStock = (p: Product) => {
    if (p.batches && p.batches.length > 0) {
      return p.batches.reduce((sum, b) => sum + (b.stock_quantity || 0), 0)
    }
    return p.stock_quantity || 0
  }

  const lowStockProducts = products.filter((p) => getProductTotalStock(p) <= 5)

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery))

    const totalStock = getProductTotalStock(p)
    const matchesLowStock = showLowStockOnly ? totalStock <= 5 : true

    return matchesSearch && matchesLowStock
  })

  const handleOpenRestock = (product: Product) => {
    setSelectedProduct(product)
    setIsRestockOpen(true)
  }

  const handlePrintRestockList = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const lowStockHtml = lowStockProducts
      .map((p) => {
        const totalStock = getProductTotalStock(p)
        return `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #ddd;">${p.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">${p.barcode || '-'}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center; color: red; font-weight: bold;">${totalStock}</td>
          <td style="padding: 8px; border-bottom: 1px solid #ddd; text-align: center;">[ &nbsp; &nbsp; ]</td>
        </tr>
      `
      })
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
            <p className="text-slate-400 text-xs mt-1">Manage product stocks, prices and active batches</p>
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

            {/* Quick Filter Button */}
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
                <th className="p-3 w-8"></th>
                <th className="p-3">Product</th>
                <th className="p-3">Barcode</th>
                <th className="p-3">Base Price</th>
                <th className="p-3 text-center">Discount</th>
                <th className="p-3">Effective Price</th>
                <th className="p-3 text-center">Total Stock</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-500">
                    {showLowStockOnly
                      ? '🎉 No low stock items found!'
                      : 'No products matched your search.'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const totalStock = getProductTotalStock(p)
                  const isLow = totalStock <= 5
                  const isOutOfStock = totalStock === 0
                  const hasDiscount = p.discount_percentage && p.discount_percentage > 0
                  const finalSellingPrice = getEffectivePrice(p.price, p.discount_percentage)
                  const hasBatches = p.batches && p.batches.length > 0
                  const isExpanded = !!expandedRows[p.id]

                  return (
                    <React.Fragment key={p.id}>
                      <tr
                        className={`hover:bg-slate-800/40 transition ${
                          isOutOfStock
                            ? 'bg-rose-500/5'
                            : isLow
                            ? 'bg-amber-500/5'
                            : ''
                        }`}
                      >
                        {/* Expand Row Toggle Button */}
                        <td className="p-3 text-center">
                          {hasBatches ? (
                            <button
                              onClick={() => toggleRow(p.id)}
                              className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                              title="Toggle Batches"
                            >
                              {isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-sky-400" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-700">-</span>
                          )}
                        </td>

                        {/* Product Name */}
                        <td className="p-3 font-semibold text-white">
                          <div className="flex items-center gap-2">
                            {p.name}
                            {hasBatches && (
                              <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                <Layers className="w-3 h-3" />
                                {p.batches?.length} Batches
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Barcode */}
                        <td className="p-3 font-mono text-slate-400">{p.barcode || '-'}</td>

                        {/* Original Base Price */}
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

                        {/* Total Stock Status */}
                        <td className="p-3 text-center">
                          {isOutOfStock ? (
                            <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                              Out of Stock
                            </span>
                          ) : isLow ? (
                            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md font-bold text-[10px] uppercase flex items-center justify-center gap-1 mx-auto w-fit">
                              <AlertTriangle className="w-3 h-3" /> Low: {totalStock}
                            </span>
                          ) : (
                            <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md font-semibold text-[11px]">
                              {totalStock} {p.unit_type === 'kg' ? 'Kg' : 'in stock'}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenRestock(p)}
                              title="Add Batch / Quick Restock"
                              className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg transition"
                            >
                              <PlusCircle className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleEditClick(p)}
                              title="Edit Details"
                              className="p-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 rounded-lg transition"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

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

                      {/* Batches Sub-Table (Expanded View) */}
                      {hasBatches && isExpanded && (
                        <tr className="bg-slate-950/80">
                          <td colSpan={8} className="p-4 pl-12 border-b border-slate-800/80">
                            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
                              <div className="text-xs font-semibold text-slate-400 uppercase mb-2 flex items-center justify-between">
                                <span>Active Batches / Pricing Breakdown</span>
                              </div>
                              <table className="w-full text-left text-xs font-mono">
                                <thead>
                                  <tr className="text-slate-500 border-b border-slate-800">
                                    <th className="pb-1.5">Batch Code</th>
                                    <th className="pb-1.5">Cost Price</th>
                                    <th className="pb-1.5">Selling Price</th>
                                    <th className="pb-1.5">Available Stock</th>
                                    <th className="pb-1.5 text-right">Action</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/40">
                                  {p.batches?.map((batch) => (
                                    <tr key={batch.id} className="hover:bg-slate-800/20">
                                      <td className="py-2 text-slate-300 font-sans font-semibold">
                                        {batch.batch_code || `BATCH-#${batch.id}`}
                                      </td>
                                      <td className="py-2 text-slate-400">
                                        LKR {batch.cost_price ? batch.cost_price.toFixed(2) : '0.00'}
                                      </td>
                                      <td className="py-2 text-emerald-400 font-bold">
                                        LKR {batch.selling_price ? batch.selling_price.toFixed(2) : '0.00'}
                                      </td>
                                      <td className="py-2">
                                        <span className="bg-slate-800 text-sky-400 px-2 py-0.5 rounded">
                                          {batch.stock_quantity}
                                        </span>
                                      </td>
                                      <td className="py-2 text-right">
                                        {onDeleteBatchClick && (
                                          <button
                                            onClick={() => onDeleteBatchClick(batch.id)}
                                            className="text-slate-500 hover:text-rose-400 transition"
                                            title="Delete Batch"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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