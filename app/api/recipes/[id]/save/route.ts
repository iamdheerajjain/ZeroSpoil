import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if recipe exists and is accessible
    const { data: recipe, error: recipeError } = await supabase
      .from("recipes")
      .select("id")
      .eq("id", params.id)
      .or(`is_public.eq.true,user_id.eq.${user.id}`)
      .single()

    if (recipeError || !recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 })
    }

    // Save the recipe
    const { data: savedRecipe, error } = await supabase
      .from("user_saved_recipes")
      .insert({
        user_id: user.id,
        recipe_id: params.id
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return NextResponse.json({ error: "Recipe already saved" }, { status: 409 })
      }
      console.error("Error saving recipe:", error)
      return NextResponse.json({ error: "Failed to save recipe" }, { status: 500 })
    }

    return NextResponse.json({ data: savedRecipe }, { status: 201 })
  } catch (error) {
    console.error("Error saving recipe:", error)
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
      .from("user_saved_recipes")
      .delete()
      .eq("user_id", user.id)
      .eq("recipe_id", params.id)

    if (error) {
      console.error("Error unsaving recipe:", error)
      return NextResponse.json({ error: "Failed to unsave recipe" }, { status: 500 })
    }

    return NextResponse.json({ message: "Recipe unsaved successfully" })
  } catch (error) {
    console.error("Error unsaving recipe:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}