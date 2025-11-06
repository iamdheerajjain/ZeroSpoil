"use client";

import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function DashboardHeader({
  title,
  description,
  action,
}: DashboardHeaderProps) {
  return (
    <div className="border-b bg-white/90 backdrop-blur-sm px-4 lg:px-6 py-4 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="ml-0 lg:ml-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 animate-slide-down">
            {title}
          </h1>
          {description && (
            <p
              className="text-sm text-gray-600 mt-1 animate-slide-down"
              style={{ animationDelay: "0.1s" }}
            >
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between lg:justify-end space-x-2 lg:space-x-4">
          {/* Search - hidden on mobile, shown on desktop */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search..."
              className="pl-10 w-48 lg:w-64 bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-primary/20 transition-all duration-200 rounded-lg"
            />
          </div>

          {/* Mobile search button */}
          <Button variant="ghost" size="icon" className="md:hidden hover:bg-gray-100">
            <Search className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-gray-100 transition-colors duration-200"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
          </Button>

          {/* Action button */}
          {action && (
            <Button
              onClick={action.onClick}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5 rounded-lg"
            >
              <Plus className="mr-1 lg:mr-2 h-4 w-4" />
              <span className="hidden sm:inline">{action.label}</span>
              <span className="sm:hidden">Add</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}