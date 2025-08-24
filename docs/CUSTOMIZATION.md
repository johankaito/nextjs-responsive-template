# Customization Guide

This guide covers how to customize the Next.js Responsive Template to match your brand and requirements.

## Theme Configuration

The central theme configuration is located in `src/lib/theme-config.ts`. This file controls all visual aspects of your application.

### Brand Identity

```typescript
// src/lib/theme-config.ts
export const themeConfig = {
  brand: {
    name: "Your App Name",
    tagline: "Your tagline here",
    logo: "/logo.png", // Place your logo in the public folder
  },
  // ...
};
```

### Color System

Colors use HSL format for better control over variations:

```typescript
colors: {
  primary: {
    light: "210 100% 50%", // hue saturation lightness
    dark: "210 100% 60%",
    foreground: "0 0% 100%",
  },
  // Add custom colors
  custom: {
    brand: "15 90% 55%",
    accent: "270 60% 65%",
  },
}
```

#### Using Colors in Components

```tsx
// In your components
<div className="bg-primary text-primary-foreground">
  Primary colored element
</div>

// Custom colors need to be added to tailwind.config.js
```

### Typography

Customize fonts and text sizes:

```typescript
typography: {
  fonts: {
    sans: "var(--font-inter)", // Change to your font
    mono: "var(--font-roboto-mono)",
  },
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    // Add custom sizes
    hero: "4rem",
  },
}
```

#### Adding Custom Fonts

1. Install font from Google Fonts:
```tsx
// src/app/layout.tsx
import { Your_Font } from "next/font/google";

const yourFont = Your_Font({
  variable: "--font-your-font",
  subsets: ["latin"],
});
```

2. Apply to the layout:
```tsx
<body className={`${yourFont.variable}`}>
```

## Component Customization

### Adding New shadcn/ui Components

```bash
# Add a single component
pnpm dlx shadcn@latest add dialog

# Add multiple components
pnpm dlx shadcn@latest add dialog sheet drawer

# With npm
npx shadcn@latest add dialog
```

### Creating Custom Components

1. Create component file:
```tsx
// src/components/custom/MyComponent.tsx
import { cn } from "@/lib/utils";

interface MyComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn("your-base-classes", className)}>
      {children}
    </div>
  );
}
```

2. Use the component:
```tsx
import { MyComponent } from "@/components/custom/MyComponent";

<MyComponent className="additional-classes">
  Content
</MyComponent>
```

### Modifying Existing Components

Components are in `src/components/ui/`. You can directly edit them:

```tsx
// src/components/ui/button.tsx
// Modify variants, sizes, or default styles
const buttonVariants = cva(
  "your-custom-base-classes",
  {
    variants: {
      variant: {
        default: "your-custom-default-classes",
        // Add new variant
        brand: "bg-brand text-white hover:bg-brand/90",
      },
    },
  }
);
```

## Layout Customization

### Navigation

Edit the dashboard navigation in `src/app/dashboard/page.tsx`:

```tsx
const navigationItems = [
  { id: "home", label: "Home", icon: Home },
  { id: "profile", label: "Profile", icon: User },
  // Add your items
  { id: "custom", label: "Custom", icon: YourIcon },
];
```

### Page Layouts

Create custom layouts for different sections:

```tsx
// src/app/(section)/layout.tsx
export default function SectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="custom-layout">
      <nav>Section Navigation</nav>
      <main>{children}</main>
    </div>
  );
}
```

## Styling with Tailwind CSS

### Extending Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: "hsl(var(--brand))",
        "brand-foreground": "hsl(var(--brand-foreground))",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
};
```

### Using CSS Variables

Define in globals.css:

```css
@layer base {
  :root {
    --brand: 15 90% 55%;
    --brand-foreground: 0 0% 100%;
  }
  
  .dark {
    --brand: 15 90% 65%;
    --brand-foreground: 0 0% 100%;
  }
}
```

## Mobile Customization

### Touch Targets

Ensure touch targets are at least 44x44px:

```tsx
<Button className="min-h-[44px] min-w-[44px]">
  Tap Me
</Button>
```

### Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="
  grid-cols-1      // Mobile
  sm:grid-cols-2   // Small screens
  md:grid-cols-3   // Medium screens
  lg:grid-cols-4   // Large screens
">
```

### Mobile-Specific Features

```tsx
// Detect mobile device
const isMobile = useMediaQuery("(max-width: 768px)");

// Mobile-only component
{isMobile && <MobileOnlyFeature />}

// Different layouts
<div className={isMobile ? "mobile-layout" : "desktop-layout"}>
```

## Authentication Customization

### Email Templates

Customize Supabase email templates in your dashboard:
1. Go to Authentication → Email Templates
2. Modify templates for:
   - Confirmation
   - Password Reset
   - Magic Link

### Auth Providers

Add social auth providers:

```tsx
// src/app/login/page.tsx
const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
};
```

## Environment-Specific Customization

### Development vs Production

```typescript
// src/lib/config.ts
export const config = {
  isDevelopment: process.env.NODE_ENV === 'development',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    debug: process.env.NODE_ENV === 'development',
  },
};
```

### Feature Flags

```tsx
// src/lib/features.ts
export const features = {
  newDashboard: process.env.NEXT_PUBLIC_FEATURE_NEW_DASHBOARD === 'true',
  betaFeatures: process.env.NEXT_PUBLIC_BETA_FEATURES === 'true',
};

// Usage
{features.newDashboard && <NewDashboard />}
```

## Performance Customization

### Image Optimization

```tsx
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // Load immediately
  placeholder="blur" // Show blur while loading
  blurDataURL="..." // Base64 encoded blur
/>
```

### Code Splitting

```tsx
// Dynamic imports for heavy components
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <Skeleton />,
    ssr: false, // Disable SSR if needed
  }
);
```

## Deployment Customization

### Environment Variables

Different configs per environment:

```bash
# .env.development
NEXT_PUBLIC_API_URL=http://localhost:3000

# .env.production
NEXT_PUBLIC_API_URL=https://api.yourapp.com
```

### Build-Time Configuration

```javascript
// next.config.ts
const config = {
  images: {
    domains: ['your-cdn.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
};
```

## Advanced Customization

### Custom Hooks

```typescript
// src/hooks/useCustomFeature.ts
export function useCustomFeature() {
  const [state, setState] = useState();
  
  useEffect(() => {
    // Custom logic
  }, []);
  
  return { state, setState };
}
```

### API Routes

```typescript
// src/app/api/custom/route.ts
export async function GET(request: Request) {
  // Handle GET request
  return Response.json({ data: "custom" });
}

export async function POST(request: Request) {
  const body = await request.json();
  // Handle POST request
  return Response.json({ success: true });
}
```

### Middleware

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  // Custom middleware logic
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Check admin access
  }
}

export const config = {
  matcher: ['/admin/:path*'],
};
```

## Best Practices

1. **Keep theme centralized**: Use `theme-config.ts` for all theme values
2. **Use CSS variables**: Makes theme switching easier
3. **Component composition**: Build complex components from simple ones
4. **Responsive first**: Design for mobile, enhance for desktop
5. **Performance**: Lazy load heavy components
6. **Type safety**: Leverage TypeScript for all customizations
7. **Testing**: Write tests for custom components

## Getting Help

- Component Library: [ui.shadcn.com](https://ui.shadcn.com)
- Tailwind CSS: [tailwindcss.com](https://tailwindcss.com)
- Next.js: [nextjs.org](https://nextjs.org)
- React: [react.dev](https://react.dev)
