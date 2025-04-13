import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Providers } from "@/store/providers"
import { Toaster } from "react-hot-toast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "YabaTech Campus Navigator",
  description: "Navigate Yaba College of Technology campus with ease",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://api.mapbox.com/mapbox-gl-js/v2.9.1/mapbox-gl.css" />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          <Toaster 
            position="bottom-center"
            gutter={8}
            containerClassName="!bottom-6 sm:!bottom-4"
            toastOptions={{
              duration: 3000,
              id: 'global-toaster',
              success: {
                id: 'success-toast',
              },
              error: {
                id: 'error-toast',
              },
              loading: {
                id: 'loading-toast',
              },
              style: {
                borderRadius: '8px',
                background: '#fff',
                color: '#333',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.12)',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}

