'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product, Category } from '@/types'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import SummaryCards from './SummaryCards'
import SalesChart from './SalesChart'
import ProductForm from './ProductForm'
import InventoryTable from './InventoryTable'




interface OrderSummary {
  id: number
  total_amount: number
  created_at: string
}

export default function AdminDashboard() {
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
  const [stock, setStock] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    const { data: prodData } = await supabase.from('products').select('*').order('id', { ascending: true })
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
    setStock(product.stock_quantity.toString())
    setCategoryId(product.category_id ? product.category_id.toString() : '')
    setImageUrl(product.image_url || '')
  }

  const resetForm = () => {
    setEditingProductId(null)
    setName('')
    setBarcode('')
    setPrice('')
    setCostPrice('')
    setStock('')
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
      stock_quantity: parseInt(stock),
      category_id: categoryId ? parseInt(categoryId) : null,
      image_url: imageUrl || null,
    }

    if (editingProductId) {
      const { error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editingProductId)

      if (error) {
        alert('Error updating product: ' + error.message)
      } else {
        alert('Product Updated Successfully! ✏️')
        resetForm()
        fetchAdminData()
      }
    } else {
      const { error } = await supabase.from('products').insert([payload])

      if (error) {
        alert('Error adding product: ' + error.message)
      } else {
        alert('Product Added Successfully! 🎉')
        resetForm()
        fetchAdminData()
      }
    }

    setSubmitting(false)
  }

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
          stock={stock}
          setStock={setStock}
          categoryId={categoryId}
          setCategoryId={setCategoryId}
          imageUrl={imageUrl}
          setImageUrl={setImageUrl}
          submitting={submitting}
          handleSubmitProduct={handleSubmitProduct}
          resetForm={resetForm}
        />

        <InventoryTable products={products} handleEditClick={handleEditClick} />
      </div>
    </div>
  )
}