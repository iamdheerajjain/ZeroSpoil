import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { PWAProvider } from "@/components/pwa-provider";

export const metadata: Metadata = {
  title: {
    default: "ZeroSpoil - Smart Food Waste Management",
    template: "%s | ZeroSpoil",
  },
  description:
    "Reduce food waste with AI-powered expiration predictions, smart recipe suggestions, and local donation connections. Join thousands saving money and helping the environment.",
  keywords: [
    "food waste",
    "sustainability",
    "AI",
    "recipes",
    "donations",
    "expiration tracking",
    "food management",
    "waste reduction",
    "environmental impact",
    "smart kitchen",
    "meal planning",
    "food preservation",
    "sustainable living",
  ],
  authors: [{ name: "ZeroSpoil Team", url: "https://zerospoil.com" }],
  creator: "ZeroSpoil Team",
  publisher: "ZeroSpoil",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://zerospoil.com",
    title: "ZeroSpoil - Smart Food Waste Management",
    description:
      "Reduce food waste with AI-powered expiration predictions, smart recipe suggestions, and local donation connections.",
    siteName: "ZeroSpoil",
    images: [
      {
        url: "https://zerospoil.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ZeroSpoil - Smart Food Waste Management Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ZeroSpoil - Smart Food Waste Management",
    description:
      "Reduce food waste with AI-powered expiration predictions, smart recipe suggestions, and local donation connections.",
    site: "@zerospoil",
    creator: "@zerospoil",
    images: ["https://zerospoil.com/twitter-image.jpg"],
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://zerospoil.com",
  },
  category: "Food & Lifestyle",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="ZeroSpoil" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ZeroSpoil" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/icons/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#d8125b" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#d8125b" />

        {/* PWA Icons */}
        <link rel="apple-touch-icon" href="/icons/icon-152x152.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icons/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icons/icon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="mask-icon"
          href="/icons/safari-pinned-tab.svg"
          color="#d8125b"
        />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <ErrorBoundary>
          <ThemeProvider defaultTheme="system">
            <AuthProvider>
              <PWAProvider />
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
