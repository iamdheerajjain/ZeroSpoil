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
    const cuisine_type = searchParams.get("cuisine_type")
    const dietary_tags = searchParams.get("dietary_tags")
    const difficulty = searchParams.get("difficulty")
    const saved_only = searchParams.get("saved_only") === "true"

    let query = supabase
      .from("recipes")
      .select(`
        *,
        user_saved_recipes!inner(saved_at)
      `)

    if (saved_only) {
      query = query.eq("user_saved_recipes.user_id", user.id)
    } else {
      query = query.or(`is_public.eq.true,user_id.eq.${user.id}`)
    }

    if (cuisine_type) {
      query = query.eq("cuisine_type", cuisine_type)
    }
    if (dietary_tags) {
      query = query.contains("dietary_tags", [dietary_tags])
    }
    if (difficulty) {
      query = query.eq("difficulty", difficulty)
    }

    query = query.order("created_at", { ascending: false })

    const { data: recipes, error } = await query

    if (error) {
      console.error("Error fetching recipes:", error)
      return NextResponse.json({ error: "Failed to fetch recipes" }, { status: 500 })
    }

    // Transform data to include saved status
    const recipesWithSavedStatus = recipes?.map(recipe => ({
      ...recipe,
      saved: recipe.user_saved_recipes?.length > 0
    })) || []

    return NextResponse.json({ data: recipesWithSavedStatus })
  } catch (error) {
    console.error("Error fetching recipes:", error)
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
    const { 
      title, 
      description, 
      ingredients, 
      instructions, 
      cuisine_type, 
      dietary_tags, 
      prep_time, 
      cook_time, 
      servings, 
      difficulty, 
      image_url,
      is_public 
    } = body

    if (!title || !ingredients || !instructions) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const { data: recipe, error } = await supabase
      .from("recipes")
      .insert({
        user_id: user.id,
        title,
        description,
        ingredients,
        instructions,
        cuisine_type,
        dietary_tags: dietary_tags || [],
        prep_time,
        cook_time,
        servings,
        difficulty,
        image_url,
        is_public: is_public || false
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating recipe:", error)
      return NextResponse.json({ error: "Failed to create recipe" }, { status: 500 })
    }

    return NextResponse.json({ data: recipe }, { status: 201 })
  } catch (error) {
    console.error("Error creating recipe:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}