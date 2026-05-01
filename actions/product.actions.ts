'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { createProduct, updateProduct, deleteProduct, getProductById } from '@/lib/github-db'

export async function createProductAction(formData: FormData) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)
  const category = formData.get('category') as string
  const imageUrl = formData.get('imageUrl') as string
  const isActive = formData.get('isActive') === 'on'

  if (!name || !description || isNaN(price) || isNaN(stock) || !category) {
    return { error: 'Semua field harus diisi dengan benar' }
  }

  const product = await createProduct({
    userId: session.id,
    name,
    description,
    price,
    stock,
    category,
    imageUrl: imageUrl || undefined,
    isActive,
  })

  if (!product) {
    return { error: 'Gagal membuat produk' }
  }

  revalidatePath('/dashboard/products', 'max')
  redirect('/dashboard/products')
}

export async function updateProductAction(id: string, formData: FormData) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const existingProduct = await getProductById(id)
  if (!existingProduct || existingProduct.userId !== session.id) {
    return { error: 'Produk tidak ditemukan' }
  }

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const stock = parseInt(formData.get('stock') as string)
  const category = formData.get('category') as string
  const imageUrl = formData.get('imageUrl') as string
  const isActive = formData.get('isActive') === 'on'

  if (!name || !description || isNaN(price) || isNaN(stock) || !category) {
    return { error: 'Semua field harus diisi dengan benar' }
  }

  const product = await updateProduct(id, {
    name,
    description,
    price,
    stock,
    category,
    imageUrl: imageUrl || undefined,
    isActive,
  })

  if (!product) {
    return { error: 'Gagal mengupdate produk' }
  }

  revalidatePath('/dashboard/products', 'max')
  redirect('/dashboard/products')
}

export async function deleteProductAction(id: string) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const existingProduct = await getProductById(id)
  if (!existingProduct || existingProduct.userId !== session.id) {
    return { error: 'Produk tidak ditemukan' }
  }

  const success = await deleteProduct(id)
  if (!success) {
    return { error: 'Gagal menghapus produk' }
  }

  revalidatePath('/dashboard/products', 'max')
  return { success: true }
}

export async function toggleProductStatusAction(id: string) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const existingProduct = await getProductById(id)
  if (!existingProduct || existingProduct.userId !== session.id) {
    return { error: 'Produk tidak ditemukan' }
  }

  const product = await updateProduct(id, {
    isActive: !existingProduct.isActive,
  })

  if (!product) {
    return { error: 'Gagal mengubah status produk' }
  }

  revalidatePath('/dashboard/products', 'max')
  return { success: true }
}
