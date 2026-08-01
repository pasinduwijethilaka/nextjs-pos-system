'use client'

import React, { useState } from 'react'
import { CartItem } from '@/types'
import { supabase } from '@/lib/supabase'
import { ShoppingCart, Trash2, Plus, Minus, CreditCard } from 'lucide-react'
import ReceiptModal from '@/components/ReceiptModal'

interface CartSidebarProps {
  cart: CartItem[]
  onUpdateQuantity: (productId: number, delta: number) => void
  removeFromCart: (productId: number) => void
  onClearCart: () => void // <-- Required prop එකක් කළා
  handleCheckout?: (paymentMethod: "cash" | "card") => Promise<void>
  processing?: boolean
}

export default function CartSidebar({
  cart,
  onUpdateQuantity,
  removeFromCart,
  onClearCart,
  processing = false,
}: CartSidebarProps) {
  const [cashGiven, setCashGiven] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Receipt Modal States
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)
  const [completedOrder, setCompletedOrder] = useState<{
    id: number
    items: CartItem[]
    total: number
    paid: number
    change: number
  } | null>(null)

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  const paidAmount = parseFloat(cashGiven) || 0
  const changeAmount = paidAmount >= totalAmount ? paidAmount - totalAmount : 0

  const executeCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty!')
    if (paidAmount < totalAmount) {
      return alert('Paid cash amount is insufficient!')
    }

    setSubmitting(true)

    try {
      // 1. Insert Order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{ total_amount: totalAmount }])
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Insert Order Items & Update Stock
      for (const item of cart) {
        await supabase.from('order_items').insert([
          {
            order_id: orderData.id,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.price,
          },
        ])

        const newStock = Math.max(0, item.product.stock_quantity - item.quantity)
        await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product.id)
      }

      // 3. Store Order Info for Receipt Modal
      setCompletedOrder({
        id: orderData.id,
        items: [...cart],
        total: totalAmount,
        paid: paidAmount,
        change: changeAmount,
      })

      // 4. Open Receipt Modal & Clear Cart
      setIsReceiptOpen(true)
      onClearCart() // <-- Parent state එක clear වෙනවා
      setCashGiven('')
    } catch (err: any) {
      alert('Error completing checkout: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <div className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col h-full p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Current Order</h2>
          </div>
          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onClearCart()
                setCashGiven('')
              }}
              className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-semibold"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <ShoppingCart className="w-10 h-10 opacity-30" />
              <p className="text-sm">No items in order</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.product.id}
                className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between"
              >
                <div className="flex-1 pr-2">
                  <h4 className="text-sm font-semibold text-white line-clamp-1">
                    {item.product.name}
                  </h4>
                  <p className="text-xs text-sky-400 mt-0.5 font-bold">
                    LKR {(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-slate-800 rounded-lg p-1">
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold px-2 text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="p-1 hover:bg-slate-700 rounded text-slate-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.product.id)}
                    className="text-slate-500 hover:text-red-400 p-1 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Total & Checkout Section */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex justify-between text-slate-400 text-sm">
            <span>Subtotal</span>
            <span className="text-white font-semibold">LKR {totalAmount.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-white font-bold text-lg pt-1">
            <span>Total</span>
            <span className="text-sky-400">LKR {totalAmount.toFixed(2)}</span>
          </div>

          {/* Cash Input */}
          <div>
            <label className="text-xs text-slate-400 font-medium">Cash Received (LKR)</label>
            <input
              type="number"
              placeholder="0.00"
              value={cashGiven}
              onChange={(e) => setCashGiven(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-bold mt-1 focus:border-sky-500 outline-none"
            />
          </div>

          {paidAmount > 0 && (
            <div className="flex justify-between text-xs font-semibold px-1">
              <span className="text-slate-400">Balance to give:</span>
              <span className={changeAmount >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                LKR {changeAmount.toFixed(2)}
              </span>
            </div>
          )}

          <button
            disabled={submitting || processing || cart.length === 0}
            onClick={executeCheckout}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2"
          >
            <CreditCard className="w-5 h-5" />
            {submitting || processing ? 'Processing Order...' : 'Complete Checkout'}
          </button>
        </div>
      </div>

      {/* 🖨️ Receipt Modal */}
      {completedOrder && (
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          orderId={completedOrder.id}
          cartItems={completedOrder.items}
          totalAmount={completedOrder.total}
          paidAmount={completedOrder.paid}
          changeAmount={completedOrder.change}
        />
      )}
    </>
  )
}