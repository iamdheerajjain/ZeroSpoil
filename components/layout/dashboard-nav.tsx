"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  Package,
  ChefHat,
  Heart,
  BarChart3,
  LogOut,
  User,
  Menu,
  X,
  Leaf,
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Food Items", href: "/dashboard/food-items", icon: Package },
  { name: "Recipes", href: "/dashboard/recipes", icon: ChefHat },
  { name: "Donations", href: "/dashboard/donations", icon: Heart },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Profile", href: "/dashboard/profile", icon: User },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const NavigationItems = () => (
    <>
      {navigation.map((item, index) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
              isActive
                ? "bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg transform hover:scale-[1.02]"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md"
            )}
          >
            <item.icon
              className={cn(
                "mr-3 h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-white" : "text-gray-500"
              )}
            />
            {item.name}
            {isActive && (
              <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse" />
            )}
          </Link>
        );
      })}
    </>
  );

  // Prevent rendering until mounted to avoid hydration issues
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-lg hover:shadow-xl rounded-xl"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6 text-gray-700" />
        ) : (
          <Menu className="h-6 w-6 text-gray-700" />
        )}
      </Button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40 animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex h-full w-64 flex-col bg-white border-r shadow-sm">
        <SidebarContent />
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white border-r shadow-xl transform transition-transform duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <SidebarContent />
      </div>
    </>
  );

  function SidebarContent() {
    return (
      <>
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b bg-gradient-to-r from-primary/5 to-blue-50">
          <Link
            href="/dashboard"
            className="flex items-center space-x-3 hover-scale"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">ZeroSpoil</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <NavigationItems />
        </nav>

        {/* User section */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center space-x-3 mb-4 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-blue-500/20 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.user_metadata?.full_name || user?.email || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <ThemeToggle />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="w-full border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-200 rounded-lg"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </>
    );
  }
}
