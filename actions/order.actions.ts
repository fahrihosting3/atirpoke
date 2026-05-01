'use server'

import { revalidatePath } from 'next/cache'
import { getSession } from '@/lib/auth'
import { updateOrder, deleteOrder, getOrderById } from '@/lib/github-db'
import type { Order } from '@/types'

export async function updateOrderStatusAction(id: string, status: Order['status']) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const existingOrder = await getOrderById(id)
  if (!existingOrder || existingOrder.userId !== session.id) {
    return { error: 'Order tidak ditemukan' }
  }

  const order = await updateOrder(id, { status })

  if (!order) {
    return { error: 'Gagal mengupdate status order' }
  }

  revalidatePath('/dashboard/orders', 'max')
  return { success: true }
}

export async function deleteOrderAction(id: string) {
  const session = await getSession()
  if (!session) {
    return { error: 'Unauthorized' }
  }

  const existingOrder = await getOrderById(id)
  if (!existingOrder || existingOrder.userId !== session.id) {
    return { error: 'Order tidak ditemukan' }
  }

  const success = await deleteOrder(id)
  if (!success) {
    return { error: 'Gagal menghapus order' }
  }

  revalidatePath('/dashboard/orders', 'max')
  return { success: true }
}
