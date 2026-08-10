export interface Category {
  id: number
  name: string
  created_at?: string
}

// 📦 Product Batch Interface (Batch System එක සඳහා)
export interface ProductBatch {
  id: number
  product_id: number
  batch_code?: string
  batch_number?: string
  cost_price: number
  selling_price: number // Required
  stock_quantity: number // Required
  unit_price?: number // Optional
  quantity?: number // Optional
  expiry_date?: string
  created_at?: string
}

// 🛒 Product Interface
export interface Product {
  id: number
  name: string
  barcode: string
  category_id: number
  image_url: string | null
  discount_percentage?: number
  unit_type?: 'unit' | 'kg' | 'g'
  is_custom?: boolean
  
  // Batches Array එක
  batches?: ProductBatch[]
  selected_batch_id?: number

  // Backward Compatibility (Display & Fallback)
  price: number
  cost_price?: number
  stock_quantity: number
}

// 🛍️ Cart Item Interface
export interface CartItem {
  product: Product
  selectedBatch?: ProductBatch
  unitPrice?: number
  quantity: number
}

// 🧾 Receipt Customizer Settings Type
export interface ReceiptSettings {
  storeName: string
  storeAddress: string
  storePhone: string
  showOriginalPrice: boolean
  showSavingsBanner: boolean
  footerMessage: string
}