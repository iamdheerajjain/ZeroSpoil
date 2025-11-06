import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: foodItem, error } = await supabase
      .from("food_items")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 })
    }

    return NextResponse.json({ data: foodItem })
  } catch (error) {
    console.error("Error fetching food item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { name, category, purchase_date, expiration_date, storage_location, quantity, unit, notes, image_url } = body

    const { data: foodItem, error } = await supabase
      .from("food_items")
      .update({
        name,
        category,
        purchase_date,
        expiration_date,
        storage_location,
        quantity,
        unit,
        notes,
        image_url,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating food item:", error)
      return NextResponse.json({ error: "Failed to update food item" }, { status: 500 })
    }

    return NextResponse.json({ data: foodItem })
  } catch (error) {
    console.error("Error updating food item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("food_items")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting food item:", error)
      return NextResponse.json({ error: "Failed to delete food item" }, { status: 500 })
    }

    return NextResponse.json({ message: "Food item deleted successfully" })
  } catch (error) {
    console.error("Error deleting food item:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}