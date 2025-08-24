# Deployment Guide

This guide covers deploying your Next.js application to various platforms.

## Pre-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Tests pass (`pnpm test`)
- [ ] TypeScript has no errors (`pnpm typecheck`)
- [ ] ESLint has no errors (`pnpm lint`)

## Vercel (Recommended)

Vercel is the easiest deployment option as it's built by the creators of Next.js.

### Deploy with Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project:
     - Framework Preset: Next.js
     - Root Directory: `./` (or leave empty)
     - Build Command: `pnpm build` or `npm run build`
     - Output Directory: Leave default

3. **Add Environment Variables**
   In Vercel dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app is live at `your-project.vercel.app`

### Custom Domain

1. Go to Settings → Domains
2. Add your domain
3. Configure DNS as instructed
4. Update `NEXT_PUBLIC_SITE_URL` environment variable

### Automatic Deployments

- **Production**: Pushes to `main` branch auto-deploy to production
- **Preview**: Pull requests create preview deployments
- **Branch Deployments**: Other branches can be configured for staging

## Netlify

### Deploy with Netlify

1. **Build Settings**
   ```toml
   # netlify.toml
   [build]
     command = "pnpm build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"

   [build.environment]
     NEXT_TELEMETRY_DISABLED = "1"
   ```

2. **Deploy**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli

   # Login
   netlify login

   # Deploy
   netlify deploy --prod
   ```

3. **Environment Variables**
   - Go to Site Settings → Environment Variables
   - Add your Supabase keys

## Railway

### Deploy with Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

3. **Add Environment Variables**
   ```bash
   railway variables set NEXT_PUBLIC_SUPABASE_URL=your-url
   railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key
   ```

## Docker

### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM node:18-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Build and Run

```bash
# Build
docker build -t nextjs-app .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  nextjs-app
```

## AWS Amplify

### Deploy with Amplify

1. **amplify.yml**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install -g pnpm
           - pnpm install
       build:
         commands:
           - pnpm build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
     cache:
       paths:
         - node_modules/**/*
   ```

2. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect your GitHub repository
   - Add environment variables
   - Deploy

## Self-Hosting

### Node.js Server

1. **Build for Production**
   ```bash
   pnpm build
   ```

2. **Start Server**
   ```bash
   # Production mode
   NODE_ENV=production pnpm start

   # With PM2
   pm2 start npm --name "nextjs-app" -- start
   ```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Environment Variables

### Required Variables

```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### Optional Variables

```bash
# Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_POSTHOG_KEY=your-key

# Features
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_PWA=true

# API
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

## Database Migrations

### Before Deployment

```bash
# Generate migrations
pnpm db:generate

# Apply migrations
pnpm db:migrate

# Or push directly (development)
pnpm db:push
```

### Production Migrations

1. **Backup Database**
   ```bash
   pg_dump your_database > backup.sql
   ```

2. **Run Migrations**
   ```bash
   DATABASE_URL=your-production-url pnpm db:migrate
   ```

## Performance Optimization

### Build Optimization

```javascript
// next.config.ts
const config = {
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/avif', 'image/webp'],
  },
  
  experimental: {
    optimizeCss: true,
  },
};
```

### CDN Configuration

1. **Static Assets**
   - Upload to CDN
   - Update asset URLs

2. **Image Optimization**
   ```tsx
   <Image
     src="https://cdn.your-domain.com/image.jpg"
     alt="Description"
     width={800}
     height={600}
     loading="lazy"
   />
   ```

## Monitoring

### Error Tracking (Sentry)

```bash
# Install
pnpm add @sentry/nextjs

# Configure
npx @sentry/wizard@latest -i nextjs
```

### Analytics

```tsx
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Security

### Headers

```javascript
// next.config.ts
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];

const config = {
  headers: async () => [
    {
      source: '/:path*',
      headers: securityHeaders,
    },
  ],
};
```

### Environment Security

- Never commit `.env.local` or `.env.production`
- Use secret management services
- Rotate keys regularly
- Use different keys for development/production

## Troubleshooting

### Build Errors

```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm build
```

### Runtime Errors

1. Check environment variables
2. Verify database connection
3. Check browser console
4. Review server logs

### Performance Issues

1. Enable caching
2. Optimize images
3. Use CDN
4. Enable compression
5. Minimize JavaScript

## Deployment Checklist

### Pre-Launch

- [ ] SSL certificate configured
- [ ] Domain verified
- [ ] Environment variables set
- [ ] Database migrations complete
- [ ] Error tracking enabled
- [ ] Analytics configured
- [ ] Backup system in place

### Post-Launch

- [ ] Test all auth flows
- [ ] Verify email sending
- [ ] Check mobile responsiveness
- [ ] Monitor error logs
- [ ] Set up alerts
- [ ] Document deployment process

## Rollback Strategy

### Vercel

```bash
# Revert to previous deployment
vercel rollback
```

### Git-Based

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### Database

```bash
# Restore from backup
psql your_database < backup.sql
```

## Support

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Next.js**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
