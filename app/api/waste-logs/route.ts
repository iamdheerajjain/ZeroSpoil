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
    const action = searchParams.get("action")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    let query = supabase
      .from("waste_logs")
      .select(`
        *,
        food_items(
          id,
          name,
          category
        )
      `)
      .eq("user_id", user.id)
      .order("date", { ascending: false })

    if (action && action !== "all") {
      query = query.eq("action", action)
    }
    if (startDate) {
      query = query.gte("date", startDate)
    }
    if (endDate) {
      query = query.lte("date", endDate)
    }

    const { data: wasteLogs, error } = await query

    if (error) {
      console.error("Error fetching waste logs:", error)
      return NextResponse.json({ error: "Failed to fetch waste logs" }, { status: 500 })
    }

    return NextResponse.json({ data: wasteLogs })
  } catch (error) {
    console.error("Error fetching waste logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { food_item_id, action, date, quantity, estimated_value, notes } = body

    if (!action || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: wasteLog, error } = await supabase
      .from("waste_logs")
      .insert({
        user_id: user.id,
        food_item_id,
        action,
        date,
        quantity,
        estimated_value,
        notes
      })
      .select(`
        *,
        food_items(
          id,
          name,
          category
        )
      `)
      .single()

    if (error) {
      console.error("Error creating waste log:", error)
      return NextResponse.json({ error: "Failed to create waste log" }, { status: 500 })
    }

    return NextResponse.json({ data: wasteLog }, { status: 201 })
  } catch (error) {
    console.error("Error creating waste log:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}