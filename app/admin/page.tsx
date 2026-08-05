'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Product, Category } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SummaryCards from './SummaryCards'
import SalesChart from './SalesChart'
import ProductForm from './ProductForm'
import InventoryTable from './InventoryTable'
import AdminAuthModal from './AdminAuthModal'
import ReceiptSettingsControl from './ReceiptSettingsControl' 

interface OrderSummary {
  id: number
  total_amount: number
  created_at: string
}

export default function AdminDashboard() {
  const router = useRouter()

  // 🔐 Authentication States
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(true)

  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [orders, setOrders] = useState<OrderSummary[]>([])
  const [loading, setLoading] = useState(true)

  // Product Form State
  const [editingProductId, setEditingProductId] = useState<number | null>(null)
  const [name, setName] = useState('')
  const [barcode, setBarcode] = useState('')
  const [price, setPrice] = useState('')
  const [costPrice, setCostPrice] = useState('')
  const [discount, setDiscount] = useState('') // 🏷️ Discount Percentage State
  const [stock, setStock] = useState('')
  const [unitType, setUnitType] = useState<'unit' | 'kg' | 'g'>('unit') // ⚖️ Supports 'unit', 'kg', and 'g'
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // 🔐 Check Session Storage on Mount
  useEffect(() => {
    const authStatus = sessionStorage.getItem('isAdminAuthenticated')
    if (authStatus === 'true') {
      setIsAuthenticated(true)
      setShowAuthModal(false)
      fetchAdminData()
    }
  }, [])

  // 🔍 Hardware Barcode Scanner Listener
  useEffect(() => {
    // Auth වී නැතිනම් Scanner එක active කිරීම අවශ්‍ය නැත
    if (!isAuthenticated) return

    let barcodeBuffer = ''
    let timeoutId: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      
      // වෙනත් input හෝ textarea එකක type කරද්දී, එය "barcode" input එක නොවේ නම් scanner එක මඟින් එය override කිරීම වළක්වයි
      if (
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA'
      ) {
        // Form එකේ barcode field එක ඇතුළේ කෙලින්ම type කරනවා නම් සාමාන්‍ය පරිදි type වෙන්න දෙන්න
        if (target.getAttribute('name') === 'barcode' || target.getAttribute('id') === 'barcode') {
          return
        }
        // වෙනත් field එකක (උදා: Product Name, Price) type කරන විට global scanner listener එක නතර කරන්න
        return
      }

      // Scanner එකකින් Scan කර අවසන් වූ පසු සාමාන්‍යයෙන් Enter Key එකක් එයි
      if (e.key === 'Enter') {
        if (barcodeBuffer.trim().length > 0) {
          e.preventDefault()
          setBarcode(barcodeBuffer.trim()) // Barcode state එකට අගය එකතු කිරීම
          barcodeBuffer = ''
        }
        return
      }

      // Scanner එකෙන් එන Characters එකින් එක Buffer එකට එකතු කිරීම
      if (e.key.length === 1) {
        barcodeBuffer += e.key

        // Hardware scanner එකක් ඉතා වේගයෙන් type කරයි (~10-50ms). 
        // මිනිසෙකු ටයිප් කරනවාට වඩා වේගවත් බැවින් තත්පර 0.1කින් buffer එක auto clear වේ.
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          barcodeBuffer = ''
        }, 100)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isAuthenticated])

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setShowAuthModal(false)
    sessionStorage.setItem('isAdminAuthenticated', 'true')
    fetchAdminData()
  }

  const handleAuthCancel = () => {
    router.push('/') // Main Terminal එකට රීඩිරෙක්ට් කිරීම
  }

  const fetchAdminData = async () => {
    setLoading(true)
    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true })

    const { data: catData } = await supabase.from('categories').select('*')

    const { data: orderData } = await supabase
      .from('orders')
      .select('id, total_amount, created_at')
      .order('created_at', { ascending: true })

    if (prodData) setProducts(prodData)
    if (catData) setCategories(catData)
    if (orderData) setOrders(orderData)
    setLoading(false)
  }

  const handleEditClick = (product: Product) => {
    setEditingProductId(product.id)
    setName(product.name)
    setBarcode(product.barcode || '')
    setPrice(product.price.toString())
    setCostPrice(product.cost_price ? product.cost_price.toString() : '')
    setDiscount(product.discount_percentage ? product.discount_percentage.toString() : '') // Load discount %
    setStock(product.stock_quantity.toString())
    setUnitType((product.unit_type as 'unit' | 'kg' | 'g') || 'unit') // Safely set unit_type
    setCategoryId(product.category_id ? product.category_id.toString() : '')
    setImageUrl(product.image_url || '')
  }

  // 🗑️ Product Delete Handler
  const handleDeleteProduct = async (productId: number, productName: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${productName}"?`)
    if (!confirmDelete) return

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId)

      if (error) throw error

      alert('Product deleted successfully! 🗑️')
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (err: any) {
      alert('Failed to delete product: ' + err.message)
    }
  }

  const resetForm = () => {
    setEditingProductId(null)
    setName('')
    setBarcode('')
    setPrice('')
    setCostPrice('')
    setDiscount('') // Reset discount state
    setStock('')
    setUnitType('unit') // Reset unitType state
    setCategoryId('')
    setImageUrl('')
  }

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total_amount), 0)
  const totalOrders = orders.length
  const lowStockCount = products.filter((p) => p.stock_quantity < 5).length

  const chartData = orders.map((o) => ({
    date: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    Sales: o.total_amount,
  }))

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !price || !stock) return alert('Please fill required fields!')

    setSubmitting(true)

    const payload = {
      name,
      barcode: barcode || null,
      price: parseFloat(price),
      cost_price: costPrice ? parseFloat(costPrice) : null,
      discount_percentage: discount ? parseFloat(discount) : 0, // Save discount %
      stock_quantity: parseFloat(stock), // Supports decimals for Kg/g stock
      unit_type: unitType, // Save unit_type
      category_id: categoryId ? parseInt(categoryId) : null,
      image_url: imageUrl || null,
    }

    try {
      if (editingProductId) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProductId)

        if (error) throw error
        alert('Product Updated Successfully! ✏️')
      } else {
        const { error } = await supabase.from('products').insert([payload])

        if (error) throw error
        alert('Product Added Successfully! 🎉')
      }

      resetForm()
      fetchAdminData()
    } catch (err: any) {
      alert('Error saving product: ' + err.message)
    } finally {
      setSubmitting(false)
    }
  }

  // 🔐 Auth වී නැත්නම් Modal එක විතරක් Render කිරීම
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

  // 🔐 Auth වුණාට පසු පෙන්වන Dashboard View
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sky-400 text-sm hover:underline mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Cashier Terminal
          </Link>
          <h1 className="text-3xl font-bold text-white">Admin Sales & Management Dashboard</h1>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <SummaryCards
        totalRevenue={totalRevenue}
        totalOrders={totalOrders}
        lowStockCount={lowStockCount}
        totalProducts={products.length}
      />

      {/* Sales Chart */}
      <SalesChart chartData={chartData} />

      {/* Form & Inventory Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Column 1: Product Add / Edit Form */}
        <div className="space-y-8">
          <ProductForm
            editingProductId={editingProductId}
            categories={categories}
            name={name}
            setName={setName}
            barcode={barcode}
            setBarcode={setBarcode}
            price={price}
            setPrice={setPrice}
            costPrice={costPrice}
            setCostPrice={setCostPrice}
            discount={discount}
            setDiscount={setDiscount}
            stock={stock}
            setStock={setStock}
            unitType={unitType}
            setUnitType={setUnitType}
            categoryId={categoryId}
            setCategoryId={setCategoryId}
            imageUrl={imageUrl}
            setImageUrl={setImageUrl}
            submitting={submitting}
            handleSubmitProduct={handleSubmitProduct}
            resetForm={resetForm}
          />

          {/* 🧾 Receipt Customizer Panel */}
          <ReceiptSettingsControl />
        </div>

        {/* Column 2 & 3: Inventory Table */}
        <div className="lg:col-span-2">
          <InventoryTable
            products={products}
            handleEditClick={handleEditClick}
            onDeleteClick={handleDeleteProduct}
            onStockUpdated={fetchAdminData}
          />
        </div>
      </div>
    </div>
  )
}