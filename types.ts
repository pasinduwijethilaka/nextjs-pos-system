export interface Category {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  barcode: string
  price: number
  cost_price?: number
  stock_quantity: number
  category_id: number
  image_url: string | null
  discount_percentage?: number
  unit_type?: 'unit' | 'kg' | 'g'
  is_custom?: boolean
}

export interface CartItem {
  product: Product
  quantity: number
}
// 🧾 Admin Receipt Customizer Settings Type
export interface ReceiptSettings {
  storeName: string
  storeAddress: string
  storePhone: string
  showOriginalPrice: boolean   
  showSavingsBanner: boolean   
  footerMessage: string        
}