import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const category = searchParams.get("category")
    const storage_location = searchParams.get("storage_location")

    // Build query
    let query = supabase
      .from("food_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status)
    }
    if (category) {
      query = query.eq("category", category)
    }
    if (storage_location) {
      query = query.eq("storage_location", storage_location)
    }

    const { data: foodItems, error } = await query

    if (error) {
      console.error("Error fetching food items:", error)
      return NextResponse.json({ error: "Failed to fetch food items" }, { status: 500 })
    }

    return NextResponse.json({ data: foodItems })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate required fields
    const { name, category, purchase_date, storage_location, quantity, unit } = body
    
    if (!name || !category || !purchase_date || !storage_location || !quantity || !unit) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Create food item
    const { data: foodItem, error } = await supabase
      .from("food_items")
      .insert({
        user_id: user.id,
        name,
        category,
        purchase_date,
        expiration_date: body.expiration_date,
        storage_location,
        quantity,
        unit,
        notes: body.notes,
        image_url: body.image_url,
        status: "fresh" // Default status
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating food item:", error)
      return NextResponse.json({ error: "Failed to create food item" }, { status: 500 })
    }

    return NextResponse.json({ data: foodItem }, { status: 201 })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}