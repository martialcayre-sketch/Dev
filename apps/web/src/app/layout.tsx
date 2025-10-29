import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Neuronutrition App',
  description: 'MVP for neuronutrition-app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <main className="container mx-auto p-6">{children}</main>
      </body>
    </html>
  )
}

