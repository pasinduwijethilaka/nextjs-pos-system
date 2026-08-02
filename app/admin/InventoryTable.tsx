import React from 'react'
import { Product } from '@/types'
import { Edit, Trash2 } from 'lucide-react'

interface InventoryTableProps {
  products: Product[]
  handleEditClick: (product: Product) => void
  onDeleteClick: (productId: number, productName: string) => void // 👈 NEW Prop Type
}

export default function InventoryTable({
  products,
  handleEditClick,
  onDeleteClick, // 👈 Receive Prop
}: InventoryTableProps) {
  return (
    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4">Inventory Products</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-800 text-slate-400 uppercase text-xs">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-800/50 transition">
                <td className="p-3 text-slate-400">#{product.id}</td>
                <td className="p-3 font-medium text-white">{product.name}</td>
                <td className="p-3 text-sky-400">LKR {product.price.toFixed(2)}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      product.stock_quantity < 5
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {product.stock_quantity} in stock
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditClick(product)}
                      className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition"
                      title="Edit Product"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    {/* 🗑️ NEW: Delete Button */}
                    <button
                      onClick={() => onDeleteClick(product.id, product.name)}
                      className="p-2 bg-slate-800 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition border border-transparent hover:border-red-500/30"
                      title="Delete Product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}