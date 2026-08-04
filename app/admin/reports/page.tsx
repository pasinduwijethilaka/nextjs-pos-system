'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ShoppingBag, DollarSign, Calendar, RefreshCw, Printer } from 'lucide-react'
import ReceiptModal from '@/components/ReceiptModal'
import AdminAuthModal from '../AdminAuthModal'

interface OrderItem {
  id: number
  product_id: number
  quantity: number
  unit_price: number
  products?: {
    name: string
  }
}

interface Order {
  id: number
  created_at: string
  total_amount: number
  payment_method?: string
  order_items?: OrderItem[]
}

export default function ReportsPage() {
  const router = useRouter()

  // 🔐 1. Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(true)

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  // Selected Order for Re-printing Receipt
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  // 🔐 2. Check Session Storage on Mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAdminAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      setShowAuthModal(false)
      fetchOrders()
    }
  }, [])

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setShowAuthModal(false)
    sessionStorage.setItem('isAdminAuthenticated', 'true')
    fetchOrders()
  }

  const handleAuthCancel = () => {
    router.push('/') // Cancel කළොත් Main Terminal එකට Redirect වෙනවා
  }

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        created_at,
        total_amount,
        payment_method,
        order_items (
          id,
          product_id,
          quantity,
          unit_price,
          products ( name )
        )
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
    } else if (data) {
      setOrders(data as any)
    }
    setLoading(false)
  }

  // Calculate Today's Stats
  const today = new Date().toISOString().split('T')[0]
  const todayOrders = orders.filter((o) => o.created_at.startsWith(today))
  const todaySalesTotal = todayOrders.reduce((sum, o) => sum + o.total_amount, 0)
  const totalSalesAllTime = orders.reduce((sum, o) => sum + o.total_amount, 0)

  // Handle Open Receipt Modal
  const handlePrintReceipt = (order: Order) => {
    setSelectedOrder(order)
    setIsReceiptOpen(true)
  }

  // 🔐 3. Auth වී නැත්නම් Modal එක පෙන්වීම
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <AdminAuthModal
          isOpen={showAuthModal}
          onSuccess={handleAuthSuccess}
          onCancel={handleAuthCancel}
        />
      </div>
    )
  }

  // 🔐 4. Auth වූ පසු පෙන්වන Reports Page UI එක
  return (
    <div className="p-8 bg-slate-950 min-h-screen text-slate-100 font-sans">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Reports & Analytics</h1>
          <p className="text-slate-400 text-sm mt-1">Track daily sales performance and order history</p>
        </div>
        <button
          onClick={fetchOrders}
          className="bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <DollarSign className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase">Today's Total Revenue</p>
            <h3 className="text-2xl font-bold text-white mt-1">LKR {todaySalesTotal.toFixed(2)}</h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase">Today's Orders</p>
            <h3 className="text-2xl font-bold text-white mt-1">{todayOrders.length} Orders</h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase">All-Time Revenue</p>
            <h3 className="text-2xl font-bold text-white mt-1">LKR {totalSalesAllTime.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Recent Transactions</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading sales data...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No orders recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-xs border-b border-slate-800">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Date & Time</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-4 font-mono font-bold text-sky-400">#{order.id}</td>
                    <td className="p-4 text-slate-300">
                      {new Date(order.created_at).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="p-4">
                      <span className="bg-slate-800 px-2.5 py-1 rounded-lg text-xs font-semibold">
                        {order.order_items?.reduce((sum, item) => sum + item.quantity, 0) || 0} Items
                      </span>
                    </td>
                    <td className="p-4 font-bold text-white">
                      LKR {order.total_amount.toFixed(2)}
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handlePrintReceipt(order)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 justify-center mx-auto transition"
                      >
                        <Printer className="w-3.5 h-3.5" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🖨️ Receipt Modal for Re-printing */}
      {selectedOrder && (
        <ReceiptModal
          isOpen={isReceiptOpen}
          onClose={() => setIsReceiptOpen(false)}
          orderId={selectedOrder.id}
          cartItems={
            selectedOrder.order_items?.map((item) => ({
              product: {
                id: item.product_id,
                name: item.products?.name || 'Product',
                price: item.unit_price,
                category_id: 0,
                stock_quantity: 0,
                barcode: '',        
                cost_price: 0,     
                image_url: '',     
              },
              quantity: item.quantity,
            })) || []
          }
          totalAmount={selectedOrder.total_amount}
          paidAmount={selectedOrder.total_amount}
          changeAmount={0}
        />
      )}
    </div>
  )
}