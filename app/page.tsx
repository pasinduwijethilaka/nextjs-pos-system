'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product, Category, CartItem } from '@/types'

import Header from '@/components/Header'
import CategoryFilter from '@/components/CategoryFilter'
import ProductGrid from '@/components/ProductGrid'
import CartSidebar from '@/components/CartSidebar'

// 🎯 Supabase products table එකේ Custom Product එකේ ID එක (8)
const DUMMY_PRODUCT_ID = 8

export const getEffectivePrice = (product: Product): number => {
  if (product.discount_percentage && product.discount_percentage > 0) {
    const discountAmount = (product.price * product.discount_percentage) / 100
    return product.price - discountAmount
  }
  return product.price
}

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
    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true })

    if (catData) setCategories(catData)
    // Terminal UI එකේ Dummy custom item (ID: 8) එක පෙන්නන්න ඕන නැති නිසා Filter කරමු
    if (prodData) setProducts(prodData.filter((p) => p.id !== DUMMY_PRODUCT_ID))
    setLoading(false)
  }

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery))
    return matchesCategory && matchesSearch
  })

  const addToCart = (product: Product, initialQty: number = 1) => {
    if (product.stock_quantity <= 0) {
      return alert('Out of stock! මේ Item එකේ Stock ඉවරයි.')
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        const newQty = Number((existing.quantity + initialQty).toFixed(3))
        if (newQty > product.stock_quantity) {
          alert(`Cannot add more! Only ${product.stock_quantity}${product.unit_type === 'kg' ? ' Kg' : ''} available in stock.`)
          return prev
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        )
      }
      return [...prev, { product, quantity: initialQty }]
    })
  }

  // ➕ Custom Items වලට Real DB Dummy ID (8) එක යෙදීම
  const handleAddCustomToCart = ({ name, price, quantity }: { name: string; price: number; quantity: number }) => {
    const tempCartId = -Math.floor(100000 + Math.random() * 900000)

    const customProduct: Product = {
      id: DUMMY_PRODUCT_ID, // ID එක 8 ලෙස සෙට් වේ
      name: name,
      price: price,
      cost_price: 0,
      category_id: categories[0]?.id || 1,
      stock_quantity: 999999,
      barcode: `CUSTOM-${Math.abs(tempCartId)}`,
      unit_type: 'unit',
      is_custom: true,
      image_url: ''
    }

    setCart((prev) => [...prev, { product: customProduct, quantity }])
  }

  const updateQuantity = (productId: number, newQtyOrDelta: number, isDirectValue: boolean = false) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const calculatedQty = isDirectValue 
              ? newQtyOrDelta 
              : item.quantity + newQtyOrDelta

            const finalQty = Number(calculatedQty.toFixed(3))

            if (finalQty > item.product.stock_quantity) {
              alert(`Maximum stock limit reached! Only ${item.product.stock_quantity}${item.product.unit_type === 'kg' ? ' Kg' : ''} available.`)
              return item
            }
            return finalQty > 0 ? { ...item, quantity: finalQty } : null
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

  // 💳 Direct Foreign-Key Safe Checkout
  const handleCheckout = async (paymentMethod: 'cash' | 'card') => {
    if (cart.length === 0) return alert('Cart is empty!')
    setProcessing(true)

    try {
      // 1. Calculate Total Amount
      const totalAmount = cart.reduce(
        (sum, item) => sum + getEffectivePrice(item.product) * item.quantity,
        0
      )

      // 2. Insert Orders Table
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([{ total_amount: totalAmount, payment_method: paymentMethod }])
        .select('id')
        .single()

      if (orderErr || !order) {
        throw new Error(`Order save error: ${orderErr?.message}`)
      }

      // 3. Prepare Order Items Data
      const orderItemsData = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id, // ID 8 හෝ Normal Product ID එක Database එකට යයි
        quantity: item.quantity,
        unit_price: getEffectivePrice(item.product),
      }))

      // 4. Insert Order Items Table
      const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsData)

      if (itemsErr) {
        throw new Error(`Order items error: ${itemsErr.message}`)
      }

      // 5. Update Stock (Normal Products සඳහා පමණි)
      for (const item of cart) {
        if (item.product.id === DUMMY_PRODUCT_ID || item.product.is_custom) continue

        const newStock = Math.max(0, Number((item.product.stock_quantity - item.quantity).toFixed(3)))

        await supabase
          .from('products')
          .update({ stock_quantity: newStock })
          .eq('id', item.product.id)
      }

      alert('Sale Completed Successfully! 🎉')
      setCart([])
      fetchData()
    } catch (err: any) {
      alert('Checkout Failed: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
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

      <CartSidebar
        cart={cart}
        onUpdateQuantity={updateQuantity}
        removeFromCart={removeFromCart}
        onClearCart={handleClearCart}
        onAddCustomToCart={handleAddCustomToCart}
        handleCheckout={handleCheckout}
        processing={processing}
      />
    </div>
  )
}