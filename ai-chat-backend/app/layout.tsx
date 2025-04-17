import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Chat',
  description: 'AI Chat Application',
  generator: '@far0kh',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
