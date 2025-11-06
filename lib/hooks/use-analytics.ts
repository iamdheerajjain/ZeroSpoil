"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { AnalyticsMetrics, WasteLog } from "@/types"

export function useAnalytics(period: number = 30) {
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiClient.analytics.getAnalytics(period)
      setAnalytics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch analytics")
    } finally {
      setLoading(false)
    }
  }

  const getWasteLogs = async (filters?: {
    action?: string
    start_date?: string
    end_date?: string
  }) => {
    try {
      return await apiClient.analytics.getWasteLogs(filters)
    } catch (err) {
      throw err
    }
  }

  const createWasteLog = async (data: Omit<WasteLog, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const newLog = await apiClient.analytics.createWasteLog(data)
      // Refresh analytics after creating a waste log
      fetchAnalytics()
      return newLog
    } catch (err) {
      throw err
    }
  }

  const getWasteReduction = async (periodDays: number = 30) => {
    try {
      return await apiClient.analytics.getWasteReduction(periodDays)
    } catch (err) {
      throw err
    }
  }

  const getCategoryInsights = async () => {
    try {
      return await apiClient.analytics.getCategoryInsights()
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [period])

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    getWasteLogs,
    createWasteLog,
    getWasteReduction,
    getCategoryInsights
  }
}