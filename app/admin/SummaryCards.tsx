'use client'

import React from 'react'
import { DollarSign, ShoppingBag, AlertTriangle, Package } from 'lucide-react'

interface SummaryCardsProps {
  totalRevenue: number
  totalOrders: number
  lowStockCount: number
  totalProducts: number
}

export default function SummaryCards({
  totalRevenue,
  totalOrders,
  lowStockCount,
  totalProducts,
}: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">Total Revenue</p>
          <h3 className="text-2xl font-black text-emerald-400 mt-1">
            LKR {totalRevenue.toFixed(2)}
          </h3>
        </div>
        <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">Total Orders</p>
          <h3 className="text-2xl font-black text-sky-400 mt-1">{totalOrders}</h3>
        </div>
        <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
          <ShoppingBag className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">Low Stock Alerts</p>
          <h3 className="text-2xl font-black text-amber-400 mt-1">{lowStockCount} Items</h3>
        </div>
        <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-400 font-medium">Total Products</p>
          <h3 className="text-2xl font-black text-purple-400 mt-1">{totalProducts}</h3>
        </div>
        <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
          <Package className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}