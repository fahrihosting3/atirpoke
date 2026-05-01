'use client'

import { useState } from 'react'
import { Package, DollarSign, Hash, Tag, Image, FileText, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { NeoCard, NeoCardHeader, NeoCardTitle, NeoCardDescription, NeoCardContent, NeoCardFooter } from '@/components/ui/neo-card'
import { NeoButton } from '@/components/ui/neo-button'
import { NeoInput } from '@/components/ui/neo-input'
import { NeoTextarea } from '@/components/ui/neo-textarea'
import { NeoSelect } from '@/components/ui/neo-select'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import type { Product } from '@/types'

interface ProductFormProps {
  product?: Product
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>
  submitLabel?: string
}

export function ProductForm({ product, onSubmit, submitLabel = 'Simpan Produk' }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    
    const result = await onSubmit(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <NeoCard>
      <NeoCardHeader>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/products">
            <NeoButton variant="outline" size="icon-sm">
              <ArrowLeft className="w-5 h-5" />
            </NeoButton>
          </Link>
          <div>
            <NeoCardTitle>{product ? 'Edit Produk' : 'Tambah Produk Baru'}</NeoCardTitle>
            <NeoCardDescription>
              {product ? 'Perbarui informasi produk' : 'Isi informasi produk yang akan dijual'}
            </NeoCardDescription>
          </div>
        </div>
      </NeoCardHeader>

      <form action={handleSubmit}>
        <NeoCardContent className="flex flex-col gap-4">
          {error && (
            <div className="bg-destructive text-destructive-foreground p-3 neo-border-2 text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="name" className="text-sm font-bold uppercase tracking-wide">
                Nama Produk
              </label>
              <div className="relative">
                <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <NeoInput
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Bot Auto Order"
                  className="pl-11"
                  defaultValue={product?.name || ''}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="category" className="text-sm font-bold uppercase tracking-wide">
                Kategori
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <NeoSelect
                  id="category"
                  name="category"
                  className="pl-11"
                  defaultValue={product?.category || ''}
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {PRODUCT_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </NeoSelect>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="description" className="text-sm font-bold uppercase tracking-wide">
              Deskripsi
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-4 w-5 h-5 text-muted-foreground" />
              <NeoTextarea
                id="description"
                name="description"
                placeholder="Deskripsi lengkap produk..."
                className="pl-11"
                defaultValue={product?.description || ''}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="price" className="text-sm font-bold uppercase tracking-wide">
                Harga (Rp)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <NeoInput
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="50000"
                  className="pl-11"
                  defaultValue={product?.price || ''}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="stock" className="text-sm font-bold uppercase tracking-wide">
                Stok
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <NeoInput
                  id="stock"
                  name="stock"
                  type="number"
                  min="0"
                  placeholder="100"
                  className="pl-11"
                  defaultValue={product?.stock || ''}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="imageUrl" className="text-sm font-bold uppercase tracking-wide">
              URL Gambar (Opsional)
            </label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <NeoInput
                id="imageUrl"
                name="imageUrl"
                type="url"
                placeholder="https://example.com/image.jpg"
                className="pl-11"
                defaultValue={product?.imageUrl || ''}
              />
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted neo-border-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              defaultChecked={product?.isActive ?? true}
              className="w-5 h-5 neo-border-2 bg-input cursor-pointer"
            />
            <label htmlFor="isActive" className="font-medium cursor-pointer">
              Aktifkan produk (tampil di katalog)
            </label>
          </div>
        </NeoCardContent>

        <NeoCardFooter className="gap-3">
          <NeoButton type="submit" disabled={loading}>
            <Save className="w-5 h-5" />
            {loading ? 'Menyimpan...' : submitLabel}
          </NeoButton>
          <Link href="/dashboard/products">
            <NeoButton type="button" variant="outline">
              Batal
            </NeoButton>
          </Link>
        </NeoCardFooter>
      </form>
    </NeoCard>
  )
}
