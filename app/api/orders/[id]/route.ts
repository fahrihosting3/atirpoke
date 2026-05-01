import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getOrderById } from '@/lib/github-db'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const order = await getOrderById(id)

  if (!order || order.userId !== session.id) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  return NextResponse.json({ order })
}
