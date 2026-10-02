import '@/app/globals.css'
import type { Metadata } from 'next'
import localFont from 'next/font/local'

const inter = localFont({
  src: './fonts/inter-latin-variable.woff2',
  weight: '100 900',
  style: 'normal',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Elim Christian Garden International',
    default: 'Home | Elim Christian Garden International',
  },
  description:
    'Elim Christian Garden International - A place for spiritual growth and community',
  icons: {
    icon: '/images/logo-removebg-preview.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.className} data-scroll-behavior="smooth">
      <body className="antialiased">{children}</body>
    </html>
  )
}
