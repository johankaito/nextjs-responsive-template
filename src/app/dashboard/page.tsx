"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabase } from "@/components/SupabaseContext";
import { useAuth } from "@/hooks/useAuth";
import { 
  Home, 
  User, 
  Settings, 
  BarChart3, 
  LogOut,
  Menu,
  X,
  Moon,
  Sun
} from "lucide-react";
import { useTheme } from "next-themes";

export default function DashboardPage() {
  const router = useRouter();
  const { client: supabase } = useSupabase();
  const { user, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background border-r">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {[
                  { id: "home", label: "Home", icon: Home },
                  { id: "profile", label: "Profile", icon: User },
                  { id: "analytics", label: "Analytics", icon: BarChart3 },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                  >
                    <tab.icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </nav>
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-screen">
        {/* Sidebar */}
        <div className="w-64 border-r bg-muted/10">
          <div className="flex flex-col h-full">
            <div className="p-6 border-b">
              <h1 className="text-2xl font-bold">Dashboard</h1>
            </div>
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {[
                  { id: "home", label: "Home", icon: Home },
                  { id: "profile", label: "Profile", icon: User },
                  { id: "analytics", label: "Analytics", icon: BarChart3 },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <tab.icon className="mr-2 h-4 w-4" />
                    {tab.label}
                  </Button>
                ))}
              </div>
            </nav>
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground">Theme</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <DashboardContent activeTab={activeTab} user={user} />
          </div>
        </div>
      </div>

      {/* Mobile Content */}
      <div className="lg:hidden p-4">
        <DashboardContent activeTab={activeTab} user={user} />
      </div>
    </div>
  );
}

function DashboardContent({ activeTab, user }: { activeTab: string; user: { supabaseUser: { email?: string } | null } }) {
  const content = {
    home: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your application
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>Active users this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Revenue</CardTitle>
              <CardDescription>Total revenue this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,345</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Projects</CardTitle>
              <CardDescription>Currently running projects</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">5 completed this week</p>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
    profile: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
          <p className="text-muted-foreground">Manage your account settings</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>User Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-muted-foreground">Email</Label>
              <p className="font-medium">{user?.email || "No email"}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">User ID</Label>
              <p className="font-mono text-sm">{user?.id || "No ID"}</p>
            </div>
            <div>
              <Label className="text-sm text-muted-foreground">Created At</Label>
              <p className="text-sm">
                {user?.created_at 
                  ? new Date(user.created_at).toLocaleDateString() 
                  : "Unknown"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    ),
    analytics: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">View your application metrics</p>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Key metrics for the last 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">Chart placeholder</p>
              </div>
            </CardContent>
          </Card>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[150px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Growth chart</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Engagement Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[150px] flex items-center justify-center border-2 border-dashed rounded-lg">
                  <p className="text-muted-foreground">Engagement chart</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    ),
    settings: (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your application preferences</p>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">Select your preferred theme</p>
                </div>
                <p className="text-sm">Current: System</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <p className="text-sm">Enabled</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    ),
  };

  return content[activeTab as keyof typeof content] || content.home;
}

// Import Label since we're using it
import { Label } from "@/components/ui/label";
