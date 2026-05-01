'use client'

import { useState, useEffect } from 'react'
import { Bot, Key, User, Power, Save, Eye, EyeOff, AlertCircle, CheckCircle, Webhook, Trash2, RefreshCw } from 'lucide-react'
import { NeoCard, NeoCardHeader, NeoCardTitle, NeoCardDescription, NeoCardContent, NeoCardFooter } from '@/components/ui/neo-card'
import { NeoButton } from '@/components/ui/neo-button'
import { NeoInput } from '@/components/ui/neo-input'
import { NeoBadge } from '@/components/ui/neo-badge'
import { saveBotSettingsAction, toggleBotStatusAction } from '@/actions/settings.actions'
import type { BotSettings } from '@/types'

export default function SettingsPage() {
  const [settings, setSettings] = useState<BotSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [showToken, setShowToken] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [webhookInfo, setWebhookInfo] = useState<{ url: string; pending_update_count: number } | null>(null)
  const [settingWebhook, setSettingWebhook] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchWebhookInfo()
  }, [])

  async function fetchSettings() {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  async function fetchWebhookInfo() {
    try {
      const res = await fetch('/api/telegram/set-webhook')
      if (res.ok) {
        const data = await res.json()
        setWebhookInfo(data.webhookInfo)
      }
    } catch (error) {
      console.error('Error fetching webhook info:', error)
    }
  }

  async function handleSetWebhook() {
    setSettingWebhook(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/telegram/set-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        fetchWebhookInfo()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal memasang webhook' })
    } finally {
      setSettingWebhook(false)
    }
  }

  async function handleDeleteWebhook() {
    setSettingWebhook(true)
    setMessage(null)
    
    try {
      const res = await fetch('/api/telegram/set-webhook', {
        method: 'DELETE',
      })
      const data = await res.json()
      
      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        setWebhookInfo(null)
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Gagal menghapus webhook' })
    } finally {
      setSettingWebhook(false)
    }
  }

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setMessage(null)
    
    const result = await saveBotSettingsAction(formData)
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Pengaturan berhasil disimpan!' })
      fetchSettings()
    }
    
    setSaving(false)
  }

  async function handleToggle() {
    setToggling(true)
    setMessage(null)
    
    const result = await toggleBotStatusAction()
    
    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: `Bot ${result.isActive ? 'diaktifkan' : 'dinonaktifkan'}!` })
      fetchSettings()
    }
    
    setToggling(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-12 h-12 bg-primary neo-border animate-pulse" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight">Pengaturan Bot</h1>
        <p className="text-muted-foreground">Konfigurasi token dan Owner ID untuk menjalankan bot Anda</p>
      </div>

      {message && (
        <div
          className={`p-4 neo-border-2 flex items-center gap-3 ${
            message.type === 'success' ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* Bot Status Card */}
      <NeoCard className={settings?.isActive ? 'bg-accent' : 'bg-warning'}>
        <NeoCardContent className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white neo-border-2 flex items-center justify-center">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <p className="font-black text-lg uppercase">Status Bot</p>
              <div className="flex items-center gap-2 mt-1">
                <NeoBadge variant={settings?.isActive ? 'success' : 'destructive'}>
                  {settings?.isActive ? 'Aktif' : 'Nonaktif'}
                </NeoBadge>
                {settings?.botName && (
                  <span className="text-sm font-medium">@{settings.botName}</span>
                )}
              </div>
            </div>
          </div>
          
          <NeoButton
            variant={settings?.isActive ? 'destructive' : 'success'}
            onClick={handleToggle}
            disabled={toggling || !settings}
          >
            <Power className="w-5 h-5" />
            {toggling ? 'Memproses...' : settings?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
          </NeoButton>
        </NeoCardContent>
      </NeoCard>

      {/* Webhook Status Card */}
      <NeoCard className={webhookInfo?.url ? 'bg-success' : 'bg-muted'}>
        <NeoCardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white neo-border-2 flex items-center justify-center">
                <Webhook className="w-8 h-8" />
              </div>
              <div>
                <p className="font-black text-lg uppercase">Webhook Telegram</p>
                <div className="flex items-center gap-2 mt-1">
                  <NeoBadge variant={webhookInfo?.url ? 'success' : 'destructive'}>
                    {webhookInfo?.url ? 'Terpasang' : 'Belum Dipasang'}
                  </NeoBadge>
                  {webhookInfo?.pending_update_count !== undefined && webhookInfo.pending_update_count > 0 && (
                    <span className="text-sm font-medium">({webhookInfo.pending_update_count} pending)</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <NeoButton
                variant="default"
                onClick={handleSetWebhook}
                disabled={settingWebhook || !settings?.botToken}
              >
                {webhookInfo?.url ? <RefreshCw className="w-5 h-5" /> : <Webhook className="w-5 h-5" />}
                {settingWebhook ? 'Memproses...' : webhookInfo?.url ? 'Perbarui' : 'Pasang Webhook'}
              </NeoButton>
              {webhookInfo?.url && (
                <NeoButton
                  variant="destructive"
                  onClick={handleDeleteWebhook}
                  disabled={settingWebhook}
                >
                  <Trash2 className="w-5 h-5" />
                </NeoButton>
              )}
            </div>
          </div>
          
          {webhookInfo?.url && (
            <div className="bg-white/50 p-3 neo-border-2 text-sm font-mono break-all">
              {webhookInfo.url}
            </div>
          )}
          
          {!settings?.botToken && (
            <p className="text-sm text-muted-foreground">
              Simpan pengaturan bot terlebih dahulu sebelum memasang webhook.
            </p>
          )}
        </NeoCardContent>
      </NeoCard>

      {/* Bot Configuration */}
      <NeoCard>
        <NeoCardHeader>
          <NeoCardTitle>Konfigurasi Bot</NeoCardTitle>
          <NeoCardDescription>
            Masukkan token bot dari BotFather dan ID Telegram Anda
          </NeoCardDescription>
        </NeoCardHeader>
        
        <form action={handleSubmit}>
          <NeoCardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="botToken" className="text-sm font-bold uppercase tracking-wide">
                Bot Token
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <NeoInput
                    id="botToken"
                    name="botToken"
                    type={showToken ? 'text' : 'password'}
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    className="pl-11 pr-12 font-mono text-sm"
                    defaultValue={settings?.botToken || ''}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Dapatkan token dari @BotFather di Telegram
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="ownerId" className="text-sm font-bold uppercase tracking-wide">
                Owner ID
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <NeoInput
                  id="ownerId"
                  name="ownerId"
                  type="text"
                  placeholder="123456789"
                  className="pl-11 font-mono"
                  defaultValue={settings?.ownerId || ''}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                ID Telegram Anda. Dapatkan dari @userinfobot
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="botName" className="text-sm font-bold uppercase tracking-wide">
                Nama Bot (Opsional)
              </label>
              <div className="relative">
                <Bot className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <NeoInput
                  id="botName"
                  name="botName"
                  type="text"
                  placeholder="mybot"
                  className="pl-11"
                  defaultValue={settings?.botName || ''}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Username bot tanpa @ (untuk referensi)
              </p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-muted neo-border-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                defaultChecked={settings?.isActive || false}
                className="w-5 h-5 neo-border-2 bg-input cursor-pointer"
              />
              <label htmlFor="isActive" className="font-medium cursor-pointer">
                Aktifkan bot setelah menyimpan
              </label>
            </div>
          </NeoCardContent>

          <NeoCardFooter>
            <NeoButton type="submit" disabled={saving}>
              <Save className="w-5 h-5" />
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </NeoButton>
          </NeoCardFooter>
        </form>
      </NeoCard>

      {/* Help Card */}
      <NeoCard className="bg-primary text-primary-foreground">
        <NeoCardHeader>
          <NeoCardTitle>Cara Mendapatkan Token Bot</NeoCardTitle>
        </NeoCardHeader>
        <NeoCardContent>
          <ol className="list-decimal list-inside flex flex-col gap-2 text-sm">
            <li>Buka Telegram dan cari @BotFather</li>
            <li>Kirim perintah /newbot untuk membuat bot baru</li>
            <li>Ikuti instruksi dan beri nama bot Anda</li>
            <li>Salin token yang diberikan ke field di atas</li>
            <li>Untuk Owner ID, cari @userinfobot dan kirim pesan apapun</li>
          </ol>
        </NeoCardContent>
      </NeoCard>
    </div>
  )
}
