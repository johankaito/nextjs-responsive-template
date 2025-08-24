# Architecture Documentation

## Overview

This document describes the architecture and design decisions of the Next.js Responsive Template.

## Tech Stack Rationale

### Core Framework: Next.js 14

**Why Next.js?**
- **App Router**: Modern routing with layouts and server components
- **Full-stack**: API routes and server-side rendering
- **Performance**: Automatic code splitting and optimization
- **Developer Experience**: Fast refresh and great tooling

### Language: TypeScript

**Why TypeScript?**
- **Type Safety**: Catch errors at compile time
- **IDE Support**: Better autocomplete and refactoring
- **Documentation**: Types serve as inline documentation
- **Maintainability**: Easier to refactor and scale

### Styling: Tailwind CSS

**Why Tailwind?**
- **Utility-First**: Fast development with pre-built classes
- **Mobile-First**: Responsive design built-in
- **Performance**: Only ship CSS you use
- **Customization**: Easy to extend and customize

### UI Components: Radix UI + shadcn/ui

**Why this combination?**
- **Accessibility**: WCAG compliant out of the box
- **Unstyled**: Complete control over styling
- **Composable**: Build complex UIs from primitives
- **Copy-Paste**: Own your components, no lock-in

### Authentication: Supabase

**Why Supabase?**
- **Open Source**: No vendor lock-in
- **Batteries Included**: Auth, database, storage in one
- **Real-time**: WebSocket support built-in
- **Row Level Security**: Secure by default

### State Management: React Query

**Why React Query?**
- **Caching**: Intelligent cache management
- **Synchronization**: Keep UI in sync with server
- **Optimistic Updates**: Better perceived performance
- **Background Refetching**: Fresh data automatically

## Project Structure

```
nextjs-responsive-template/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth group routes
│   │   ├── api/                # API routes
│   │   ├── dashboard/          # Protected routes
│   │   └── layout.tsx          # Root layout
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   └── [feature]/          # Feature components
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-auth.ts         # Authentication
│   │   ├── use-supabase.ts     # Database
│   │   └── use-[feature].ts    # Feature hooks
│   │
│   ├── lib/                    # Utilities
│   │   ├── theme-config.ts     # Theme configuration
│   │   ├── utils.ts            # Helper functions
│   │   └── [feature].ts        # Feature utilities
│   │
│   ├── types/                  # TypeScript types
│   │   └── drizzle.ts          # Database schema
│   │
│   └── styles/                 # Global styles
│       └── globals.css         # Tailwind imports
│
├── public/                     # Static assets
├── drizzle/                    # Database migrations
└── docs/                       # Documentation
```

### Directory Explanations

#### `/src/app`
Next.js 14 App Router structure. Each folder represents a route.

- **Grouped Routes**: `(auth)` groups auth pages without affecting URL
- **Dynamic Routes**: `[id]` for dynamic segments
- **API Routes**: `route.ts` files for API endpoints
- **Layouts**: Nested layouts for shared UI

#### `/src/components`
Reusable React components organized by feature.

- **ui/**: Base components from shadcn/ui
- **Feature folders**: Components grouped by feature
- **Composition**: Build complex from simple components

#### `/src/hooks`
Custom React hooks for business logic.

- **Separation of Concerns**: Logic separate from UI
- **Reusability**: Share logic across components
- **Testing**: Easier to test in isolation

#### `/src/lib`
Utility functions and configurations.

- **theme-config.ts**: Centralized theme management
- **utils.ts**: Common helper functions
- **Feature utilities**: Domain-specific helpers

## Design Patterns

### Component Patterns

#### Compound Components
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Footer</CardFooter>
</Card>
```

#### Render Props
```tsx
<DataProvider
  render={(data) => <DataDisplay data={data} />}
/>
```

#### Custom Hooks
```tsx
function useFeature() {
  const [state, setState] = useState();
  // Business logic
  return { state, setState };
}
```

### State Management Patterns

#### Local State
For component-specific state:
```tsx
const [open, setOpen] = useState(false);
```

#### Global State (Context)
For app-wide state:
```tsx
const { user } = useAuth();
const { theme } = useTheme();
```

#### Server State (React Query)
For server data:
```tsx
const { data, isLoading, error } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
});
```

### Data Flow

```
User Action → Component → Hook → API/Supabase → Database
     ↑                                              ↓
     ←──────── UI Update ←── State Update ←────────
```

## Performance Strategies

### Code Splitting
```tsx
// Dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'));
```

### Memoization
```tsx
// Memo for expensive components
const ExpensiveComponent = memo(({ data }) => {
  // Component logic
});

// useMemo for expensive computations
const expensiveValue = useMemo(() => computeValue(data), [data]);

// useCallback for stable functions
const handleClick = useCallback(() => {}, [dependencies]);
```

### Image Optimization
```tsx
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  placeholder="blur"
  loading="lazy"
/>
```

### Bundle Optimization
- Tree shaking with ES modules
- Minification with SWC
- Compression with gzip/brotli

## Security Architecture

### Authentication Flow
```
1. User enters credentials
2. Supabase validates
3. JWT token issued
4. Token stored in cookies
5. Middleware validates on each request
```

### Authorization
- **Row Level Security**: Database-level access control
- **Middleware**: Route-level protection
- **Component Guards**: UI-level protection

### Data Protection
- **HTTPS**: Encrypted in transit
- **Environment Variables**: Secrets management
- **Input Validation**: Prevent injection attacks
- **CORS**: Cross-origin protection

## Database Architecture

### Schema Design
```sql
-- Users extended from Supabase Auth
profiles
  ├── id (UUID, PK, FK → auth.users)
  ├── email
  ├── full_name
  └── metadata (JSONB)

-- Example content table
posts
  ├── id (UUID, PK)
  ├── user_id (FK → profiles)
  ├── title
  ├── content
  └── timestamps
```

### Relationships
- **One-to-Many**: User → Posts
- **Many-to-Many**: Through junction tables
- **Cascading**: Delete user → delete posts

### Migrations
```bash
# Development workflow
1. Modify schema in drizzle.ts
2. Generate migration: pnpm db:generate
3. Apply migration: pnpm db:migrate
```

## API Architecture

### RESTful Routes
```
GET    /api/posts       # List posts
GET    /api/posts/[id]  # Get post
POST   /api/posts       # Create post
PUT    /api/posts/[id]  # Update post
DELETE /api/posts/[id]  # Delete post
```

### Route Handlers
```tsx
// src/app/api/posts/route.ts
export async function GET(request: Request) {
  // Handle GET
}

export async function POST(request: Request) {
  // Handle POST
}
```

### Error Handling
```tsx
try {
  // Operation
  return Response.json({ data });
} catch (error) {
  return Response.json(
    { error: "Internal Server Error" },
    { status: 500 }
  );
}
```

## Testing Strategy

### Unit Tests
Test individual functions and hooks:
```tsx
describe('useAuth', () => {
  it('should return user when authenticated', () => {
    // Test implementation
  });
});
```

### Integration Tests
Test component interactions:
```tsx
describe('LoginFlow', () => {
  it('should login user successfully', async () => {
    // Test implementation
  });
});
```

### E2E Tests
Test complete user flows:
```tsx
test('user can complete onboarding', async ({ page }) => {
  await page.goto('/signup');
  // Test implementation
});
```

## Deployment Architecture

### Build Process
```
1. TypeScript compilation
2. Next.js build
3. Static optimization
4. Output to .next/
```

### Runtime Architecture
```
CDN → Load Balancer → Next.js Server → Supabase
                    ↓
              Static Assets (CDN)
```

### Scaling Strategy
- **Horizontal**: Multiple server instances
- **Vertical**: Increase server resources
- **Edge**: Deploy to edge locations
- **Caching**: CDN and browser caching

## Mobile Architecture

### Responsive Design
- **Mobile-First**: Start with mobile, enhance for desktop
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Touch Targets**: Minimum 44x44px
- **Gestures**: Swipe, pull-to-refresh

### Performance
- **Lazy Loading**: Load content as needed
- **Code Splitting**: Smaller bundles for mobile
- **Image Optimization**: Responsive images
- **Offline Support**: Service worker caching

### Mobile-Specific Features
```tsx
// Viewport handling
const { hasBottomBar, safeAreaBottom } = useMobileViewport();

// Touch optimization
<Button className="min-h-[44px] touch-manipulation">
```

## Development Workflow

### Git Flow
```
main
  ├── develop
  │     ├── feature/new-feature
  │     └── feature/another-feature
  └── hotfix/urgent-fix
```

### Code Review Process
1. Create feature branch
2. Implement changes
3. Run tests and linting
4. Create pull request
5. Code review
6. Merge to develop
7. Deploy to staging
8. Merge to main
9. Deploy to production

### CI/CD Pipeline
```
Push → Lint → Test → Build → Deploy (Preview)
            ↓
      Merge to main
            ↓
     Deploy (Production)
```

## Monitoring & Observability

### Logging
```tsx
// Development
console.log('[Component]', data);

// Production
logger.info('User action', { userId, action });
```

### Error Tracking
```tsx
try {
  // Operation
} catch (error) {
  captureException(error);
}
```

### Performance Monitoring
- Core Web Vitals
- API response times
- Database query performance
- Bundle size tracking

## Future Considerations

### Scalability
- Microservices architecture
- Database sharding
- Multi-region deployment
- WebSocket scaling

### Features
- Offline-first with PWA
- Real-time collaboration
- AI/ML integration
- Internationalization

### Technology
- React Server Components optimization
- Edge computing
- WebAssembly for performance
- Progressive enhancement

## Decision Log

| Decision | Reasoning | Date |
|----------|-----------|------|
| Next.js 14 | App Router, RSC support | 2024 |
| TypeScript | Type safety, developer experience | 2024 |
| Tailwind CSS | Rapid development, mobile-first | 2024 |
| Supabase | Open source, batteries included | 2024 |
| React Query | Server state management | 2024 |
| Radix UI | Accessibility, composability | 2024 |
| pnpm | Faster, efficient disk usage | 2024 |

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [React Query](https://tanstack.com/query)
- [Radix UI](https://www.radix-ui.com)
- [shadcn/ui](https://ui.shadcn.com)
