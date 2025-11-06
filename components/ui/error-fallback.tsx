"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
}

export function ErrorFallback({
  error,
  resetError,
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again.",
}: ErrorFallbackProps) {
  return (
    <Card
      variant="outlined"
      className="border-red-200 bg-red-50/50 dark:bg-red-900/10 dark:border-red-800"
    >
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <CardTitle className="text-red-900 dark:text-red-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-red-700 dark:text-red-300 mb-4">{description}</p>
        {error && process.env.NODE_ENV === "development" && (
          <details className="text-left mb-4 p-3 bg-red-100 dark:bg-red-900/20 rounded-lg text-sm">
            <summary className="cursor-pointer font-medium text-red-800 dark:text-red-200 mb-2">
              Error Details
            </summary>
            <pre className="text-red-700 dark:text-red-300 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}
        {resetError && (
          <Button
            onClick={resetError}
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-700 dark:text-red-300 dark:hover:bg-red-900/20"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export function InlineError({
  message = "Something went wrong",
  onRetry,
  className,
}: {
  message?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center p-4 text-red-600 dark:text-red-400 ${className}`}
    >
      <AlertTriangle className="h-4 w-4 mr-2" />
      <span className="text-sm">{message}</span>
      {onRetry && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onRetry}
          className="ml-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
