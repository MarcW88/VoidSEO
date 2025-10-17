/** @type {import('next').NextConfig} */
const nextConfig = {
  // Serve static HTML files
  trailingSlash: true,
  output: 'export',
  distDir: 'out',
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=()'
          }
        ]
      },
      ...(process.env.NODE_ENV === 'production' ? [{
        // HSTS for production only
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload'
          }
        ]
      }] : []),
      {
        // CSP for enhanced security
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://unpkg.com https://cdn.jsdelivr.net",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.serpapi.com",
              "frame-src 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ]
      }
    ]
  },

  // Redirects for clean URLs
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/free.html',
        permanent: false
      }
    ]
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Image optimization
  images: {
    domains: ['your-supabase-project.supabase.co'],
    unoptimized: true // For static export
  },

  // Webpack configuration for better security
  webpack: (config, { dev, isServer }) => {
    // Security: Don't expose source maps in production
    if (!dev && !isServer) {
      config.devtool = false
    }

    return config
  }
}

module.exports = nextConfig
