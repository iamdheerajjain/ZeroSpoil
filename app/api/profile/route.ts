import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // Not found error
      console.error("Error fetching profile:", error)
      return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
    }

    // If profile doesn't exist, create one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from("user_profiles")
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || '',
          avatar_url: user.user_metadata?.avatar_url || ''
        })
        .select()
        .single()

      if (createError) {
        console.error("Error creating profile:", createError)
        return NextResponse.json({ error: "Failed to create profile" }, { status: 500 })
      }

      return NextResponse.json({ data: newProfile })
    }

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      full_name, 
      avatar_url, 
      dietary_restrictions, 
      favorite_cuisines, 
      measurement_system, 
      business_account, 
      theme, 
      notification_settings 
    } = body

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .upsert({
        id: user.id,
        email: user.email,
        full_name,
        avatar_url,
        dietary_restrictions: dietary_restrictions || [],
        favorite_cuisines: favorite_cuisines || [],
        measurement_system: measurement_system || 'metric',
        business_account: business_account || false,
        theme: theme || 'light',
        notification_settings: notification_settings || {
          expiration_alerts: true,
          recipe_suggestions: true,
          donation_reminders: true,
          achievement_notifications: true,
          email_notifications: false
        },
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({ data: profile })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}