import { createClient } from "@/lib/supabase/client";
import { Recipe } from "@/types";

export class RecipeService {
  private supabase = createClient();

  async getRecipes(filters?: {
    cuisine_type?: string;
    dietary_tags?: string;
    difficulty?: string;
    saved_only?: boolean;
  }) {
    try {
      const response = await fetch(
        `/api/recipes?${new URLSearchParams({
          ...(filters?.cuisine_type && { cuisine_type: filters.cuisine_type }),
          ...(filters?.dietary_tags && { dietary_tags: filters.dietary_tags }),
          ...(filters?.difficulty && { difficulty: filters.difficulty }),
          ...(filters?.saved_only && {
            saved_only: filters.saved_only.toString(),
          }),
        })}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch recipes");
      }

      const result = await response.json();
      return result.data as Recipe[];
    } catch (error) {
      console.error("Error fetching recipes:", error);
      throw error;
    }
  }

  async getRecipe(id: string) {
    try {
      const response = await fetch(`/api/recipes/${id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch recipe");
      }

      const result = await response.json();
      return result.data as Recipe;
    } catch (error) {
      console.error("Error fetching recipe:", error);
      throw error;
    }
  }

  async createRecipe(
    recipe: Omit<Recipe, "id" | "user_id" | "created_at" | "saved">
  ) {
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(recipe),
      });

      if (!response.ok) {
        throw new Error("Failed to create recipe");
      }

      const result = await response.json();
      return result.data as Recipe;
    } catch (error) {
      console.error("Error creating recipe:", error);
      throw error;
    }
  }

  async updateRecipe(id: string, updates: Partial<Recipe>) {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Failed to update recipe");
      }

      const result = await response.json();
      return result.data as Recipe;
    } catch (error) {
      console.error("Error updating recipe:", error);
      throw error;
    }
  }

  async deleteRecipe(id: string) {
    try {
      const response = await fetch(`/api/recipes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete recipe");
      }
    } catch (error) {
      console.error("Error deleting recipe:", error);
      throw error;
    }
  }

  async saveRecipe(id: string) {
    try {
      const response = await fetch(`/api/recipes/${id}/save`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to save recipe");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error saving recipe:", error);
      throw error;
    }
  }

  async unsaveRecipe(id: string) {
    try {
      const response = await fetch(`/api/recipes/${id}/save`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to unsave recipe");
      }
    } catch (error) {
      console.error("Error unsaving recipe:", error);
      throw error;
    }
  }

  async getRecipeSuggestions(
    ingredients: string[],
    options?: {
      dietary_restrictions?: string[];
      cuisine_preference?: string;
      max_results?: number;
      cooking_time?: string;
      difficulty?: string;
      meal_type?: string;
      health_goals?: string[];
      allergies?: string[];
    }
  ) {
    try {
      const response = await fetch("/api/ai/recipe-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients,
          dietary_restrictions: options?.dietary_restrictions || [],
          cuisine_preference: options?.cuisine_preference,
          max_results: options?.max_results || 5,
          cooking_time: options?.cooking_time,
          difficulty: options?.difficulty,
          meal_type: options?.meal_type,
          health_goals: options?.health_goals || [],
          allergies: options?.allergies || [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get recipe suggestions");
      }

      const result = await response.json();
      console.log('Recipe service received:', result.data?.length, 'recipes');
      return result.data as Recipe[];
    } catch (error) {
      console.error("Error getting recipe suggestions:", error);
      throw error;
    }
  }
}
