import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Neo-Bed - Neumorphic Job Board",
  description: "A beautiful neumorphic design experiment for job listings",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
