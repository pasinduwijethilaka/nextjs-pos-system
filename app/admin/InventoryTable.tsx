'use client'

import React from 'react'
import { Product } from '@/types'
import { Pencil } from 'lucide-react'

interface InventoryTableProps {
  products: Product[]
  handleEditClick: (product: Product) => void
}

export default function InventoryTable({ products, handleEditClick }: InventoryTableProps) {
  return (
    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl overflow-hidden">
      <h2 className="text-lg font-bold text-white mb-4">Current Inventory Status</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950 text-slate-400 uppercase text-xs">
            <tr>
              <th className="p-3">Product Name</th>
              <th className="p-3">Price</th>
              <th className="p-3">Stock Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-800/40 transition">
                <td className="p-3 font-semibold text-white">{p.name}</td>
                <td className="p-3">LKR {p.price.toFixed(2)}</td>
                <td className="p-3">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      p.stock_quantity < 5
                        ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    {p.stock_quantity} in stock
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => handleEditClick(p)}
                    className="p-1.5 bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 rounded-lg transition"
                    title="Edit Product"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}