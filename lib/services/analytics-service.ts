import { createClient } from "@/lib/supabase/client"
import { AnalyticsMetrics, WasteLog } from "@/types"

export class AnalyticsService {
  private supabase = createClient()

  async getAnalytics(period: number = 30): Promise<AnalyticsMetrics> {
    try {
      const response = await fetch(`/api/analytics?period=${period}`)

      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const result = await response.json()
      return result.data as AnalyticsMetrics
    } catch (error) {
      console.error("Error fetching analytics:", error)
      throw error
    }
  }

  async getWasteLogs(filters?: {
    action?: string
    start_date?: string
    end_date?: string
  }): Promise<WasteLog[]> {
    try {
      const params = new URLSearchParams()
      if (filters?.action) params.append("action", filters.action)
      if (filters?.start_date) params.append("start_date", filters.start_date)
      if (filters?.end_date) params.append("end_date", filters.end_date)

      const response = await fetch(`/api/waste-logs?${params}`)

      if (!response.ok) {
        throw new Error("Failed to fetch waste logs")
      }

      const result = await response.json()
      return result.data as WasteLog[]
    } catch (error) {
      console.error("Error fetching waste logs:", error)
      throw error
    }
  }

  async createWasteLog(wasteLog: Omit<WasteLog, 'id' | 'user_id' | 'created_at'>): Promise<WasteLog> {
    try {
      const response = await fetch("/api/waste-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(wasteLog),
      })

      if (!response.ok) {
        throw new Error("Failed to create waste log")
      }

      const result = await response.json()
      return result.data as WasteLog
    } catch (error) {
      console.error("Error creating waste log:", error)
      throw error
    }
  }

  async getWasteReduction(period: number = 30) {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - period)

      const { data: wasteLogs, error } = await this.supabase
        .from("waste_logs")
        .select("action, quantity, estimated_value, date")
        .gte("date", startDate.toISOString().split('T')[0])
        .lte("date", endDate.toISOString().split('T')[0])

      if (error) throw error

      const wastedItems = wasteLogs?.filter(log => log.action === 'wasted') || []
      const savedItems = wasteLogs?.filter(log => ['consumed', 'donated', 'preserved'].includes(log.action)) || []

      const totalWasted = wastedItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
      const totalSaved = savedItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
      const totalValue = savedItems.reduce((sum, item) => sum + (item.estimated_value || 0), 0)

      const wasteReductionPercentage = totalWasted + totalSaved > 0 
        ? Math.round((totalSaved / (totalWasted + totalSaved)) * 100)
        : 0

      return {
        total_wasted: totalWasted,
        total_saved: totalSaved,
        waste_reduction_percentage: wasteReductionPercentage,
        money_saved: totalValue,
        period_days: period
      }
    } catch (error) {
      console.error("Error calculating waste reduction:", error)
      throw error
    }
  }

  async getCategoryInsights() {
    try {
      const { data: foodItems, error } = await this.supabase
        .from("food_items")
        .select("category, status, quantity")

      if (error) throw error

      const categoryStats = new Map()

      foodItems?.forEach(item => {
        const category = item.category
        if (!categoryStats.has(category)) {
          categoryStats.set(category, {
            total: 0,
            fresh: 0,
            expiring_soon: 0,
            expired: 0,
            total_quantity: 0
          })
        }

        const stats = categoryStats.get(category)
        stats.total++
        stats[item.status]++
        stats.total_quantity += item.quantity || 1
      })

      return Array.from(categoryStats.entries()).map(([category, stats]) => ({
        category,
        ...stats,
        waste_risk: Math.round(((stats.expiring_soon + stats.expired) / stats.total) * 100)
      }))
    } catch (error) {
      console.error("Error getting category insights:", error)
      throw error
    }
  }
}