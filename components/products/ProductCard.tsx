'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Package, Edit, Trash2, Power, Eye } from 'lucide-react'
import { NeoCard } from '@/components/ui/neo-card'
import { NeoButton } from '@/components/ui/neo-button'
import { NeoBadge } from '@/components/ui/neo-badge'
import { deleteProductAction, toggleProductStatusAction } from '@/actions/product.actions'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onUpdate?: () => void
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function ProductCard({ product, onUpdate }: ProductCardProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleToggle() {
    setLoading(true)
    await toggleProductStatusAction(product.id)
    onUpdate?.()
    setLoading(false)
  }

  async function handleDelete() {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) return
    
    setDeleting(true)
    await deleteProductAction(product.id)
    onUpdate?.()
    setDeleting(false)
  }

  return (
    <NeoCard className={product.isActive ? 'bg-card' : 'bg-muted opacity-75'}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-primary neo-border-2 flex items-center justify-center shrink-0">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-8 h-8 text-primary-foreground" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-black text-lg truncate">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <NeoBadge variant="secondary">{product.category}</NeoBadge>
                <NeoBadge variant={product.isActive ? 'success' : 'warning'}>
                  {product.isActive ? 'Aktif' : 'Nonaktif'}
                </NeoBadge>
              </div>
            </div>
            <p className="font-black text-lg text-primary whitespace-nowrap">
              {formatCurrency(product.price)}
            </p>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm">
              <span className="font-bold">Stok:</span>{' '}
              <span className={product.stock > 0 ? 'text-success' : 'text-destructive'}>
                {product.stock}
              </span>
            </p>
            
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/products/${product.id}`}>
                <NeoButton variant="outline" size="icon-sm">
                  <Eye className="w-4 h-4" />
                </NeoButton>
              </Link>
              <Link href={`/dashboard/products/${product.id}/edit`}>
                <NeoButton variant="accent" size="icon-sm">
                  <Edit className="w-4 h-4" />
                </NeoButton>
              </Link>
              <NeoButton
                variant={product.isActive ? 'warning' : 'success'}
                size="icon-sm"
                onClick={handleToggle}
                disabled={loading}
              >
                <Power className="w-4 h-4" />
              </NeoButton>
              <NeoButton
                variant="destructive"
                size="icon-sm"
                onClick={handleDelete}
                disabled={deleting}
              >
                <Trash2 className="w-4 h-4" />
              </NeoButton>
            </div>
          </div>
        </div>
      </div>
    </NeoCard>
  )
}
