import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiService } from "@/lib/services/gemini-service";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      available_ingredients = [],
      dietary_restrictions = [],
      days = 3,
      meals_per_day = 3,
      include_expiring_items = true,
      budget_conscious = false,
      cooking_skill = "medium",
      time_constraints = "moderate",
      health_goals = [],
      family_size = 2,
      leftover_preference = true,
    } = body;

    if (available_ingredients.length === 0) {
      return NextResponse.json(
        { error: "No ingredients provided" },
        { status: 400 }
      );
    }

    console.log(
      "Generating AI meal plan for ingredients:",
      available_ingredients
    );

    // Get the Gemini service instance
    const geminiService = getGeminiService();
    if (!geminiService) {
      console.error("Gemini service not available");
      const fallbackPlan = generateFallbackMealPlan(
        available_ingredients,
        days,
        meals_per_day
      );
      return NextResponse.json({
        data: fallbackPlan,
        message: "Gemini service not available. Here's a basic meal plan.",
        fallback: true,
      });
    }

    try {
      // If requested, prioritize expiring items
      let prioritizedIngredients = available_ingredients;

      if (include_expiring_items) {
        try {
          // Get user's food items that are expiring soon
          const { data: foodItems } = await supabase
            .from("food_items")
            .select("name, expiration_date, status")
            .eq("user_id", user.id)
            .in("status", ["expiring_soon", "fresh"])
            .order("expiration_date", { ascending: true });

          if (foodItems && foodItems.length > 0) {
            const expiringItems = foodItems
              .filter((item: any) => item.expiration_date)
              .map((item: any) => item.name);

            // Put expiring items first
            prioritizedIngredients = [
              ...expiringItems,
              ...available_ingredients.filter(
                (ing: string) => !expiringItems.includes(ing)
              ),
            ];
          }
        } catch (dbError) {
          console.error("Error fetching expiring items:", dbError);
          // Continue with original ingredients if database fails
        }
      }

      // Generate AI-powered meal plan
      let mealPlan;
      try {
        mealPlan = await geminiService.generateMealPlan(
          prioritizedIngredients,
          {
            dietary_restrictions,
            days,
            meals_per_day,
            budget_conscious,
            cooking_skill,
            time_constraints,
            health_goals,
            family_size,
            leftover_preference,
          }
        );
      } catch (serviceError) {
        console.error(
          "Error calling geminiService.generateMealPlan:",
          serviceError
        );
        throw serviceError;
      }

      console.log("Generated AI meal plan successfully");

      return NextResponse.json({
        data: mealPlan,
        message: `Generated ${days}-day meal plan with ${prioritizedIngredients.length} available ingredients`,
      });
    } catch (aiError) {
      console.error("AI meal plan generation failed:", aiError);

      // Fallback meal plan
      const fallbackPlan = generateFallbackMealPlan(
        available_ingredients,
        days,
        meals_per_day
      );

      return NextResponse.json({
        data: fallbackPlan,
        message: "AI temporarily unavailable. Here's a basic meal plan.",
        fallback: true,
      });
    }
  } catch (error) {
    console.error("Error in meal plan endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateFallbackMealPlan(
  ingredients: string[],
  days: number,
  mealsPerDay: number
) {
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
  const plan = [];

  for (let day = 1; day <= days; day++) {
    const dayMeals: any = {};

    for (let mealIndex = 0; mealIndex < mealsPerDay; mealIndex++) {
      const mealType = mealTypes[mealIndex] || "snack";
      const usedIngredients = ingredients.slice(
        0,
        Math.min(3, ingredients.length)
      );

      dayMeals[mealType] = {
        name: `${
          mealType.charAt(0).toUpperCase() + mealType.slice(1)
        } with ${usedIngredients.join(", ")}`,
        ingredients_used: usedIngredients,
      };
    }

    plan.push({
      day,
      meals: dayMeals,
    });
  }

  return {
    meal_plan: plan,
    shopping_list: ["Check your pantry for additional seasonings and basics"],
    tips: [
      "Use ingredients that expire soonest first",
      "Prep ingredients in advance to save time",
      "Store leftovers properly for next day meals",
    ],
  };
}
