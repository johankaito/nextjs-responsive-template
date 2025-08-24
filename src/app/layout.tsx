import type { Metadata, Viewport } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { UserProvider } from "@/components/UserContext";
import { Toaster } from "@/components/ui/toaster";
import { SupabaseProvider } from "@/components/SupabaseContext";
import { QueryClientProviderWrapper } from "./providers/query-client-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UpdateNotification } from "@/components/UpdateNotification";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover', // Enable safe area handling for mobile browsers
};

export const metadata: Metadata = {
  title: "Next.js Responsive Template",
  description: "A production-ready Next.js template with mobile-first design",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased min-h-screen bg-background`}
      >
        <ErrorBoundary>
          <SupabaseProvider>
            <UserProvider>
              <QueryClientProviderWrapper>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="dark"
                  enableSystem
                  disableTransitionOnChange
                >
                  {children}
                  <Toaster />
                  <UpdateNotification />
                </ThemeProvider>
              </QueryClientProviderWrapper>
            </UserProvider>
          </SupabaseProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
