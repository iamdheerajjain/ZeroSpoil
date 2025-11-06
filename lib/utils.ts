import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date))
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date()
  const targetDate = new Date(date)
  const diffInDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} days ago`
  } else if (diffInDays === 0) {
    return 'Today'
  } else if (diffInDays === 1) {
    return 'Tomorrow'
  } else {
    return `In ${diffInDays} days`
  }
}

export function getExpirationStatus(expirationDate: string): 'fresh' | 'expiring_soon' | 'expired' {
  const now = new Date()
  const expDate = new Date(expirationDate)
  const diffInDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays < 0) return 'expired'
  if (diffInDays <= 3) return 'expiring_soon'
  return 'fresh'
}

export function getStatusColor(status: 'fresh' | 'expiring_soon' | 'expired'): string {
  switch (status) {
    case 'fresh':
      return 'text-green-600 bg-green-50'
    case 'expiring_soon':
      return 'text-yellow-600 bg-yellow-50'
    case 'expired':
      return 'text-danger bg-danger/10'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

export function calculateMoneySaved(wastedItems: any[], averageFoodCost = 3.5): number {
  return wastedItems.reduce((total, item) => {
    return total + (item.quantity || 1) * averageFoodCost
  }, 0)
}

export function calculateCO2Saved(wastedItems: any[]): number {
  // Average CO2 per kg of food waste prevented
  const co2PerKg = 2.5
  const totalWeight = wastedItems.reduce((total, item) => {
    return total + (item.quantity || 1) * 0.5 // Assume 0.5kg average per item
  }, 0)
  return totalWeight * co2PerKg
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}