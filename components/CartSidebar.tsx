'use client'

import React from 'react'
import { CartItem } from '@/types'
import { ShoppingCart, Trash2, Plus, Minus, CreditCard, Banknote } from 'lucide-react'

interface CartSidebarProps {
  cart: CartItem[]
  updateQuantity: (productId: number, delta: number) => void
  removeFromCart: (productId: number) => void
  handleCheckout: (paymentMethod: 'cash' | 'card') => void
  processing: boolean
}

export default function CartSidebar({
  cart,
  updateQuantity,
  removeFromCart,
  handleCheckout,
  processing,
}: CartSidebarProps) {
  const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col p-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-sky-400" /> Current Order
        </h2>
        <span className="bg-slate-800 text-xs px-2.5 py-1 rounded-full text-slate-300 font-semibold">
          {totalItemsCount} items
        </span>
      </div>

      {/* Cart Items List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm">
            <ShoppingCart className="w-12 h-12 mb-2 stroke-1 opacity-40" />
            Cart is empty
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.product.id}
              className="bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between"
            >
              <div className="flex-1 pr-2">
                <h4 className="text-sm font-semibold text-white line-clamp-1">{item.product.name}</h4>
                <p className="text-xs text-sky-400 mt-0.5">LKR {item.product.price.toFixed(2)}</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.product.id, -1)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product.id, 1)}
                  className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="p-1 rounded text-red-400 hover:bg-red-500/10 ml-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Billing Calculation & Action Buttons */}
      <div className="border-t border-slate-800 pt-4 mt-4 space-y-3">
        <div className="flex justify-between text-sm text-slate-400">
          <span>Subtotal</span>
          <span>LKR {totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold text-white border-t border-slate-800/80 pt-2">
          <span>Total</span>
          <span className="text-sky-400">LKR {totalAmount.toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            disabled={processing || cart.length === 0}
            onClick={() => handleCheckout('cash')}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm"
          >
            <Banknote className="w-4 h-4" /> Cash Pay
          </button>
          <button
            disabled={processing || cart.length === 0}
            onClick={() => handleCheckout('card')}
            className="flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition text-sm"
          >
            <CreditCard className="w-4 h-4" /> Card Pay
          </button>
        </div>
      </div>
    </div>
  )
}