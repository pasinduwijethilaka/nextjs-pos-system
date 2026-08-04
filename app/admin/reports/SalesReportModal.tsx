'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Download, FileSpreadsheet, FileText, Calendar, X, Loader2 } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface SalesReportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface OrderReportItem {
  id: number
  total_amount: number
  created_at: string
  order_items?: {
    quantity: number
    unit_price: number
    cost_price?: number
    products?: { name: string }
  }[]
}

export default function SalesReportModal({ isOpen, onClose }: SalesReportModalProps) {
  const [filterType, setFilterType] = useState<'daily' | 'weekly' | 'monthly'>('daily')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  // 🗓️ Date Range Calculate කරන Helper
  const getDateRange = () => {
    const now = new Date()
    let startDate = new Date()

    if (filterType === 'daily') {
      startDate.setHours(0, 0, 0, 0)
    } else if (filterType === 'weekly') {
      const day = startDate.getDay()
      const diff = startDate.getDate() - day + (day === 0 ? -6 : 1) // Monday as start
      startDate.setDate(diff)
      startDate.setHours(0, 0, 0, 0)
    } else if (filterType === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return { startDate: startDate.toISOString(), endDate: now.toISOString() }
  }

  // 📦 Supabase එකෙන් Orders Fetch කරගැනීම
  const fetchReportData = async () => {
    const { startDate, endDate } = getDateRange()

    const { data, error } = await supabase
      .from('orders')
      .select(`
        id,
        total_amount,
        created_at,
        order_items (
          quantity,
          unit_price,
          products ( name )
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    if (error) {
      alert('Error fetching report data: ' + error.message)
      return []
    }

    return data as unknown as OrderReportItem[]
  }

  // 📊 Excel Sheet Download කිරීම
  const handleExportExcel = async () => {
    setLoading(true)
    const orders = await fetchReportData()

    if (!orders || orders.length === 0) {
      alert('No sales found for the selected time period!')
      setLoading(false)
      return
    }

    const excelData = orders.map((order) => ({
      'Order ID': `#${order.id}`,
      'Date & Time': new Date(order.created_at).toLocaleString(),
      'Total Amount (LKR)': order.total_amount,
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Report')

    XLSX.writeFile(
      workbook,
      `Sales_Report_${filterType.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.xlsx`
    )
    setLoading(false)
  }

  // 📄 PDF Report Download කිරීම
  const handleExportPDF = async () => {
    setLoading(true)
    const orders = await fetchReportData()

    if (!orders || orders.length === 0) {
      alert('No sales found for the selected time period!')
      setLoading(false)
      return
    }

    const doc = new jsPDF()
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0)

    // Title Section
    doc.setFontSize(18)
    doc.text(`Sales Report (${filterType.toUpperCase()})`, 14, 20)

    doc.setFontSize(10)
    doc.text(`Generated Date: ${new Date().toLocaleString()}`, 14, 28)
    doc.text(`Total Orders: ${orders.length}`, 14, 34)
    doc.text(`Total Revenue: LKR ${totalRevenue.toFixed(2)}`, 14, 40)

    // Table Data
    const tableBody = orders.map((order) => [
      `#${order.id}`,
      new Date(order.created_at).toLocaleString(),
      `LKR ${Number(order.total_amount).toFixed(2)}`,
    ])

    autoTable(doc, {
      startY: 48,
      head: [['Order ID', 'Date & Time', 'Total Amount']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] }, // Sky Blue Header
    })

    doc.save(`Sales_Report_${filterType.toUpperCase()}_${new Date().toISOString().slice(0, 10)}.pdf`)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Export Sales Reports</h3>
            <p className="text-xs text-slate-400">Download Daily, Weekly or Monthly reports</p>
          </div>
        </div>

        {/* Filter Type Selection */}
        <div className="space-y-2 mb-6">
          <label className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-sky-400" /> Select Period
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['daily', 'weekly', 'monthly'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`py-2.5 rounded-xl text-xs font-bold capitalize transition border ${
                  filterType === type
                    ? 'bg-sky-500 text-white border-sky-400 shadow-lg shadow-sky-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Download Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* Excel Export Button */}
          <button
            onClick={handleExportExcel}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-xl font-bold text-xs transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            )}
            Excel Report
          </button>

          {/* PDF Export Button */}
          <button
            onClick={handleExportPDF}
            disabled={loading}
            className="flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 py-3 rounded-xl font-bold text-xs transition disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-rose-400" />
            )}
            PDF Report
          </button>
        </div>

      </div>
    </div>
  )
}