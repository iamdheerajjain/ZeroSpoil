"use client";

import { DashboardNav } from "./dashboard-nav";
import { DashboardHeader } from "./dashboard-header";
import { PageTransition } from "@/components/ui/motion";
import { ResponsiveContainer } from "@/components/ui/responsive-grid";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function DashboardLayout({
  children,
  title,
  description,
  action,
}: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      <DashboardNav />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 relative">
        <DashboardHeader
          title={title}
          description={description}
          action={action}
        />
        <main className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6 pt-16 lg:pt-6">
          <ResponsiveContainer size="xl" className="h-full">
            <PageTransition>
              <div className="animate-fade-in-up">{children}</div>
            </PageTransition>
          </ResponsiveContainer>
        </main>

        {/* Subtle background animations */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float"></div>
          <div
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400/5 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "3s" }}
          ></div>
        </div>
      </div>
    </div>
  );
}
