import type { Metadata, Viewport } from "next"

import "./globals.css"

export const metadata: Metadata = {
  title: "Intro Meeting · ELVTR",
  description: "Build a cohort's ELVTR Introduction Meeting deck in Gamma.",
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  // Mauve, so the mobile browser chrome matches the page ground.
  themeColor: "#c2b2b3",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  )
}
