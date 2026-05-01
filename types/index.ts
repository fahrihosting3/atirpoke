export interface User {
  id: string
  email: string
  name: string
  password: string
  createdAt: string
  updatedAt: string
}

export interface BotSettings {
  id: string
  userId: string
  botToken: string
  ownerId: string
  botName?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  userId: string
  name: string
  description: string
  price: number
  stock: number
  category: string
  imageUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string
  productId: string
  productName: string
  quantity: number
  totalPrice: number
  buyerName: string
  buyerContact: string
  status: 'pending' | 'processing' | 'completed' | 'cancelled'
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Database {
  users: User[]
  botSettings: BotSettings[]
  products: Product[]
  orders: Order[]
}

export type SessionUser = Omit<User, 'password'>
