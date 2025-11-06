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
    const status = searchParams.get("status")

    let query = supabase
      .from("donations")
      .select(`
        *,
        donation_locations(
          id,
          name,
          address,
          contact_phone,
          hours
        )
      `)
      .eq("user_id", user.id)
      .order("scheduled_date", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data: donations, error } = await query

    if (error) {
      console.error("Error fetching donations:", error)
      return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 })
    }

    return NextResponse.json({ data: donations })
  } catch (error) {
    console.error("Error fetching donations:", error)
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
    const { location_id, scheduled_date, items, total_weight, estimated_meals, notes } = body

    if (!location_id || !scheduled_date || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: donation, error } = await supabase
      .from("donations")
      .insert({
        user_id: user.id,
        location_id,
        scheduled_date,
        items,
        total_weight,
        estimated_meals,
        notes,
        status: "scheduled"
      })
      .select(`
        *,
        donation_locations(
          id,
          name,
          address,
          contact_phone,
          hours
        )
      `)
      .single()

    if (error) {
      console.error("Error creating donation:", error)
      return NextResponse.json({ error: "Failed to create donation" }, { status: 500 })
    }

    return NextResponse.json({ data: donation }, { status: 201 })
  } catch (error) {
    console.error("Error creating donation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}