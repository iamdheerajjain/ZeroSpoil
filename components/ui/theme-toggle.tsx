"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers/theme-provider";
import { Select } from "@/components/ui/select";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleToggle = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getIcon = () => {
    if (theme === "system") {
      return <Monitor className="h-4 w-4" />;
    }
    return resolvedTheme === "dark" ? (
      <Moon className="h-4 w-4" />
    ) : (
      <Sun className="h-4 w-4" />
    );
  };

  const getLabel = () => {
    if (theme === "system") return "System";
    return theme === "dark" ? "Dark" : "Light";
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggle}
      className="relative overflow-hidden transition-all duration-200 hover:bg-accent"
      title={`Switch to ${
        theme === "light" ? "dark" : theme === "dark" ? "system" : "light"
      } mode`}
    >
      <div className="relative w-4 h-4">{getIcon()}</div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export function ThemeSelect() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTheme("light")}
        className="w-20"
      >
        <Sun className="h-4 w-4 mr-1" />
        Light
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTheme("dark")}
        className="w-20"
      >
        <Moon className="h-4 w-4 mr-1" />
        Dark
      </Button>
      <Button
        variant={theme === "system" ? "default" : "ghost"}
        size="sm"
        onClick={() => setTheme("system")}
        className="w-20"
      >
        <Monitor className="h-4 w-4 mr-1" />
        Auto
      </Button>
    </div>
  );
}
