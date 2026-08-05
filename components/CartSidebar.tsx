'use client'

import React, { useState, useEffect } from 'react'
import { CartItem, Product } from '@/types'
import { supabase } from '@/lib/supabase'
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CreditCard,
  Scale,
  AlertCircle,
  PlusCircle,
  X,
  Tag,
  DollarSign,
} from 'lucide-react'
import ReceiptModal from '@/components/ReceiptModal'

interface CartSidebarProps {
  cart: CartItem[]
  onUpdateQuantity: (productId: number, deltaOrValue: number, isDirectValue?: boolean) => void
  removeFromCart: (productId: number) => void
  onClearCart: () => void
  onAddCustomToCart?: (item: { name: string; price: number; quantity: number }) => void
  handleCheckout?: (paymentMethod: 'cash' | 'card') => Promise<void>
  processing?: boolean
}

// 🏷️ Helper function to calculate effective discounted price
const getEffectivePrice = (product: Product): number => {
  if (product.discount_percentage && product.discount_percentage > 0) {
    const discount = (product.price * product.discount_percentage) / 100
    return product.price - discount
  }
  return product.price
}

// 🔢 Sub-component for Safe Quantity Input
function QuantityInput({
  item,
  onUpdateQuantity,
}: {
  item: CartItem
  onUpdateQuantity: (productId: number, val: number, isDirect: boolean) => void
}) {
  const [val, setVal] = useState<string>(item.quantity.toString())

  useEffect(() => {
    setVal(item.quantity.toString())
  }, [item.quantity])

  const isKg = item.product.unit_type === 'kg'

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const textVal = e.target.value
    setVal(textVal)

    const parsed = parseFloat(textVal)
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateQuantity(item.product.id, parsed, true)
    }
  }

  const handleBlur = () => {
    const parsed = parseFloat(val)
    if (isNaN(parsed) || parsed <= 0) {
      setVal(item.quantity.toString())
    }
  }

  return (
    <input
      type="number"
      step={isKg ? '0.001' : '1'}
      min="0.001"
      value={val}
      onChange={handleChange}
      onBlur={handleBlur}
      className="w-16 bg-slate-950 border border-slate-700 text-center rounded p-0.5 text-xs text-white font-mono font-bold focus:border-sky-500 outline-none"
    />
  )
}

// ➕ Sub-component: Custom Item Addition Modal
function CustomItemModal({
  isOpen,
  onClose,
  onAddItem,
}: {
  isOpen: boolean
  onClose: () => void
  onAddItem: (item: { name: string; price: number; quantity: number }) => void
}) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('1')

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const parsedPrice = parseFloat(price)
    const parsedQty = parseFloat(quantity)

    if (!name.trim()) {
      alert('Please enter an item name')
      return
    }
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      alert('Please enter a valid price')
      return
    }
    if (isNaN(parsedQty) || parsedQty <= 0) {
      alert('Please enter a valid quantity')
      return
    }

    onAddItem({
      name: name.trim(),
      price: parsedPrice,
      quantity: parsedQty,
    })

    // Reset & Close Modal
    setName('')
    setPrice('')
    setQuantity('1')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-slate-100 relative shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-sky-400" /> Add Custom Item
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
              Item Name / Description
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="e.g. Miscellaneous Item"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
                autoFocus
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Price (LKR)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">
                Quantity
              </label>
              <input
                type="number"
                step="any"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 transition"
              />
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-xl text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2.5 rounded-xl text-sm transition shadow-lg shadow-sky-500/20"
            >
              Add to Cart
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CartSidebar({
  cart,
  onUpdateQuantity,
  removeFromCart,
  onClearCart,
  onAddCustomToCart,
  processing = false,
}: CartSidebarProps) {
  const [cashGiven, setCashGiven] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)

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
    (sum, item) => sum + getEffectivePrice(item.product) * item.quantity,
    0
  )

  const paidAmount = parseFloat(cashGiven) || 0
  const changeAmount = paidAmount >= totalAmount ? paidAmount - totalAmount : 0
  const isCashInsufficient = cashGiven !== '' && paidAmount < totalAmount

  // 🚀 Improved Safe Atomic Checkout Strategy using Supabase RPC
  const executeCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty!')
    if (paidAmount < totalAmount) {
      return alert('Paid cash amount is insufficient!')
    }

    setSubmitting(true)

    try {
      // Prepare items payload for Postgres RPC Function
      const itemsPayload = cart.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: getEffectivePrice(item.product),
      }))

      // Call Atomic Postgres Stored Procedure
      const { data: newOrderId, error } = await supabase.rpc('process_checkout', {
        p_total_amount: totalAmount,
        p_items: itemsPayload,
      })

      if (error) throw error

      // Store Order Info for Receipt Modal
      setCompletedOrder({
        id: Number(newOrderId),
        items: [...cart],
        total: totalAmount,
        paid: paidAmount,
        change: changeAmount,
      })

      // Open Receipt Modal & Reset Cart State
      setIsReceiptOpen(true)
      onClearCart()
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
        {/* Header Section */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-sky-400" />
            <h2 className="text-lg font-bold text-white">Current Order</h2>
          </div>

          <div className="flex items-center gap-2">
            {/* ➕ Custom Item Add Button */}
            <button
              type="button"
              onClick={() => setIsCustomModalOpen(true)}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/20 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition"
            >
              <PlusCircle className="w-3.5 h-3.5" /> + Custom
            </button>

            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClearCart()
                  setCashGiven('')
                }}
                className="text-xs text-red-400 hover:text-red-300 hover:underline flex items-center gap-1 font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
              <ShoppingCart className="w-10 h-10 opacity-30" />
              <p className="text-sm">No items in order</p>
            </div>
          ) : (
            cart.map((item) => {
              const effectivePrice = getEffectivePrice(item.product)
              const hasDiscount =
                item.product.discount_percentage && item.product.discount_percentage > 0
              const isKg = item.product.unit_type === 'kg'

              const formattedWeight = isKg
                ? item.quantity < 1
                  ? `${Math.round(item.quantity * 1000)}g`
                  : `${item.quantity} Kg`
                : null

              return (
                <div
                  key={item.product.id}
                  className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-2">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-semibold text-white line-clamp-1">
                          {item.product.name}
                        </h4>
                        {isKg && (
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono flex items-center gap-0.5">
                            <Scale className="w-2.5 h-2.5" />
                            {formattedWeight}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 mt-0.5">
                        {hasDiscount && (
                          <span className="text-[11px] text-slate-500 line-through">
                            LKR {(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        )}
                        <p className="text-xs text-sky-400 font-bold">
                          LKR {(effectivePrice * item.quantity).toFixed(2)}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          ({isKg ? `LKR ${effectivePrice}/Kg` : `LKR ${effectivePrice} ea`})
                        </span>
                        {hasDiscount && (
                          <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1 rounded font-bold">
                            -{item.product.discount_percentage}%
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition"
                      title="Remove Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/40">
                    {isKg ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, 0.25, true)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-[10px] rounded font-semibold transition"
                        >
                          250g
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, 0.5, true)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-[10px] rounded font-semibold transition"
                        >
                          500g
                        </button>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, 1.0, true)}
                          className="px-2 py-0.5 bg-slate-800 hover:bg-sky-600/30 text-sky-400 border border-sky-500/30 text-[10px] rounded font-semibold transition"
                        >
                          1Kg
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">Quantity</span>
                    )}

                    <div className="flex items-center bg-slate-800 rounded-lg p-1 gap-1 ml-auto">
                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, isKg ? -0.1 : -1, false)
                        }
                        className="p-1 hover:bg-slate-700 rounded text-slate-300"
                        title={isKg ? '-100g' : '-1'}
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <QuantityInput item={item} onUpdateQuantity={onUpdateQuantity} />

                      <button
                        onClick={() =>
                          onUpdateQuantity(item.product.id, isKg ? 0.1 : 1, false)
                        }
                        className="p-1 hover:bg-slate-700 rounded text-slate-300"
                        title={isKg ? '+100g' : '+1'}
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
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
            <div className="flex justify-between items-center">
              <label className="text-xs text-slate-400 font-medium">Cash Received (LKR)</label>
              {isCashInsufficient && (
                <span className="text-[10px] text-red-400 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3 h-3" /> Insufficient
                </span>
              )}
            </div>
            <input
              type="number"
              placeholder="0.00"
              value={cashGiven}
              onChange={(e) => setCashGiven(e.target.value)}
              className={`w-full bg-slate-950 border rounded-xl p-2.5 text-white font-bold mt-1 outline-none transition ${
                isCashInsufficient
                  ? 'border-red-500/80 focus:border-red-500'
                  : 'border-slate-800 focus:border-sky-500'
              }`}
            />
          </div>

          {paidAmount > 0 && (
            <div className="flex justify-between text-xs font-semibold px-1">
              <span className="text-slate-400">Balance to give:</span>
              <span
                className={
                  changeAmount >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400'
                }
              >
                LKR {changeAmount.toFixed(2)}
              </span>
            </div>
          )}

          <button
            disabled={
              submitting || processing || cart.length === 0 || paidAmount < totalAmount
            }
            onClick={executeCheckout}
            className="w-full bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-600 font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-2 shadow-lg shadow-sky-500/10"
          >
            <CreditCard className="w-5 h-5" />
            {submitting || processing ? 'Processing Order...' : 'Complete Checkout'}
          </button>
        </div>
      </div>

      {/* Custom Item Modal */}
      <CustomItemModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddItem={(customItem) => {
          if (onAddCustomToCart) {
            onAddCustomToCart(customItem)
          }
        }}
      />

      {/* Receipt Modal */}
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