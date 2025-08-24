import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Code2, Smartphone, Zap, Shield, Palette, Database } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
            Next.js Responsive Template
          </h1>
          <p className="text-xl text-muted-foreground">
            A production-ready template with mobile-first design, authentication, 
            and modern tooling. Start building your next project in minutes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button asChild size="lg">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Smartphone className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Mobile First</CardTitle>
              <CardDescription>
                Optimized for mobile devices with touch gestures, safe areas, and responsive design
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Authentication Ready</CardTitle>
              <CardDescription>
                Supabase authentication with login, signup, and password reset flows included
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Palette className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Theme System</CardTitle>
              <CardDescription>
                Dark/light mode with customizable design tokens and Tailwind CSS
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Code2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>TypeScript</CardTitle>
              <CardDescription>
                Full TypeScript support with strict mode for type-safe development
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Performance</CardTitle>
              <CardDescription>
                Optimized with React Query, lazy loading, and memoization strategies
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Database className="h-10 w-10 text-primary mb-2" />
              <CardTitle>Database Ready</CardTitle>
              <CardDescription>
                Drizzle ORM configured with Supabase PostgreSQL database
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="container mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Tech Stack</CardTitle>
            <CardDescription>Built with modern, production-ready technologies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="font-semibold">Next.js 14</div>
                <div className="text-sm text-muted-foreground">App Router</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="font-semibold">React 18</div>
                <div className="text-sm text-muted-foreground">Server Components</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="font-semibold">TypeScript</div>
                <div className="text-sm text-muted-foreground">Type Safety</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="font-semibold">Tailwind CSS</div>
                <div className="text-sm text-muted-foreground">Utility-First CSS</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="font-semibold">Supabase</div>
                <div className="text-sm text-muted-foreground">Auth & Database</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="font-semibold">React Query</div>
                <div className="text-sm text-muted-foreground">Data Fetching</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="font-semibold">Radix UI</div>
                <div className="text-sm text-muted-foreground">Accessible Components</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted">
                <div className="font-semibold">Vitest</div>
                <div className="text-sm text-muted-foreground">Testing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">Ready to Start Building?</CardTitle>
            <CardDescription>
              Clone this template and start building your next project with a solid foundation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">
                Get Started Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
