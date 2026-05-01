import { NextRequest, NextResponse } from 'next/server'
import { getBotSettingsByToken, getAllProducts, getAllOrders } from '@/lib/github-db'

// Telegram API base URL
const TELEGRAM_API = 'https://api.telegram.org/bot'

interface TelegramMessage {
  message_id: number
  from: {
    id: number
    first_name: string
    username?: string
  }
  chat: {
    id: number
    type: string
  }
  text?: string
  date: number
}

interface TelegramUpdate {
  update_id: number
  message?: TelegramMessage
}

// Send message to Telegram
async function sendMessage(botToken: string, chatId: number, text: string, parseMode: string = 'HTML') {
  const response = await fetch(`${TELEGRAM_API}${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: parseMode,
    }),
  })
  return response.json()
}

// Handle bot commands and messages
async function handleMessage(botToken: string, message: TelegramMessage, ownerId: string) {
  const chatId = message.chat.id
  const text = message.text || ''
  const userId = message.from.id.toString()

  // Check if user is owner
  const isOwner = userId === ownerId

  // Handle commands
  if (text.startsWith('/start')) {
    const welcomeText = `
<b>🤖 Selamat Datang di Bot Sewa!</b>

Saya adalah bot untuk membantu Anda melihat dan menyewa berbagai layanan.

<b>📋 Perintah yang tersedia:</b>
/start - Mulai bot
/menu - Lihat daftar produk/layanan
/help - Bantuan penggunaan bot
/info - Informasi tentang bot

${isOwner ? '\n<b>👑 Perintah Owner:</b>\n/stats - Lihat statistik' : ''}

Ketik /menu untuk melihat layanan yang tersedia!
    `.trim()
    
    await sendMessage(botToken, chatId, welcomeText)
    return
  }

  if (text.startsWith('/menu') || text.startsWith('/produk') || text.startsWith('/layanan')) {
    const products = await getAllProducts()
    
    if (!products || products.length === 0) {
      await sendMessage(botToken, chatId, '❌ Belum ada produk/layanan yang tersedia.')
      return
    }

    let menuText = '<b>📦 Daftar Produk/Layanan</b>\n\n'
    
    products.forEach((product, index) => {
      const statusEmoji = product.isAvailable ? '✅' : '❌'
      const priceFormatted = new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(product.price)
      
      menuText += `${index + 1}. <b>${product.name}</b> ${statusEmoji}\n`
      menuText += `   💰 ${priceFormatted}\n`
      if (product.description) {
        menuText += `   📝 ${product.description}\n`
      }
      menuText += '\n'
    })

    menuText += '\n<i>Hubungi owner untuk memesan!</i>'
    
    await sendMessage(botToken, chatId, menuText)
    return
  }

  if (text.startsWith('/help')) {
    const helpText = `
<b>❓ Bantuan Penggunaan Bot</b>

<b>Perintah Utama:</b>
• /start - Memulai bot dan melihat pesan selamat datang
• /menu - Melihat daftar produk/layanan yang tersedia
• /info - Melihat informasi tentang bot

<b>Cara Memesan:</b>
1. Ketik /menu untuk melihat produk
2. Pilih produk yang diinginkan
3. Hubungi owner untuk konfirmasi pembayaran

<b>Kontak:</b>
Jika ada pertanyaan, silakan hubungi owner bot.
    `.trim()
    
    await sendMessage(botToken, chatId, helpText)
    return
  }

  if (text.startsWith('/info')) {
    const infoText = `
<b>ℹ️ Informasi Bot</b>

Bot ini dibuat untuk memudahkan Anda dalam melihat dan menyewa berbagai layanan digital.

<b>Fitur:</b>
• Melihat daftar produk/layanan
• Informasi harga yang transparan
• Pemesanan mudah via Telegram

<b>Versi:</b> 1.0.0
<b>Platform:</b> Telegram Bot API
    `.trim()
    
    await sendMessage(botToken, chatId, infoText)
    return
  }

  // Owner-only commands
  if (isOwner && text.startsWith('/stats')) {
    const products = await getAllProducts()
    const orders = await getAllOrders()
    
    const totalProducts = products?.length || 0
    const activeProducts = products?.filter(p => p.isAvailable).length || 0
    const totalOrders = orders?.length || 0
    const completedOrders = orders?.filter(o => o.status === 'completed').length || 0
    const totalRevenue = orders
      ?.filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.totalPrice, 0) || 0

    const revenueFormatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(totalRevenue)

    const statsText = `
<b>📊 Statistik Bot</b>

<b>Produk:</b>
• Total: ${totalProducts}
• Aktif: ${activeProducts}

<b>Pesanan:</b>
• Total: ${totalOrders}
• Selesai: ${completedOrders}

<b>Pendapatan:</b>
• Total: ${revenueFormatted}
    `.trim()
    
    await sendMessage(botToken, chatId, statsText)
    return
  }

  // Default response for unknown commands
  if (text.startsWith('/')) {
    await sendMessage(botToken, chatId, '❓ Perintah tidak dikenali. Ketik /help untuk bantuan.')
    return
  }

  // For regular messages, show a helpful response
  await sendMessage(botToken, chatId, '👋 Ketik /menu untuk melihat daftar layanan atau /help untuk bantuan.')
}

// POST handler for Telegram webhook
export async function POST(request: NextRequest) {
  try {
    // Get bot token from URL path or header
    const url = new URL(request.url)
    const pathParts = url.pathname.split('/')
    const botToken = request.headers.get('x-telegram-bot-token') || url.searchParams.get('token')

    if (!botToken) {
      console.error('[v0] No bot token provided')
      return NextResponse.json({ error: 'No bot token' }, { status: 400 })
    }

    // Get bot settings to verify token and get owner ID
    const settings = await getBotSettingsByToken(botToken)
    
    if (!settings) {
      console.error('[v0] Invalid bot token or bot not found')
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!settings.isActive) {
      console.error('[v0] Bot is not active')
      return NextResponse.json({ ok: true }) // Return OK to stop Telegram from retrying
    }

    const update: TelegramUpdate = await request.json()
    console.log('[v0] Received update:', JSON.stringify(update, null, 2))

    if (update.message) {
      await handleMessage(botToken, update.message, settings.ownerId)
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[v0] Webhook error:', error)
    return NextResponse.json({ ok: true }) // Return OK to prevent Telegram from retrying
  }
}

// GET handler to verify webhook is working
export async function GET() {
  return NextResponse.json({ 
    status: 'Telegram webhook endpoint is active',
    usage: 'Set your Telegram webhook URL to this endpoint with ?token=YOUR_BOT_TOKEN'
  })
}
