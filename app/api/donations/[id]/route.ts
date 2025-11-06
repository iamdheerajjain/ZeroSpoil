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

    const { data: donation, error } = await supabase
      .from("donations")
      .select(`
        *,
        donation_locations(
          id,
          name,
          address,
          latitude,
          longitude,
          contact_phone,
          contact_email,
          hours,
          website
        )
      `)
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 })
    }

    return NextResponse.json({ data: donation })
  } catch (error) {
    console.error("Error fetching donation:", error)
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
    const { location_id, scheduled_date, status, items, total_weight, estimated_meals, notes } = body

    const { data: donation, error } = await supabase
      .from("donations")
      .update({
        location_id,
        scheduled_date,
        status,
        items,
        total_weight,
        estimated_meals,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
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
      console.error("Error updating donation:", error)
      return NextResponse.json({ error: "Failed to update donation" }, { status: 500 })
    }

    return NextResponse.json({ data: donation })
  } catch (error) {
    console.error("Error updating donation:", error)
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
      .from("donations")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting donation:", error)
      return NextResponse.json({ error: "Failed to delete donation" }, { status: 500 })
    }

    return NextResponse.json({ message: "Donation deleted successfully" })
  } catch (error) {
    console.error("Error deleting donation:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}