export interface Category {
  id: number
  name: string
}

export interface Product {
  id: number
  name: string
  barcode: string
  price: number
  cost_price: number
  stock_quantity: number
  category_id: number
  image_url: string
}

export interface CartItem {
  product: Product
  quantity: number
}