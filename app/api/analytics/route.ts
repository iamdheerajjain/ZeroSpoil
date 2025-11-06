import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get("period") || "30" // Default 30 days
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - parseInt(period))

    // Get food items summary
    const { data: foodItems, error: foodError } = await supabase
      .from("food_items")
      .select("id, status, category, quantity, purchase_date")
      .eq("user_id", user.id)

    if (foodError) {
      console.error("Error fetching food items:", foodError)
      return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
    }

    // Get waste logs for the period
    const { data: wasteLogs, error: wasteError } = await supabase
      .from("waste_logs")
      .select("action, date, quantity, estimated_value")
      .eq("user_id", user.id)
      .gte("date", startDate.toISOString().split('T')[0])

    if (wasteError) {
      console.error("Error fetching waste logs:", wasteError)
      return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
    }

    // Get donations count
    const { data: donations, error: donationError } = await supabase
      .from("donations")
      .select("id, status, estimated_meals")
      .eq("user_id", user.id)
      .eq("status", "completed")

    if (donationError) {
      console.error("Error fetching donations:", donationError)
      return NextResponse.json({ error: "Failed to fetch analytics data" }, { status: 500 })
    }

    // Calculate metrics
    const totalItems = foodItems?.length || 0
    const expiringItems = foodItems?.filter(item => item.status === 'expiring_soon').length || 0
    const expiredItems = foodItems?.filter(item => item.status === 'expired').length || 0

    // Calculate money saved (from prevented waste)
    const savedItems = wasteLogs?.filter(log => ['consumed', 'donated', 'preserved'].includes(log.action)) || []
    const moneySaved = savedItems.reduce((total, log) => total + (log.estimated_value || 0), 0)

    // Calculate waste prevented (items not wasted)
    const wastedItems = wasteLogs?.filter(log => log.action === 'wasted') || []
    const wastePreventedCount = savedItems.length
    const wastedCount = wastedItems.length

    // Calculate CO2 saved (rough estimate: 2.5kg CO2 per kg of food waste prevented)
    const totalQuantitySaved = savedItems.reduce((total, log) => total + (log.quantity || 1), 0)
    const co2Saved = totalQuantitySaved * 0.5 * 2.5 // Assume 0.5kg per item average

    // Calculate meals preserved
    const mealsPreserved = savedItems.length * 1.2 // Rough estimate

    // Donation count
    const donationCount = donations?.length || 0

    // Waste trend data (last 7 days)
    const wasteTrend = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayWasted = wasteLogs?.filter(log => 
        log.date === dateStr && log.action === 'wasted'
      ).length || 0
      
      const daySaved = wasteLogs?.filter(log => 
        log.date === dateStr && ['consumed', 'donated', 'preserved'].includes(log.action)
      ).length || 0
      
      const dayDonated = wasteLogs?.filter(log => 
        log.date === dateStr && log.action === 'donated'
      ).length || 0

      wasteTrend.push({
        date: dateStr,
        wasted: dayWasted,
        saved: daySaved,
        donated: dayDonated
      })
    }

    // Category breakdown
    const categoryMap = new Map()
    foodItems?.forEach(item => {
      const count = categoryMap.get(item.category) || 0
      categoryMap.set(item.category, count + 1)
    })

    const categoryBreakdown = Array.from(categoryMap.entries()).map(([category, count]) => ({
      category,
      count,
      percentage: totalItems > 0 ? Math.round((count / totalItems) * 100) : 0
    }))

    // Action distribution
    const actionMap = new Map()
    wasteLogs?.forEach(log => {
      const count = actionMap.get(log.action) || 0
      actionMap.set(log.action, count + 1)
    })

    const actionDistribution = Array.from(actionMap.entries()).map(([action, count]) => ({
      action,
      count,
      percentage: wasteLogs && wasteLogs.length > 0 ? Math.round((count / wasteLogs.length) * 100) : 0
    }))

    const analytics = {
      total_items: totalItems,
      expiring_soon: expiringItems,
      expired: expiredItems,
      money_saved: Math.round(moneySaved * 100) / 100,
      waste_prevented: wastePreventedCount,
      co2_saved: Math.round(co2Saved * 100) / 100,
      meals_preserved: Math.round(mealsPreserved),
      donation_count: donationCount,
      waste_trend: wasteTrend,
      category_breakdown: categoryBreakdown,
      action_distribution: actionDistribution
    }

    return NextResponse.json({ data: analytics })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}