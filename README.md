# Next.js Responsive Template

A production-ready Next.js template with mobile-first design, authentication, and modern tooling. Start building your next project with a solid foundation.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=flat-square&logo=supabase)

## ✨ Features

### 🎯 Core Features
- **Authentication System**: Complete auth flow with login, signup, password reset
- **Mobile-First Design**: Optimized for all devices with touch gestures and safe areas
- **Dark/Light Mode**: Theme switching with system preference detection
- **TypeScript**: Full type safety with strict mode enabled
- **Modern UI Components**: Radix UI + shadcn/ui for accessible, customizable components
- **Dashboard Template**: 4-tab dashboard with responsive sidebar navigation

### 🚀 Performance
- **Optimized Bundle**: Code splitting and lazy loading
- **React Query**: Efficient data fetching with caching
- **Memoization**: Strategic use of React.memo, useCallback, and useMemo
- **Mobile Viewport Fix**: Handles browser bottom navigation bars

### 🛠 Developer Experience
- **Hot Module Replacement**: Fast refresh in development
- **ESLint & Prettier**: Code quality and formatting
- **Vitest**: Unit and integration testing setup
- **Git Hooks**: Pre-commit checks with Husky

## 📦 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **Authentication**: [Supabase Auth](https://supabase.com/auth)
- **Database**: [Supabase](https://supabase.com/) + [Drizzle ORM](https://orm.drizzle.team/)
- **State Management**: [React Query](https://tanstack.com/query)
- **Testing**: [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/)
- **Package Manager**: [pnpm](https://pnpm.io/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm 8+ (or npm/yarn)
- Supabase account (free tier works)

### 1. Clone the Template

```bash
# Clone the repository
git clone https://github.com/johankaito/nextjs-responsive-template.git my-app

# Navigate to the project
cd my-app

# Remove git history and start fresh
rm -rf .git
git init
```

### 2. Install Dependencies

```bash
# Using pnpm (recommended)
pnpm install

# Or using npm
npm install

# Or using yarn
yarn install
```

### 3. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API in your Supabase dashboard
3. Copy your project URL and anon key

### 4. Configure Environment Variables

```bash
# Copy the example env file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 5. Set Up Database (Optional)

If you want to use the example schema:

```bash
# Push the schema to your database
pnpm db:push

# Or generate migrations
pnpm db:generate
pnpm db:migrate
```

### 6. Run the Development Server

```bash
# Start the dev server
pnpm dev

# Open http://localhost:3000
```

## 📁 Project Structure

```
src/
├── app/                  # Next.js app router pages
│   ├── (auth)/          # Authentication pages
│   ├── dashboard/       # Protected dashboard
│   └── layout.tsx       # Root layout with providers
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   └── *.tsx           # Custom components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
│   ├── theme-config.ts # Central theme configuration
│   └── utils.ts        # Helper functions
├── types/              # TypeScript types
└── styles/             # CSS and style files
```

## 🎨 Customization

### Theme Configuration

Edit `src/lib/theme-config.ts` to customize:
- Brand colors
- Typography
- Spacing
- Border radius
- Shadows
- Animations

```typescript
export const themeConfig = {
  brand: {
    name: "Your App Name",
    tagline: "Your tagline here",
  },
  colors: {
    primary: {
      light: "210 100% 50%", // HSL format
      dark: "210 100% 60%",
    },
    // ... more colors
  },
  // ... more configuration
};
```

### Adding New Pages

1. Create a new folder in `src/app/`
2. Add a `page.tsx` file
3. Export a default React component

```typescript
// src/app/about/page.tsx
export default function AboutPage() {
  return <div>About Us</div>;
}
```

### Adding Components

Use the shadcn/ui CLI to add components:

```bash
# Add a new component
pnpm dlx shadcn@latest add button

# Add multiple components
pnpm dlx shadcn@latest add card badge alert
```

## 📝 Available Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server

# Database
pnpm db:generate  # Generate migrations
pnpm db:migrate   # Run migrations
pnpm db:push      # Push schema changes
pnpm db:studio    # Open Drizzle Studio

# Testing
pnpm test         # Run tests
pnpm test:watch   # Run tests in watch mode
pnpm test:coverage # Generate coverage report

# Code Quality
pnpm lint         # Run ESLint
pnpm format       # Format with Prettier
pnpm typecheck    # TypeScript type checking
```

## 🔐 Authentication Flow

The template includes a complete authentication system:

1. **Sign Up**: Users can create accounts with email/password
2. **Email Verification**: Supabase sends confirmation emails
3. **Sign In**: Email/password authentication
4. **Password Reset**: Forgot password flow with email
5. **Protected Routes**: Middleware protects dashboard routes
6. **Session Management**: Automatic token refresh

## 📱 Mobile Optimizations

- **Viewport Fix**: Handles mobile browser bottom navigation bars
- **Touch Gestures**: Swipe support for mobile interactions
- **Safe Areas**: Respects device safe areas (notches, home indicators)
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Performance**: Optimized for mobile devices

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

Example test:

```typescript
import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

describe('HomePage', () => {
  it('renders the heading', () => {
    render(<HomePage />);
    expect(screen.getByText('Next.js Responsive Template')).toBeInTheDocument();
  });
});
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy!

### Other Platforms

The template works with any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted (Node.js server)

## 📚 Documentation

- [SETUP.md](./docs/SETUP.md) - Detailed setup instructions
- [CUSTOMIZATION.md](./docs/CUSTOMIZATION.md) - Customization guide
- [DEPLOYMENT.md](./docs/DEPLOYMENT.md) - Deployment guide
- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Architecture decisions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this template for any project.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Supabase](https://supabase.com/) - Open source Firebase alternative
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives

---

Built with ❤️ by [Johan Kaito](https://github.com/johankaito)
