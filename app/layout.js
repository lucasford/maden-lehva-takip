import './globals.css'

export const metadata = {
  title: 'Maden Sahası Levha Takip Sistemi',
  description: 'Açık ocak madeninde trafik ve iş güvenliği levhalarının konum bazlı envanter takip sistemi',
  keywords: 'maden, levha, takip, güvenlik, trafik, envanter',
  author: 'Maden Sahası Takip Sistemi',
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  )
}
