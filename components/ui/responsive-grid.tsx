"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    "2xl"?: number;
  };
  gap?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ResponsiveGrid = ({
  children,
  className = "",
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = { default: 4, md: 6, lg: 8 },
}: ResponsiveGridProps) => {
  const gridCols = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    cols["2xl"] && `2xl:grid-cols-${cols["2xl"]}`,
  ]
    .filter(Boolean)
    .join(" ");

  const gridGap = [
    gap.default && `gap-${gap.default}`,
    gap.sm && `sm:gap-${gap.sm}`,
    gap.md && `md:gap-${gap.md}`,
    gap.lg && `lg:gap-${gap.lg}`,
    gap.xl && `xl:gap-${gap.xl}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("grid", gridCols, gridGap, className)}>{children}</div>
  );
};

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ResponsiveContainer = ({
  children,
  className = "",
  size = "xl",
  padding = { default: 4, sm: 6, lg: 8 },
}: ResponsiveContainerProps) => {
  const maxWidth = {
    sm: "max-w-2xl",
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    "2xl": "max-w-none",
    full: "w-full",
  }[size];

  const containerPadding = [
    padding.default && `px-${padding.default}`,
    padding.sm && `sm:px-${padding.sm}`,
    padding.md && `md:px-${padding.md}`,
    padding.lg && `lg:px-${padding.lg}`,
    padding.xl && `xl:px-${padding.xl}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cn("mx-auto w-full", maxWidth, containerPadding, className)}
    >
      {children}
    </div>
  );
};

interface FlexResponsiveProps {
  children: ReactNode;
  className?: string;
  direction?: {
    default?: "row" | "col";
    sm?: "row" | "col";
    md?: "row" | "col";
    lg?: "row" | "col";
  };
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  gap?: number;
  wrap?: boolean;
}

export const FlexResponsive = ({
  children,
  className = "",
  direction = { default: "row" },
  align = "center",
  justify = "start",
  gap = 4,
  wrap = false,
}: FlexResponsiveProps) => {
  const flexDirection = [
    direction.default === "col" ? "flex-col" : "flex-row",
    direction.sm && (direction.sm === "col" ? "sm:flex-col" : "sm:flex-row"),
    direction.md && (direction.md === "col" ? "md:flex-col" : "md:flex-row"),
    direction.lg && (direction.lg === "col" ? "lg:flex-col" : "lg:flex-row"),
  ]
    .filter(Boolean)
    .join(" ");

  const alignItems = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  }[align];

  const justifyContent = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  }[justify];

  return (
    <div
      className={cn(
        "flex",
        flexDirection,
        alignItems,
        justifyContent,
        `gap-${gap}`,
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </div>
  );
};

interface ResponsiveSpacingProps {
  children: ReactNode;
  className?: string;
  y?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  x?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}

export const ResponsiveSpacing = ({
  children,
  className = "",
  y,
  x,
}: ResponsiveSpacingProps) => {
  const ySpacing = y
    ? [
        y.default && `py-${y.default}`,
        y.sm && `sm:py-${y.sm}`,
        y.md && `md:py-${y.md}`,
        y.lg && `lg:py-${y.lg}`,
        y.xl && `xl:py-${y.xl}`,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  const xSpacing = x
    ? [
        x.default && `px-${x.default}`,
        x.sm && `sm:px-${x.sm}`,
        x.md && `md:px-${x.md}`,
        x.lg && `lg:px-${x.lg}`,
        x.xl && `xl:px-${x.xl}`,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return <div className={cn(ySpacing, xSpacing, className)}>{children}</div>;
};

// Responsive text component
interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  size?: {
    default?:
      | "xs"
      | "sm"
      | "base"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl";
    sm?:
      | "xs"
      | "sm"
      | "base"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl";
    md?:
      | "xs"
      | "sm"
      | "base"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl";
    lg?:
      | "xs"
      | "sm"
      | "base"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl";
    xl?:
      | "xs"
      | "sm"
      | "base"
      | "lg"
      | "xl"
      | "2xl"
      | "3xl"
      | "4xl"
      | "5xl"
      | "6xl";
  };
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
}

export const ResponsiveText = ({
  children,
  className = "",
  size = { default: "base" },
  weight = "normal",
  as: Component = "div",
  ...props
}: ResponsiveTextProps & React.HTMLAttributes<HTMLElement>) => {
  const textSizes = [
    size.default && `text-${size.default}`,
    size.sm && `sm:text-${size.sm}`,
    size.md && `md:text-${size.md}`,
    size.lg && `lg:text-${size.lg}`,
    size.xl && `xl:text-${size.xl}`,
  ]
    .filter(Boolean)
    .join(" ");

  const fontWeight = {
    light: "font-light",
    normal: "font-normal",
    medium: "font-medium",
    semibold: "font-semibold",
    bold: "font-bold",
  }[weight];

  return (
    <Component className={cn(textSizes, fontWeight, className)} {...props}>
      {children}
    </Component>
  );
};

// Responsive image component
interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  width?: number;
  height?: number;
}

export const ResponsiveImage = ({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  fill = false,
  width,
  height,
}: ResponsiveImageProps) => {
  // This would typically use Next.js Image component
  return (
    <img
      src={src}
      alt={alt}
      className={cn(
        "h-auto w-full object-cover transition-all duration-300",
        className
      )}
      loading={priority ? "eager" : "lazy"}
      style={fill ? { objectFit: "cover" } : undefined}
      width={width}
      height={height}
    />
  );
};

// Responsive card layout
interface ResponsiveCardProps {
  children: ReactNode;
  className?: string;
  padding?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
  };
  hover?: boolean;
}

export const ResponsiveCard = ({
  children,
  className = "",
  padding = { default: 4, sm: 6, lg: 8 },
  hover = true,
}: ResponsiveCardProps) => {
  const cardPadding = [
    padding.default && `p-${padding.default}`,
    padding.sm && `sm:p-${padding.sm}`,
    padding.md && `md:p-${padding.md}`,
    padding.lg && `lg:p-${padding.lg}`,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white shadow-soft",
        cardPadding,
        hover &&
          "transition-all duration-300 hover:shadow-medium hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
};

// Responsive section wrapper
interface ResponsiveSectionProps {
  children: ReactNode;
  className?: string;
  background?: "white" | "gray" | "gradient" | "primary";
  spacing?: {
    y?: {
      default?: number;
      md?: number;
      lg?: number;
    };
  };
}

export const ResponsiveSection = ({
  children,
  className = "",
  background = "white",
  spacing = { y: { default: 12, md: 16, lg: 20 } },
}: ResponsiveSectionProps) => {
  const backgroundClass = {
    white: "bg-white",
    gray: "bg-gray-50",
    gradient: "bg-gradient-to-br from-gray-50 via-white to-gray-50",
    primary: "bg-gradient-to-r from-primary to-primary/90",
  }[background];

  const sectionSpacing = spacing.y
    ? [
        spacing.y.default && `py-${spacing.y.default}`,
        spacing.y.md && `md:py-${spacing.y.md}`,
        spacing.y.lg && `lg:py-${spacing.y.lg}`,
      ]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <section className={cn(backgroundClass, sectionSpacing, className)}>
      {children}
    </section>
  );
};
