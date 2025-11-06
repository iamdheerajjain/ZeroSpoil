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

    const { data: recipe, error } = await supabase
      .from("recipes")
      .select(`
        *,
        user_saved_recipes(saved_at)
      `)
      .eq("id", params.id)
      .or(`is_public.eq.true,user_id.eq.${user.id}`)
      .single()

    if (error) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    // Check if user has saved this recipe
    const { data: savedRecipe } = await supabase
      .from("user_saved_recipes")
      .select("id")
      .eq("user_id", user.id)
      .eq("recipe_id", params.id)
      .single()

    const recipeWithSavedStatus = {
      ...recipe,
      saved: !!savedRecipe
    }

    return NextResponse.json({ data: recipeWithSavedStatus })
  } catch (error) {
    console.error("Error fetching recipe:", error)
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

    const { data: recipe, error } = await supabase
      .from("recipes")
      .update({
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
        is_public,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating recipe:", error)
      return NextResponse.json({ error: "Failed to update recipe" }, { status: 500 })
    }

    return NextResponse.json({ data: recipe })
  } catch (error) {
    console.error("Error updating recipe:", error)
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
      .from("recipes")
      .delete()
      .eq("id", params.id)
      .eq("user_id", user.id)

    if (error) {
      console.error("Error deleting recipe:", error)
      return NextResponse.json({ error: "Failed to delete recipe" }, { status: 500 })
    }

    return NextResponse.json({ message: "Recipe deleted successfully" })
  } catch (error) {
    console.error("Error deleting recipe:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}