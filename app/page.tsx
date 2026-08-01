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
    const { data: prodData } = await supabase.from('products').select('*')

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

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) return alert('Out of stock!')

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          alert('Cannot add more than available stock!')
          return prev
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            if (newQty > item.product.stock_quantity) {
              alert('Reached maximum stock limit!')
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

  const handleCheckout = async (paymentMethod: 'cash' | 'card') => {
    if (cart.length === 0) return alert('Cart is empty!')
    setProcessing(true)

    try {
      const totalAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([{ total_amount: totalAmount, payment_method: paymentMethod }])
        .select()
        .single()

      if (orderErr) throw orderErr

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: item.product.price,
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItems)
      if (itemsErr) throw itemsErr

      for (const item of cart) {
        await supabase
          .from('products')
          .update({ stock_quantity: item.product.stock_quantity - item.quantity })
          .eq('id', item.product.id)
      }

      alert('Sale Completed Successfully! 🎉')
      setCart([])
      fetchData()
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
        updateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        handleCheckout={handleCheckout}
        processing={processing}
      />
    </div>
  )
}