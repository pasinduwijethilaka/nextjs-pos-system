'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product, Category, CartItem } from '@/types'

import Header from '@/components/Header'
import CategoryFilter from '@/components/CategoryFilter'
import ProductGrid from '@/components/ProductGrid'
import CartSidebar from '@/components/CartSidebar'

export default function POSTerminal() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: catData } = await supabase.from('categories').select('*')
    const { data: prodData } = await supabase.from('products').select('*').order('id', { ascending: true })

    if (catData) setCategories(catData)
    if (prodData) setProducts(prodData)
    setLoading(false)
  }

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery))
    return matchesCategory && matchesSearch
  })

  // 🛒 Cart එකට Add කරද්දී Stock Limit Check කිරීම
  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      return alert('Out of stock! මේ Item එකේ Stock ඉවරයි.')
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          alert(`Cannot add more! Only ${product.stock_quantity} items available in stock.`)
          return prev
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  // ➕/➖ Quantity වෙනස් කරද්දී Stock Check කිරීම
  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            if (newQty > item.product.stock_quantity) {
              alert(`Maximum stock limit reached! Only ${item.product.stock_quantity} available.`)
              return item
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null
          }
          return item
        })
        .filter(Boolean) as CartItem[]
    )
  }

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const handleClearCart = () => {
    setCart([])
  }

  // 💳 Checkout Logic (Order + Items + Stock Deduct)
  const handleCheckout = async (paymentMethod: 'cash' | 'card') => {
    if (cart.length === 0) return alert('Cart is empty!')
    setProcessing(true)

    try {
      // 1. Double Check Stock directly from DB before order placement
      for (const item of cart) {
        const { data: latestProd } = await supabase
          .from('products')
          .select('stock_quantity, name')
          .eq('id', item.product.id)
          .single()

        if (!latestProd || latestProd.stock_quantity < item.quantity) {
          throw new Error(
            `Not enough stock for "${item.product.name}". Only ${
              latestProd ? latestProd.stock_quantity : 0
            } left!`
          )
        }
      }

      const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

      // 2. Insert Order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([{ total_amount: totalAmount, payment_method: paymentMethod }])
        .select()
        .single()

      if (orderErr) throw orderErr

      // 3. Insert Order Items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      // 4. Update/Deduct Product Stock in DB safely
      for (const item of cart) {
        const newStock = Math.max(0, item.product.stock_quantity - item.quantity)

        const { error: stockErr } = await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product.id)

        if (stockErr) throw stockErr
      }

      alert('Sale Completed Successfully! 🎉')
      setCart([])
      fetchData() // Refresh products grid to show updated stock values
    } catch (err: any) {
      alert('Checkout failed: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* 🛍️ LEFT SECTION */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <ProductGrid
          products={filteredProducts}
          loading={loading}
          onAddToCart={addToCart}
        />
      </div>

      {/* 🧾 RIGHT SECTION */}
      <CartSidebar
        cart={cart}
        onUpdateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onClearCart={handleClearCart}
        handleCheckout={handleCheckout}
        processing={processing}
      />
    </div>
  )
}