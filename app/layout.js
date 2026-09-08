export const metadata = {
  title: 'Crochet Store',
  description: 'Handmade crochet products boutique',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
