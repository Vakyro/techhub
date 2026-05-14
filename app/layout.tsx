import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SessionProvider } from '@/components/SessionProvider'
import { PwaRegister } from '@/components/pwa-register'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: '#64ae63',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  title: 'techHub — Electrónica para Makers de Tijuana',
  description: 'Compra hardware, kits, refacciones y accesorios tech con recomendaciones IA, mayoreo y entrega local en Tijuana.',
  applicationName: 'techHub',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'techHub',
  },
  icons: {
    icon: [
      { url: '/favicon.ico',       sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon.png',          type: 'image/png' },
    ],
    apple:    '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  other: {
    'mobile-web-app-capable':          'yes',
    'apple-mobile-web-app-capable':    'yes',
    'apple-mobile-web-app-title':      'techHub',
    'msapplication-TileColor':         '#64ae63',
    'msapplication-TileImage':         '/icon-192x192.png',
    'msapplication-tap-highlight':     'no',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="mask-icon" href="/logo.svg" color="#64ae63" />
      </head>
      <body className="font-sans antialiased bg-background">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('techhub_theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`,
          }}
        />
        <SessionProvider>
          {children}
          <Toaster />
        </SessionProvider>
        <PwaRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
