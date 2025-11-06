import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { email, password, full_name } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: full_name || ''
        }
      }
    })

    if (authError) {
      console.error("Signup error:", authError)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    // Create user profile
    const { error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        id: authData.user.id,
        email: authData.user.email,
        full_name: full_name || '',
        avatar_url: '',
        dietary_restrictions: [],
        favorite_cuisines: [],
        measurement_system: 'metric',
        business_account: false,
        theme: 'light',
        notification_settings: {
          expiration_alerts: true,
          recipe_suggestions: true,
          donation_reminders: true,
          achievement_notifications: true,
          email_notifications: false
        }
      })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Don't fail the signup if profile creation fails
    }

    return NextResponse.json({ 
      data: { 
        user: authData.user,
        session: authData.session
      },
      message: authData.session 
        ? "Account created successfully" 
        : "Please check your email to confirm your account"
    })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}