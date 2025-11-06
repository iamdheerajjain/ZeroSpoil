import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getGeminiService } from "@/lib/services/gemini-service";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      recipe_title,
      basic_ingredients,
      basic_instructions,
      cuisine_type,
      difficulty,
      servings,
    } = body;

    // Get the Gemini service
    const geminiService = getGeminiService();
    if (!geminiService) {
      return NextResponse.json(
        {
          error: "AI service not available",
        },
        { status: 503 }
      );
    }

    // Build the detailed recipe prompt
    const prompt = buildDetailedRecipePrompt({
      title: recipe_title,
      ingredients: basic_ingredients || [],
      instructions: basic_instructions || [],
      cuisine_type,
      difficulty,
      servings,
    });

    // Generate detailed recipe information using Gemini
    const model = await geminiService["getAvailableModel"]("recipe");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response
    const detailedRecipe = parseDetailedRecipeResponse(text);

    return NextResponse.json({
      data: {
        id: params.id,
        ...detailedRecipe,
      },
    });
  } catch (error) {
    console.error("Error generating detailed recipe:", error);
    return NextResponse.json(
      {
        error: "Failed to generate detailed recipe information",
      },
      { status: 500 }
    );
  }
}

function buildDetailedRecipePrompt(recipe: {
  title: string;
  ingredients: any[];
  instructions: string[];
  cuisine_type?: string;
  difficulty?: string;
  servings?: number;
}) {
  return `You are a world-class chef and cookbook author. I need you to expand this basic recipe into a comprehensive, detailed guide that would help someone create an amazing dish.

BASIC RECIPE:
Title: ${recipe.title}
Cuisine: ${recipe.cuisine_type || "International"}
Difficulty: ${recipe.difficulty || "Medium"}
Servings: ${recipe.servings || 4}

BASIC INGREDIENTS:
${
  recipe.ingredients
    .map((ing) => `- ${ing.quantity} ${ing.unit} ${ing.name}`)
    .join("\n") || "No ingredients provided"
}

BASIC INSTRUCTIONS:
${
  recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join("\n") ||
  "No instructions provided"
}

TASK: Enhance this recipe with professional chef-level detail. Provide:

1. **Enhanced Description**: A compelling 2-3 sentence description that highlights flavors, textures, and appeal
2. **Detailed Ingredients**: Expand each ingredient with:
   - Precise quantities and measurements
   - Preparation notes (diced, minced, room temperature, etc.)
   - Quality tips (what to look for when buying)
   - Substitution suggestions
   - Category grouping (proteins, vegetables, seasonings, etc.)

3. **Step-by-Step Instructions**: Transform basic steps into detailed professional instructions with:
   - Specific cooking techniques and temperatures
   - Timing for each step
   - Visual and sensory cues (color changes, textures, aromas)
   - Professional tips for technique
   - Troubleshooting advice

4. **Professional Enhancements**:
   - Chef tips and techniques
   - Equipment recommendations
   - Nutritional highlights
   - Recipe variations and substitutions
   - Storage and reheating instructions
   - Wine/beverage pairing suggestions
   - Estimated calories per serving

RESPONSE FORMAT (JSON):
{
  "title": "${recipe.title}",
  "description": "Enhanced, compelling description",
  "detailed_ingredients": [
    {
      "name": "ingredient name",
      "quantity": 2,
      "unit": "cups",
      "notes": "preparation and quality notes",
      "category": "protein/vegetable/seasoning/etc"
    }
  ],
  "detailed_instructions": [
    {
      "step": 1,
      "instruction": "Detailed step with technique and visual cues",
      "technique": "specific cooking technique used",
      "time_estimate": 5,
      "tips": "professional tip for this step"
    }
  ],
  "chef_tips": [
    "Professional cooking tip 1",
    "Professional cooking tip 2"
  ],
  "variations": [
    "Recipe variation or substitution idea",
    "Another variation idea"
  ],
  "nutritional_highlights": [
    "High protein",
    "Rich in vitamin C",
    "Good source of fiber"
  ],
  "equipment_needed": [
    "large skillet",
    "sharp knife",
    "cutting board"
  ],
  "skill_techniques": [
    "sautéing",
    "knife skills",
    "seasoning"
  ],
  "storage_notes": "How to store leftovers and for how long",
  "wine_pairing": "Wine or beverage pairing suggestion",
  "estimated_calories_per_serving": 350
}

Make this recipe truly exceptional with professional-level detail and expertise!`;
}

function parseDetailedRecipeResponse(text: string) {
  try {
    // Clean up the response text
    const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
    const parsed = JSON.parse(cleanText);

    // Validate and provide defaults
    return {
      title: parsed.title || "Enhanced Recipe",
      description:
        parsed.description ||
        "A delicious enhanced recipe with detailed instructions",
      detailed_ingredients: parsed.detailed_ingredients || [],
      detailed_instructions: parsed.detailed_instructions || [],
      chef_tips: parsed.chef_tips || [],
      variations: parsed.variations || [],
      nutritional_highlights: parsed.nutritional_highlights || [],
      equipment_needed: parsed.equipment_needed || [],
      skill_techniques: parsed.skill_techniques || [],
      storage_notes:
        parsed.storage_notes || "Store in refrigerator for up to 3 days",
      wine_pairing: parsed.wine_pairing || "",
      estimated_calories_per_serving:
        parsed.estimated_calories_per_serving || 350,
    };
  } catch (error) {
    console.error("Error parsing detailed recipe response:", error);

    // Fallback response
    return {
      title: "Enhanced Recipe",
      description:
        "A detailed recipe enhanced with professional techniques and tips",
      detailed_ingredients: [],
      detailed_instructions: [],
      chef_tips: [
        "Use fresh, high-quality ingredients for best results",
        "Taste and adjust seasoning throughout cooking process",
      ],
      variations: [],
      nutritional_highlights: [],
      equipment_needed: [],
      skill_techniques: [],
      storage_notes: "Store leftovers properly in refrigerator",
      wine_pairing: "",
      estimated_calories_per_serving: 350,
    };
  }
}
