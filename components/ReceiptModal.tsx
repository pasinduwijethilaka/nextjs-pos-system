'use client'

import React, { useState, useEffect } from 'react'
import { CartItem, ReceiptSettings } from '@/types'
import { Printer, X, CheckCircle2 } from 'lucide-react'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: number | null
  cartItems: CartItem[]
  totalAmount: number
  paidAmount: number
  changeAmount: number
  settings?: ReceiptSettings
}

// ⚙️ Default Fallback Settings
const defaultSettings: ReceiptSettings = {
  storeName: 'SMART POS STORE',
  storeAddress: 'No. 123, Main Street, Colombo',
  storePhone: '+94 77 123 4567',
  showOriginalPrice: true,
  showSavingsBanner: true,
  footerMessage: 'Thank You For Shopping With Us! Please Come Again.',
}

export default function ReceiptModal({
  isOpen,
  onClose,
  orderId,
  cartItems,
  totalAmount,
  paidAmount,
  changeAmount,
  settings,
}: ReceiptModalProps) {
  const [liveSettings, setLiveSettings] = useState<ReceiptSettings>(defaultSettings)

  // 🔄 LocalStorage එකෙන් Admin Settings Auto-Sync කරගැනීම
  useEffect(() => {
    const loadSavedSettings = () => {
      const saved = localStorage.getItem('pos_receipt_settings')
      if (saved) {
        try {
          setLiveSettings(JSON.parse(saved))
        } catch (e) {
          console.error('Failed to parse receipt settings:', e)
        }
      }
    }

    loadSavedSettings()

    // Storage වෙනස්වීම් Real-time අල්ලා ගැනීමට
    window.addEventListener('storage', loadSavedSettings)
    return () => window.removeEventListener('storage', loadSavedSettings)
  }, [])

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const currentDate = new Date().toLocaleString()
  
  // Props හරහා එන settings වලට හෝ Saved settings වලට මුල් තැන දීම
  const activeSettings = { ...defaultSettings, ...liveSettings, ...settings }

  // 🧮 Discount & Savings Calculations
  const totalSavings = cartItems.reduce((acc, item) => {
    const discountPercent = item.product.discount_percentage || 0
    if (discountPercent > 0) {
      const savingPerItem = item.product.price * (discountPercent / 100)
      return acc + savingPerItem * item.quantity
    }
    return acc
  }, 0)

  // Subtotal calculation (මුළු වටිනාකම)
  const subTotal = totalAmount + totalSavings

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      
      {/* 🖨️ Global Thermal Printer CSS (80mm Auto-Page Formatting) */}
      <style jsx global>{`
        @media print {
          /* Page size format for standard POS printers */
          @page {
            size: 80mm auto;
            margin: 0;
          }

          body {
            background-color: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hide UI elements except print receipt */
          body * {
            visibility: hidden;
          }

          #printable-receipt, #printable-receipt * {
            visibility: visible;
          }

          #printable-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 78mm !important;
            max-width: 78mm !important;
            margin: 0 auto !important;
            padding: 4mm 2mm !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            font-family: 'Courier New', Courier, monospace !important;
          }
        }
      `}</style>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 relative shadow-2xl print:bg-transparent print:border-none print:shadow-none print:p-0">
        
        {/* Top Header Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4 print:hidden">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle2 className="w-5 h-5" />
            <span>Order Completed</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 🖨️ PRINTABLE RECEIPT CONTAINER */}
        <div id="printable-receipt" className="bg-white text-black p-6 rounded-lg font-mono text-xs space-y-3 print:p-0 print:rounded-none">
          
          {/* 🏪 Shop Header */}
          <div className="text-center border-b border-dashed border-gray-400 pb-3">
            <h2 className="text-base font-bold uppercase tracking-wider">{activeSettings.storeName}</h2>
            {activeSettings.storeAddress && <p className="text-[10px] text-gray-600 leading-tight">{activeSettings.storeAddress}</p>}
            {activeSettings.storePhone && <p className="text-[10px] text-gray-600 leading-tight">Tel: {activeSettings.storePhone}</p>}
          </div>

          {/* 📅 Meta Info */}
          <div className="flex justify-between text-[11px] text-gray-700">
            <span>Order #: {orderId || 'N/A'}</span>
            <span>{currentDate}</span>
          </div>

          {/* 🛒 Items Table */}
          <div className="border-t border-b border-dashed border-gray-400 py-2">
            <div className="grid grid-cols-12 font-bold mb-1 border-b border-gray-200 pb-1 text-gray-800 text-[11px]">
              <span className="col-span-6">ITEM</span>
              <span className="col-span-3 text-center">QTY</span>
              <span className="col-span-3 text-right">PRICE</span>
            </div>
            
            {cartItems.map((item) => {
              const p = item.product
              const isKg = p.unit_type === 'kg'
              const discountPercent = p.discount_percentage || 0
              const originalPrice = p.price
              const finalUnitPrice = discountPercent > 0 
                ? originalPrice - (originalPrice * discountPercent / 100) 
                : originalPrice
              const lineTotal = finalUnitPrice * item.quantity

              // Weight / Quantity Display
              const formattedQty = isKg
                ? item.quantity < 1
                  ? `${Math.round(item.quantity * 1000)}g`
                  : `${item.quantity}Kg`
                : `x${item.quantity}`

              return (
                <div key={p.id} className="grid grid-cols-12 my-1.5 items-start">
                  <div className="col-span-6 pr-1">
                    <div className="font-sans font-semibold text-gray-900 leading-tight">
                      {p.name}
                    </div>
                    {/* Unit price indicator */}
                    <div className="text-[9px] text-gray-600">
                      @{finalUnitPrice.toFixed(2)}{isKg ? '/Kg' : ''}
                    </div>
                    {/* Admin Settings වල showOriginalPrice ON කර ඇත්නම් පමණක් Regular Price පෙන්වයි */}
                    {activeSettings.showOriginalPrice && discountPercent > 0 && (
                      <div className="text-[9px] text-gray-500 line-through">
                        Reg: {originalPrice.toFixed(2)} (-{discountPercent}%)
                      </div>
                    )}
                  </div>
                  <div className="col-span-3 text-center text-gray-800 font-medium pt-0.5 text-[11px]">
                    {formattedQty}
                  </div>
                  <div className="col-span-3 text-right font-bold text-gray-900 pt-0.5 text-[11px]">
                    {lineTotal.toFixed(2)}
                  </div>
                </div>
              )
            })}
          </div>

          {/* 💰 Totals */}
          <div className="space-y-1 text-[11px] pt-1">
            {activeSettings.showOriginalPrice && totalSavings > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>SUBTOTAL:</span>
                <span className="line-through">LKR {subTotal.toFixed(2)}</span>
              </div>
            )}
            
            {totalSavings > 0 && (
              <div className="flex justify-between text-green-800 font-bold">
                <span>DISCOUNT:</span>
                <span>- LKR {totalSavings.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-black text-sm text-black pt-1 border-t border-gray-400 mt-1">
              <span>FINAL TOTAL:</span>
              <span>LKR {totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-gray-800 pt-1">
              <span>CASH PAID:</span>
              <span>LKR {paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900">
              <span>BALANCE:</span>
              <span>LKR {changeAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* 🎉 Customer Savings Banner */}
          {activeSettings.showSavingsBanner && totalSavings > 0 && (
            <div className="text-center bg-gray-100 py-1.5 my-2 rounded text-[10px] font-black text-gray-900 border border-gray-300 tracking-tight">
              🎉 YOU SAVED LKR {totalSavings.toFixed(2)} TODAY!
            </div>
          )}

          {/* 💬 Footer Note */}
          <div className="text-center border-t border-dashed border-gray-400 pt-2 text-[10px] text-gray-600 font-medium">
            <p>{activeSettings.footerMessage}</p>
          </div>
        </div>

        {/* Modal Action Buttons (Hidden when printing) */}
        <div className="mt-6 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-sky-500/20"
          >
            <Printer className="w-5 h-5" /> Print Receipt
          </button>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  )
}