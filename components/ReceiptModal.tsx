'use client'

import React from 'react'
import { CartItem } from '@/types'
import { Printer, X, CheckCircle2 } from 'lucide-react'

interface ReceiptModalProps {
  isOpen: boolean
  onClose: () => void
  orderId: number | null
  cartItems: CartItem[]
  totalAmount: number
  paidAmount: number
  changeAmount: number
}

export default function ReceiptModal({
  isOpen,
  onClose,
  orderId,
  cartItems,
  totalAmount,
  paidAmount,
  changeAmount,
}: ReceiptModalProps) {
  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const currentDate = new Date().toLocaleString()

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-100 relative shadow-2xl">
        
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
        <div id="printable-receipt" className="bg-white text-black p-6 rounded-lg font-mono text-xs space-y-4">
          
          {/* Shop Header */}
          <div className="text-center border-b border-dashed border-gray-400 pb-3">
            <h2 className="text-base font-bold uppercase tracking-wider">SMART POS STORE</h2>
            <p className="text-[10px] text-gray-600">No. 123, Main Street, Colombo</p>
            <p className="text-[10px] text-gray-600">Tel: +94 77 123 4567</p>
          </div>

          {/* Meta Info */}
          <div className="flex justify-between text-[11px]">
            <span>Order #: {orderId || 'N/A'}</span>
            <span>{currentDate}</span>
          </div>

          {/* Items Table */}
          <div className="border-t border-b border-dashed border-gray-400 py-2">
            <div className="grid grid-cols-12 font-bold mb-1 border-b border-gray-200 pb-1">
              <span className="col-span-6">ITEM</span>
              <span className="col-span-2 text-center">QTY</span>
              <span className="col-span-4 text-right">PRICE</span>
            </div>
            {cartItems.map((item) => (
              <div key={item.product.id} className="grid grid-cols-12 my-1">
                <span className="col-span-6 truncate font-sans">{item.product.name}</span>
                <span className="col-span-2 text-center">x{item.quantity}</span>
                <span className="col-span-4 text-right">
                  {(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL:</span>
              <span>LKR {totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>CASH PAID:</span>
              <span>LKR {paidAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>BALANCE:</span>
              <span>LKR {changeAmount.toFixed(2)}</span>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-center border-t border-dashed border-gray-400 pt-3 text-[10px] text-gray-500">
            <p>Thank You For Shopping With Us!</p>
            <p>Please Come Again</p>
          </div>
        </div>

        {/* Modal Action Buttons (Hidden when printing) */}
        <div className="mt-6 flex gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Printer className="w-5 h-5" /> Print Receipt
          </button>
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-4 py-3 rounded-xl transition"
          >
            Close
          </button>
        </div>

      </div>

      {/* Global CSS for Clean Printing (Only prints the receipt) */}
      <style jsx global>{`
        @media print {
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
            width: 100%;
            margin: 0;
            padding: 15px;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  )
}