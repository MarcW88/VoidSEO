# PAA Explorer - Next.js Frontend

> Scrape and cluster People Also Ask questions to identify content gaps and seasonal trends. Built with the VOID Loop methodology.

## 🚀 Features

- **Demo Mode**: Explore sample data without signup
- **Builder Mode**: Live PAA scraping with OpenAI clustering
- **Real-time Progress**: WebSocket updates for job status
- **Export Capabilities**: CSV, JSON, and Google Sheets exports
- **Accessibility**: WCAG 2.1 AA compliant
- **Responsive Design**: Mobile-first approach

## 🛠 Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks + SWR for data fetching
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL with vector extensions
- **API**: FastAPI backend with async processing
- **Deployment**: Vercel (frontend) + Railway (API)

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn
- Access to PAA Explorer API

### Local Development

1. **Clone and install dependencies**:
```bash
cd apps/paa-explorer
npm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. **Start development server**:
```bash
npm run dev
```

The app will be available at `http://localhost:3001`.

### Production Build

```bash
npm run build
npm start
```

## 🏗 Architecture

```
apps/paa-explorer/
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main PAA Explorer interface
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   └── utils.ts           # Utility functions
├── public/                # Static assets
└── types/                 # TypeScript definitions
```

## 🎯 Usage

### Demo Mode

1. Visit the app
2. Click "Demo Mode"
3. Explore sample PAA data from "SEO Tools" analysis
4. View clusters, questions, and metrics

### Builder Mode

1. Sign up for an account
2. Switch to "Builder Mode"
3. Enter seed keywords (comma-separated)
4. Select locale and clustering algorithm
5. Start analysis and monitor progress
6. Export results when complete

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | PAA Explorer API endpoint | `http://localhost:8000` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | - |

### API Integration

The frontend communicates with the FastAPI backend through:

- **Job Creation**: `POST /api/jobs`
- **Status Polling**: `GET /api/jobs/{id}`
- **Results Fetching**: `GET /api/jobs/{id}/results`
- **Demo Data**: `GET /api/demo/data`
- **Exports**: `POST /api/exports`

## 🎨 Customization

### Styling

The app uses Tailwind CSS with a custom design system:

```css
/* VoidSEO brand colors */
--void-black: #0a0a0a;
--void-accent: #00ff99;
--void-blue: #0099ff;
```

### Components

All UI components are built with shadcn/ui and can be customized:

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
```

## ♿ Accessibility

The app follows WCAG 2.1 AA guidelines:

- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Visible focus indicators
- **Reduced Motion**: Respects user preferences

## 📊 Performance

- **Lighthouse Score**: 90+ across all metrics
- **Core Web Vitals**: Optimized for LCP, FID, CLS
- **Bundle Size**: Tree-shaking and code splitting
- **Caching**: SWR for efficient data fetching

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect repository**:
```bash
vercel --prod
```

2. **Set environment variables** in Vercel dashboard

3. **Configure build settings**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm ci"
}
```

### Docker

```bash
docker build -t paa-explorer-frontend .
docker run -p 3001:3001 paa-explorer-frontend
```

### Manual Deployment

```bash
npm run build
npm run start
```

## 🔍 Monitoring

### Error Tracking

Integration with Sentry for error monitoring:

```javascript
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
})
```

### Analytics

Google Analytics 4 integration:

```javascript
gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: 'PAA Explorer',
  page_location: window.location.href,
})
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Accessibility tests
npm run test:a11y
```

## 📈 Roadmap

- [ ] **Real-time Collaboration**: Share analyses with team members
- [ ] **Advanced Visualizations**: Interactive cluster maps
- [ ] **Scheduled Analyses**: Recurring PAA monitoring
- [ ] **API Integrations**: Connect to Google Sheets, Airtable
- [ ] **Mobile App**: React Native companion app

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

Built with the VOID Loop methodology. See main project license.

## 🆘 Support

- **Documentation**: [voidseo.dev/docs](https://voidseo.dev/docs)
- **Community**: [Discord](https://discord.gg/voidseo)
- **Issues**: [GitHub Issues](https://github.com/voidseo/paa-explorer/issues)
- **Email**: support@voidseo.dev

---

**Built with ❤️ using the VOID Loop framework**
