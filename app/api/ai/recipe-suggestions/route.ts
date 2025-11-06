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

    // Check if this is a test request (no auth required for testing)
    const body = await request.json();
    const isTestRequest = body.test_mode === true;
    
    if ((authError || !user) && !isTestRequest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      ingredients,
      dietary_restrictions = [],
      cuisine_preference,
      max_results = 5,
      cooking_time,
      difficulty,
      meal_type,
      health_goals = [],
      allergies = [],
      cooking_skill = "medium",
      budget_conscious = false,
    } = body;

    // Validate ingredients
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return NextResponse.json(
        { error: "No ingredients provided" },
        { status: 400 }
      );
    }

    console.log(
      "Generating AI recipe suggestions for ingredients:",
      ingredients
    );

    // Validate max_results
    const validatedMaxResults = Math.min(Math.max(1, max_results), 10);
    
    // Check if Gemini API key is available
    if (!process.env.GEMINI_API_KEY) {
      console.warn(
        "GEMINI_API_KEY not found, falling back to basic suggestions"
      );
      const basicSuggestions = generateBasicRecipeSuggestions(
        ingredients,
        dietary_restrictions,
        validatedMaxResults
      );
      return NextResponse.json({
        data: basicSuggestions,
        message: "Gemini API not configured. Using basic recipe suggestions.",
        fallback: true,
      });
    }

    // Get the Gemini service instance
    const geminiService = getGeminiService();
    if (!geminiService) {
      console.warn(
        "Gemini service not available - likely missing API key or initialization failed"
      );
      const basicSuggestions = generateBasicRecipeSuggestions(
        ingredients,
        dietary_restrictions,
        validatedMaxResults
      );
      return NextResponse.json({
        data: basicSuggestions,
        message:
          "Gemini service not available. Using basic recipe suggestions.",
        fallback: true,
      });
    }

    try {
      console.log("Generating recipe suggestions using Gemini service...");
      console.log("Request details:", {
        ingredients,
        dietary_restrictions,
        cuisine_preference,
        max_results: validatedMaxResults,
        cooking_time,
        difficulty,
      });

      // Use the Gemini service for better error handling and formatting
      let aiRecipes;
      try {
        aiRecipes = await geminiService.generateRecipeSuggestions(ingredients, {
          dietary_restrictions,
          cuisine_preference,
          max_results: validatedMaxResults,
          cooking_time,
          difficulty,
          meal_type,
          health_goals,
          allergies,
        });
      } catch (serviceError) {
        console.error(
          "Error calling geminiService.generateRecipeSuggestions:",
          serviceError
        );
        throw serviceError;
      }

      // Ensure we have an array of recipes and respect the max_results parameter
      let recipeArray: any[] = [];
      
      // Handle different response formats from AI
      if (Array.isArray(aiRecipes)) {
        recipeArray = aiRecipes;
      } else if (aiRecipes && typeof aiRecipes === 'object' && 'recipes' in aiRecipes) {
        // Handle case where AI returns { recipes: [...] } format
        recipeArray = Array.isArray(aiRecipes.recipes) ? aiRecipes.recipes : [aiRecipes.recipes];
      } else if (aiRecipes) {
        // Handle single recipe object
        recipeArray = [aiRecipes];
      }
      
      // Limit to requested number of results
      if (recipeArray.length > validatedMaxResults) {
        recipeArray = recipeArray.slice(0, validatedMaxResults);
      }
      
      console.log("Successfully generated", recipeArray.length, "AI recipes");
      console.log("Recipe data sample:", recipeArray.slice(0, 2));

      // Return the recipes
      return NextResponse.json({
        data: recipeArray,
        total_matches: recipeArray.length,
        ai_generated: recipeArray.length,
        message: `Generated ${recipeArray.length} AI-powered recipes using Gemini!`,
        ingredients_used: ingredients,
      });
    } catch (aiError) {
      console.error("AI recipe generation failed:", aiError);

      // Fall back to basic suggestions if AI fails
      console.log("Falling back to basic recipe suggestions...");
      const basicSuggestions = generateBasicRecipeSuggestions(
        ingredients,
        dietary_restrictions,
        validatedMaxResults
      );
      console.log("Generated", basicSuggestions.length, "basic recipe suggestions for fallback");

      return NextResponse.json({
        data: basicSuggestions,
        message:
          "AI temporarily unavailable. Here are some basic recipe suggestions.",
        fallback: true,
        error_details:
          aiError instanceof Error ? aiError.message : "Unknown AI error",
      });
    }
  } catch (error) {
    console.error("Error in recipe suggestions endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function generateBasicRecipeSuggestions(
  ingredients: string[],
  dietaryRestrictions: string[],
  maxResults: number = 6
) {
  const suggestions: any[] = [];
  const ingredientList = ingredients.map((ing: string) => ing.toLowerCase());
  const timestamp = Date.now();
  const uniqueId = Math.random().toString(36).substring(7);

  // Basic recipe templates based on common ingredients
  
  // Protein stir-fry template
  if (
    ingredientList.some((ing: string) =>
      ["chicken", "beef", "pork", "fish", "salmon", "shrimp"].some((meat: string) => ing.includes(meat))
    )
  ) {
    suggestions.push({
      id: `basic-protein-stir-fry-${timestamp}-${uniqueId}`,
      title: `${ingredients[0]} Protein Stir-Fry`,
      description: `A quick and easy stir-fry featuring ${ingredients.join(
        ", "
      )} with your available protein and vegetables`,
      ingredients: ingredients
        .slice(0, 5)
        .map((ing) => ({ name: ing, quantity: 1, unit: "portion" })),
      instructions: [
        "Heat oil in a large pan or wok over medium-high heat",
        `Cook ${
          ingredients.find((ing) =>
            ["chicken", "beef", "pork", "fish", "salmon", "shrimp"].some((meat) =>
              ing.toLowerCase().includes(meat)
            )
          ) || "protein"
        } until done`,
        `Add ${ingredients
          .filter(
            (ing) =>
              !["chicken", "beef", "pork", "fish", "salmon", "shrimp"].some((meat) =>
                ing.toLowerCase().includes(meat)
              )
          )
          .slice(0, 3)
          .join(", ")} and stir-fry until tender`,
        "Season with salt, pepper, and your favorite sauce",
        "Serve hot over rice or noodles",
      ],
      prep_time: 10,
      cook_time: 15,
      servings: 2,
      difficulty: "easy",
      dietary_tags: dietaryRestrictions,
      match_score: ingredients.length,
      match_percentage: Math.min(100, Math.floor((ingredients.length / 5) * 100)),
      saved: false,
      generated: true,
    });
  }

  // Grain bowl template
  if (
    ingredientList.some((ing: string) =>
      ["rice", "pasta", "noodles", "quinoa", "bread"].some((grain: string) => ing.includes(grain))
    )
  ) {
    suggestions.push({
      id: `basic-grain-bowl-${timestamp}-${uniqueId}-2`,
      title: `${
        ingredients.find((ing) =>
          ["rice", "pasta", "noodles", "quinoa", "bread"].some((grain) =>
            ing.toLowerCase().includes(grain)
          )
        ) || "Grain"
      } Power Bowl`,
      description: `A nutritious bowl combining ${ingredients.join(
        ", "
      )} with complementary flavors`,
      ingredients: ingredients
        .slice(0, 4)
        .map((ing) => ({ name: ing, quantity: 1, unit: "portion" })),
      instructions: [
        `Cook your ${
          ingredients.find((ing) =>
            ["rice", "pasta", "noodles", "quinoa", "bread"].some((grain) =>
              ing.toLowerCase().includes(grain)
            )
          ) || "grain"
        } according to package instructions`,
        `Prepare ${ingredients
          .filter(
            (ing) =>
              !["rice", "pasta", "noodles", "quinoa", "bread"].some((grain) =>
                ing.toLowerCase().includes(grain)
              )
          )
          .slice(0, 2)
          .join(" and ")}`,
        "Combine everything in a bowl",
        "Add your favorite dressing or sauce",
        "Garnish and enjoy your nutritious meal",
      ],
      prep_time: 5,
      cook_time: 20,
      servings: 1,
      difficulty: "easy",
      dietary_tags: dietaryRestrictions,
      match_score: ingredients.length,
      match_percentage: Math.min(100, Math.floor((ingredients.length / 4) * 100)),
      saved: false,
      generated: true,
    });
  }

  // Dairy-based scramble template
  if (
    ingredientList.some((ing: string) =>
      ["eggs", "cheese", "milk", "yogurt", "butter"].some((dairy: string) => ing.includes(dairy))
    )
  ) {
    suggestions.push({
      id: `basic-scramble-${timestamp}-${uniqueId}-3`,
      title: `${ingredients[0]} Scramble Delight`,
      description: `A protein-rich scramble featuring ${ingredients.join(
        ", "
      )} with fresh flavors`,
      ingredients: ingredients
        .slice(0, 4)
        .map((ing) => ({ name: ing, quantity: 1, unit: "portion" })),
      instructions: [
        "Beat eggs in a bowl with a splash of milk",
        "Heat pan with a little oil or butter over medium heat",
        `Add ${ingredients
          .filter(
            (ing) =>
              !["eggs", "milk"].some((dairy) =>
                ing.toLowerCase().includes(dairy)
              )
          )
          .slice(0, 2)
          .join(" and ")} and cook until soft`,
        "Pour in egg mixture and scramble gently",
        "Season with salt, pepper and fresh herbs, then serve hot",
      ],
      prep_time: 5,
      cook_time: 10,
      servings: 1,
      difficulty: "easy",
      dietary_tags: dietaryRestrictions,
      match_score: ingredients.length,
      match_percentage: Math.min(100, Math.floor((ingredients.length / 4) * 100)),
      saved: false,
      generated: true,
    });
  }

  // Salad template
  if (
    ingredientList.some((ing: string) =>
      ["lettuce", "spinach", "kale", "tomato", "cucumber", "carrot"].some((veg: string) => ing.includes(veg))
    )
  ) {
    suggestions.push({
      id: `basic-salad-${timestamp}-${uniqueId}-4`,
      title: `${ingredients[0]} Fresh Salad`,
      description: `A refreshing salad combining ${ingredients.join(
        ", "
      )} with complementary textures`,
      ingredients: ingredients
        .slice(0, 5)
        .map((ing) => ({ name: ing, quantity: 1, unit: "portion" })),
      instructions: [
        `Wash and prepare ${ingredients
          .filter(
            (ing) =>
              ["lettuce", "spinach", "kale", "tomato", "cucumber", "carrot"].some((veg) =>
                ing.toLowerCase().includes(veg)
              )
          )
          .slice(0, 3)
          .join(", ")}`,
        `Add ${ingredients
          .filter(
            (ing) =>
              !["lettuce", "spinach", "kale", "tomato", "cucumber", "carrot"].some((veg) =>
                ing.toLowerCase().includes(veg)
              )
          )
          .slice(0, 2)
          .join(" and ")} as toppings`,
        "Toss everything together in a large bowl",
        "Add your favorite dressing and seasonings",
        "Serve immediately for best freshness",
      ],
      prep_time: 10,
      cook_time: 0,
      servings: 2,
      difficulty: "easy",
      dietary_tags: dietaryRestrictions,
      match_score: ingredients.length,
      match_percentage: Math.min(100, Math.floor((ingredients.length / 5) * 100)),
      saved: false,
      generated: true,
    });
  }

  // Soup template
  if (ingredients.length >= 3) {
    suggestions.push({
      id: `basic-soup-${timestamp}-${uniqueId}-5`,
      title: "Hearty Ingredient Soup",
      description: `A warming soup made with ${ingredients.slice(0, 3).join(
        ", "
      )} and other available ingredients`,
      ingredients: ingredients
        .slice(0, 6)
        .map((ing) => ({ name: ing, quantity: 1, unit: "portion" })),
      instructions: [
        "Add ingredients to a large pot with enough water or broth to cover",
        "Bring to a boil, then reduce heat and simmer",
        `Cook for 20-30 minutes until ${
          ingredients.find((ing) =>
            ["chicken", "beef", "pork", "rice", "pasta", "potato"].some((starchy) =>
              ing.toLowerCase().includes(starchy)
            )
          ) || "main ingredients"
        } are tender`,
        "Season with salt, pepper, and your favorite herbs",
        "Serve hot with bread or on its own",
      ],
      prep_time: 10,
      cook_time: 30,
      servings: 4,
      difficulty: "easy",
      dietary_tags: dietaryRestrictions,
      match_score: ingredients.length,
      match_percentage: Math.min(100, Math.floor((ingredients.length / 6) * 100)),
      saved: false,
      generated: true,
    });
  }

  // Frittata template
  if (ingredientList.some(ing => ing.includes("eggs")) && ingredients.length >= 3) {
    suggestions.push({
      id: `basic-frittata-${timestamp}-${uniqueId}-6`,
      title: "Custom Ingredient Frittata",
      description: `A delicious frittata combining eggs with ${ingredients.filter(ing => !ing.toLowerCase().includes("eggs")).slice(0, 3).join(
        ", "
      )}`,
      ingredients: ingredients
        .slice(0, 5)
        .map((ing) => ({ name: ing, quantity: 1, unit: "portion" })),
      instructions: [
        "Preheat oven to 375°F (190°C)",
        "Whisk eggs in a bowl with a splash of milk or cream",
        `Chop ${ingredients
          .filter(
            (ing) => !ing.toLowerCase().includes("eggs")
          )
          .slice(0, 3)
          .join(", ")} into bite-sized pieces`,
        "Heat an oven-safe skillet over medium heat and add a little oil or butter",
        "Pour in egg mixture and cook for 2-3 minutes until edges set",
        `Add ${ingredients
          .filter(
            (ing) => !ing.toLowerCase().includes("eggs")
          )
          .slice(0, 3)
          .join(", ")} on top of the eggs`,
        "Transfer to oven and bake for 10-12 minutes until fully set",
        "Let cool slightly before slicing and serving",
      ],
      prep_time: 15,
      cook_time: 15,
      servings: 4,
      difficulty: "medium",
      dietary_tags: dietaryRestrictions,
      match_score: ingredients.length,
      match_percentage: Math.min(100, Math.floor((ingredients.length / 5) * 100)),
      saved: false,
      generated: true,
    });
  }

  // Generic template to ensure we have enough recipes
  let genericCount = 1;
  while (suggestions.length < maxResults && genericCount <= 3) {
    suggestions.push({
      id: `generic-recipe-${timestamp}-${uniqueId}-${genericCount}`,
      title: `Delicious ${ingredients[0]} Dish Variation ${genericCount}`,
      description: `A creative way to use ${ingredients.join(", ")} in a delicious meal`,
      ingredients: ingredients
        .slice(0, Math.min(5, ingredients.length))
        .map((ing) => ({ name: ing, quantity: 1, unit: "portion" })),
      instructions: [
        `Prepare all ${ingredients.length} ingredients by washing and chopping as needed`,
        "Combine ingredients in a suitable cooking vessel",
        "Cook according to your preferred method",
        "Season to taste with salt, pepper, and your favorite herbs",
        "Serve hot and enjoy your nutritious meal!"
      ],
      prep_time: 10 + (genericCount * 5),
      cook_time: 15 + (genericCount * 5),
      servings: 2 + (genericCount % 3),
      difficulty: genericCount <= 1 ? "easy" : genericCount <= 2 ? "medium" : "hard",
      dietary_tags: dietaryRestrictions,
      match_score: ingredients.length,
      match_percentage: Math.min(100, Math.floor((ingredients.length / ingredients.length) * 100)),
      saved: false,
      generated: true,
    });
    genericCount++;
  }

  console.log("Generated", suggestions.length, "basic recipe suggestions");
  // Return the requested number of suggestions
  const result = suggestions.slice(0, maxResults);
  console.log("Returning", result.length, "recipes after limiting to maxResults");
  return result;
}
