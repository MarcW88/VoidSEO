import type { Metadata } from 'next'
import { Inter, Space_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const spaceMono = Space_Mono({ 
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono'
})

export const metadata: Metadata = {
  title: 'PAA Explorer - VoidSEO',
  description: 'Scrape and cluster People Also Ask questions to identify content gaps and seasonal trends. Built with the VOID Loop methodology.',
  keywords: ['PAA', 'People Also Ask', 'SEO', 'Content Strategy', 'Keyword Research', 'VOID Loop'],
  authors: [{ name: 'VoidSEO' }],
  creator: 'VoidSEO',
  publisher: 'VoidSEO',
  robots: {
    index: false, // Protected app
    follow: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://voidseo.dev/apps/paa-explorer',
    title: 'PAA Explorer - VoidSEO',
    description: 'Scrape and cluster People Also Ask questions to identify content gaps and seasonal trends.',
    siteName: 'VoidSEO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PAA Explorer - VoidSEO',
    description: 'Scrape and cluster People Also Ask questions to identify content gaps and seasonal trends.',
    creator: '@voidseo',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.variable} ${spaceMono.variable} font-sans antialiased`}>
        <div className="relative flex min-h-screen flex-col">
          {/* Header */}
          <header className="sticky top-0 z-50 w-full border-b border-slate-700 bg-slate-900/95 backdrop-blur supports-[backdrop-filter]:bg-slate-900/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <a className="mr-6 flex items-center space-x-2" href="/">
                  <span className="font-bold text-emerald-400">VoidSEO</span>
                </a>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                  <a
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                    href="/framework"
                  >
                    Framework
                  </a>
                  <a
                    className="transition-colors hover:text-foreground/80 text-emerald-400"
                    href="/apps"
                  >
                    Apps
                  </a>
                  <a
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                    href="/docs"
                  >
                    Docs
                  </a>
                </nav>
              </div>
              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <div className="w-full flex-1 md:w-auto md:flex-none">
                  {/* Search or other controls can go here */}
                </div>
                <nav className="flex items-center space-x-2">
                  <a
                    href="/login"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                  >
                    Login
                  </a>
                  <a
                    href="/signup"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-emerald-600 text-white hover:bg-emerald-700 h-9 px-4 py-2"
                  >
                    Sign Up
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-700 bg-slate-900">
            <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
              <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                  Built with the{' '}
                  <a
                    href="/framework"
                    className="font-medium underline underline-offset-4 text-emerald-400"
                  >
                    VOID Loop
                  </a>{' '}
                  methodology. Open source on{' '}
                  <a
                    href="https://github.com/voidseo"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-4 text-emerald-400"
                  >
                    GitHub
                  </a>
                  .
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href="/about"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  About
                </a>
                <a
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Privacy
                </a>
                <a
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Terms
                </a>
              </div>
            </div>
          </footer>
        </div>

        {/* Toast Notifications */}
        <Toaster 
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              border: '1px solid #334155',
              color: '#f1f5f9',
            },
          }}
        />

        {/* Accessibility Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-emerald-600 text-white px-4 py-2 rounded-md z-50"
        >
          Skip to main content
        </a>
      </body>
    </html>
  )
}
