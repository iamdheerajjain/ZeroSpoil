import { Loader2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface LoadingProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  variant?: "spinner" | "dots" | "pulse" | "wave";
  text?: string;
  className?: string;
}

export function Loading({
  size = "md",
  variant = "spinner",
  text,
  className,
}: LoadingProps) {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const renderSpinner = () => {
    switch (variant) {
      case "spinner":
        return (
          <Loader2
            className={cn(sizeClasses[size], "animate-spin text-primary")}
          />
        );
      case "dots":
        return (
          <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={cn(
                  "bg-primary rounded-full",
                  size === "xs"
                    ? "w-1 h-1"
                    : size === "sm"
                    ? "w-1.5 h-1.5"
                    : size === "md"
                    ? "w-2 h-2"
                    : size === "lg"
                    ? "w-3 h-3"
                    : "w-4 h-4"
                )}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        );
      case "pulse":
        return (
          <div
            className={cn(
              "bg-gradient-to-r from-primary to-primary/50 rounded-full animate-pulse",
              sizeClasses[size]
            )}
          />
        );
      case "wave":
        return (
          <div className="flex items-end space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={cn(
                  "bg-primary animate-pulse",
                  size === "xs"
                    ? "w-0.5"
                    : size === "sm"
                    ? "w-1"
                    : size === "md"
                    ? "w-1.5"
                    : size === "lg"
                    ? "w-2"
                    : "w-3"
                )}
                style={{
                  height: `${(i + 1) * 4}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "0.8s",
                }}
              />
            ))}
          </div>
        );
      default:
        return (
          <Loader2
            className={cn(sizeClasses[size], "animate-spin text-primary")}
          />
        );
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 animate-fade-in",
        className
      )}
    >
      {renderSpinner()}
      {text && (
        <p className="mt-4 text-sm text-gray-600 animate-fade-in opacity-70">
          {text}
        </p>
      )}
    </div>
  );
}

// Skeleton loading component for cards and content
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="bg-gray-200 rounded-xl h-48 w-full mb-4"></div>
      <div className="space-y-2">
        <div className="bg-gray-200 rounded h-4 w-3/4"></div>
        <div className="bg-gray-200 rounded h-4 w-1/2"></div>
      </div>
    </div>
  );
}

// Inline loading component for buttons
export function InlineLoading({ size = "sm" }: { size?: "xs" | "sm" | "md" }) {
  return (
    <Loader2
      className={cn("animate-spin", {
        "h-3 w-3": size === "xs",
        "h-4 w-4": size === "sm",
        "h-5 w-5": size === "md",
      })}
    />
  );
}
