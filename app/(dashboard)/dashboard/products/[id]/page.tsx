import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Edit, Package, Calendar, Tag, Hash, DollarSign } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { getProductById } from '@/lib/github-db'
import { NeoCard, NeoCardHeader, NeoCardTitle, NeoCardContent } from '@/components/ui/neo-card'
import { NeoButton } from '@/components/ui/neo-button'
import { NeoBadge } from '@/components/ui/neo-badge'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const product = await getProductById(id)

  if (!product || product.userId !== session.id) {
    notFound()
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/products">
          <NeoButton variant="outline" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </NeoButton>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-black uppercase tracking-tight">{product.name}</h1>
          <div className="flex items-center gap-2 mt-1">
            <NeoBadge variant="secondary">{product.category}</NeoBadge>
            <NeoBadge variant={product.isActive ? 'success' : 'warning'}>
              {product.isActive ? 'Aktif' : 'Nonaktif'}
            </NeoBadge>
          </div>
        </div>
        <Link href={`/dashboard/products/${product.id}/edit`}>
          <NeoButton variant="accent">
            <Edit className="w-5 h-5" />
            Edit
          </NeoButton>
        </Link>
      </div>

      <NeoCard>
        <NeoCardContent className="flex flex-col gap-6">
          {/* Image */}
          <div className="w-full h-48 bg-primary neo-border-2 flex items-center justify-center">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-16 h-16 text-primary-foreground" />
            )}
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-4 bg-muted neo-border-2">
              <DollarSign className="w-6 h-6 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Harga</p>
                <p className="font-black text-lg">{formatCurrency(product.price)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-muted neo-border-2">
              <Hash className="w-6 h-6 text-secondary" />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-bold">Stok</p>
                <p className={`font-black text-lg ${product.stock > 0 ? 'text-success' : 'text-destructive'}`}>
                  {product.stock}
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-bold uppercase text-sm mb-2">Deskripsi</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{product.description}</p>
          </div>

          {/* Meta */}
          <div className="flex flex-col gap-2 text-sm text-muted-foreground border-t-2 border-border pt-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Dibuat: {formatDate(product.createdAt)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Diperbarui: {formatDate(product.updatedAt)}</span>
            </div>
          </div>
        </NeoCardContent>
      </NeoCard>
    </div>
  )
}
