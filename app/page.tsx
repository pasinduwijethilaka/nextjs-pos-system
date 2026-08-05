'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Product, Category, CartItem } from '@/types'

import Header from '@/components/Header'
import CategoryFilter from '@/components/CategoryFilter'
import ProductGrid from '@/components/ProductGrid'
import CartSidebar from '@/components/CartSidebar'

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

  // 🔍 Hardware Barcode Scanner Listener
  useEffect(() => {
    let barcodeBuffer = ''
    let timeoutId: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      // User Search bar එකේ type කරද්දී ගෝලීය barcode scan නොවීමට
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.trim().length > 0) {
          handleBarcodeScan(barcodeBuffer.trim())
          barcodeBuffer = ''
        }
        return
      }

      if (e.key.length === 1) {
        barcodeBuffer += e.key

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
  }, [products])

  const handleBarcodeScan = (scannedBarcode: string) => {
    const foundProduct = products.find((p) => p.barcode === scannedBarcode)

    if (foundProduct) {
      addToCart(foundProduct, 1)
    } else {
      alert(`Barcode "${scannedBarcode}" හිමි Product එකක් හමු නොවුණි!`)
    }
  }

  const fetchData = async () => {
    setLoading(true)
    const { data: catData } = await supabase.from('categories').select('*')
    const { data: prodData } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true })

    if (catData) setCategories(catData)
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

  const handleAddCustomToCart = ({ name, price, quantity }: { name: string; price: number; quantity: number }) => {
    const tempCartId = -Math.floor(100000 + Math.random() * 900000)

    const customProduct: Product = {
      id: DUMMY_PRODUCT_ID,
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

  const handleCheckout = async (paymentMethod: 'cash' | 'card') => {
    if (cart.length === 0) return alert('Cart is empty!')
    setProcessing(true)

    try {
      const totalAmount = cart.reduce(
        (sum, item) => sum + getEffectivePrice(item.product) * item.quantity,
        0
      )

      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert([{ total_amount: totalAmount, payment_method: paymentMethod }])
        .select('id')
        .single()

      if (orderErr || !order) {
        throw new Error(`Order save error: ${orderErr?.message}`)
      }

      const orderItemsData = cart.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        unit_price: getEffectivePrice(item.product),
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(orderItemsData)

      if (itemsErr) {
        throw new Error(`Order items error: ${itemsErr.message}`)
      }

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