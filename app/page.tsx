'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Product, Category, CartItem, ProductBatch } from '@/types'

import Header from '@/components/Header'
import CategoryFilter from '@/components/CategoryFilter'
import ProductGrid from '@/components/ProductGrid'
import CartSidebar from '@/components/CartSidebar'
import PriceSelectionModal from '@/components/PriceSelectionModal'

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

  // Batch / Price Modal States
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false)
  const [selectedModalProduct, setSelectedModalProduct] = useState<Product | null>(null)

  // 🔄 Fetch Data Function
  const fetchData = async () => {
    setLoading(true)

    // 1. Fetch Categories
    const { data: catData } = await supabase.from('categories').select('*')

    // 2. Fetch Products with Batches
    const { data: productsData, error } = await supabase
      .from('products')
      .select(`
        *,
        batches:product_batches(*)
      `)
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching products:', error)
    }

    if (catData) setCategories(catData)

    if (productsData) {
      // Dummy product එක අයින් කරලා state එකට set කිරීම
      setProducts(productsData.filter((p) => p.id !== DUMMY_PRODUCT_ID))
    }

    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  // 🛒 Add Item directly to Cart (or trigger Batch Modal if multiple prices exist)
  const addToCart = useCallback((product: Product, initialQty: number = 1) => {
    if (product.stock_quantity <= 0) {
      return alert('Out of stock! මේ Item එකේ Stock ඉවරයි.')
    }

    // Product එකට Multiple Batches/Prices තියෙනවා නම් Modal එක Open කරන්න
    if (product.batches && product.batches.length > 1) {
      setSelectedModalProduct(product)
      setIsPriceModalOpen(true)
      return
    }

    // Batch 1ක් පමණක් තියෙනවා නම් හෝ Batches නැත්නම් direct Add කරන්න
    addItemToCartWithBatch(product, product.batches?.[0])
  }, [])

  // 📦 Selected Batch එකත් එක්ක Item එක Cart එකට දාන Logic එක
  const addItemToCartWithBatch = (product: Product, selectedBatch?: ProductBatch) => {
    const finalPrice = selectedBatch?.unit_price || product.price

    const productWithBatchPrice: Product = {
      ...product,
      price: finalPrice,
      // Unique Cart Item ID Key (Batch තිබේ නම් Batch ID එකෙන්, නැතහොත් Product ID එකෙන්)
      selected_batch_id: selectedBatch?.id,
    }

    setCart((prev) => {
      // Cart එකේ එකම Product එකේ එකම Batch එක තියෙනවාදැයි පරීක්ෂා කිරීම
      const existing = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.product.selected_batch_id === selectedBatch?.id
      )

      if (existing) {
        const newQty = Number((existing.quantity + 1).toFixed(3))
        if (newQty > (selectedBatch?.quantity || product.stock_quantity)) {
          alert('Stock limit exceeded!')
          return prev
        }
        return prev.map((item) =>
          item.product.id === product.id &&
          item.product.selected_batch_id === selectedBatch?.id
            ? { ...item, quantity: newQty }
            : item
        )
      }

      return [...prev, { product: productWithBatchPrice, quantity: 1 }]
    })

    setIsPriceModalOpen(false)
  }

  // 🔍 Hardware Barcode Scanner Listener
  useEffect(() => {
    let barcodeBuffer = ''
    let timeoutId: NodeJS.Timeout

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) {
        return
      }

      if (e.key === 'Enter') {
        if (barcodeBuffer.trim().length > 0) {
          const scannedBarcode = barcodeBuffer.trim()
          const foundProduct = products.find((p) => p.barcode === scannedBarcode)

          if (foundProduct) {
            addToCart(foundProduct, 1)
          } else {
            alert(`Barcode "${scannedBarcode}" හිමි Product එකක් හමු නොවුණි!`)
          }
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
      clearTimeout(timeoutId)
    }
  }, [products, addToCart])

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory ? p.category_id === selectedCategory : true
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery))
    return matchesCategory && matchesSearch
  })

  // ➕ Custom Item Add Handler
  const handleAddCustomToCart = ({
    name,
    price,
    quantity,
  }: {
    name: string
    price: number
    quantity: number
  }) => {
    const uniqueTempId = -Math.floor(Date.now() + Math.random() * 1000)

    const customProduct: Product = {
      id: uniqueTempId,
      name: name,
      price: price,
      cost_price: 0,
      category_id: categories[0]?.id || 1,
      stock_quantity: 999999,
      barcode: `CUSTOM-${Math.abs(uniqueTempId)}`,
      unit_type: 'unit',
      is_custom: true,
      image_url: '',
    }

    setCart((prev) => [...prev, { product: customProduct, quantity }])
  }

  const updateQuantity = (
    productId: number,
    newQtyOrDelta: number,
    isDirectValue: boolean = false
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const calculatedQty = isDirectValue
              ? newQtyOrDelta
              : item.quantity + newQtyOrDelta

            const finalQty = Number(calculatedQty.toFixed(3))

            if (finalQty > item.product.stock_quantity) {
              alert(
                `Maximum stock limit reached! Only ${item.product.stock_quantity}${
                  item.product.unit_type === 'kg' ? ' Kg' : ''
                } available.`
              )
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
      />

      {/* Price Selection Modal */}
      <PriceSelectionModal
        isOpen={isPriceModalOpen}
        product={selectedModalProduct}
        onClose={() => setIsPriceModalOpen(false)}
        onSelectBatch={addItemToCartWithBatch}
      />
    </div>
  )
}