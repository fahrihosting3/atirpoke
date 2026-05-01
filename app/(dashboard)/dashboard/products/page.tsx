import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Package, Search } from 'lucide-react'
import { getSession } from '@/lib/auth'
import { getProducts } from '@/lib/github-db'
import { NeoButton } from '@/components/ui/neo-button'
import { NeoCard, NeoCardContent } from '@/components/ui/neo-card'
import { ProductCard } from '@/components/products/ProductCard'

export default async function ProductsPage() {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const products = await getProducts(session.id)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight">Produk</h1>
          <p className="text-muted-foreground">Kelola produk yang dijual melalui bot</p>
        </div>
        
        <Link href="/dashboard/products/new">
          <NeoButton>
            <Plus className="w-5 h-5" />
            Tambah Produk
          </NeoButton>
        </Link>
      </div>

      {products.length === 0 ? (
        <NeoCard className="bg-muted">
          <NeoCardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-20 h-20 bg-primary neo-border flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-primary-foreground" />
            </div>
            <h3 className="font-black text-lg uppercase mb-2">Belum Ada Produk</h3>
            <p className="text-muted-foreground mb-4">
              Mulai tambahkan produk untuk dijual melalui bot Anda
            </p>
            <Link href="/dashboard/products/new">
              <NeoButton>
                <Plus className="w-5 h-5" />
                Tambah Produk Pertama
              </NeoButton>
            </Link>
          </NeoCardContent>
        </NeoCard>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Menampilkan <span className="font-bold">{products.length}</span> produk
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
