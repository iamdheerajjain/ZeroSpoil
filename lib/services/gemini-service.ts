import { GoogleGenerativeAI } from "@google/generative-ai";

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private flashModel: any; // For faster responses
  private recipeModel: any; // Optimized for recipe generation

  constructor() {
    console.log("Initializing GeminiService...");
    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not configured");
      throw new Error("GEMINI_API_KEY is not configured");
    }

    console.log("GEMINI_API_KEY found, initializing GoogleGenerativeAI...");
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Use Gemini 2.0 Flash for faster responses
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });

    // Backup model for when 2.0 Flash is not available
    this.flashModel = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.8,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });

    // Recipe-optimized model configuration
    this.recipeModel = this.genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      generationConfig: {
        temperature: 0.9, // Higher creativity for recipes
        topP: 0.95,
        topK: 50,
        maxOutputTokens: 6144,
      },
    });

    console.log(
      "GeminiService initialized successfully with multiple model configurations"
    );
  }

  async generateRecipeSuggestions(
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
      console.log(
        "Generating enhanced recipe suggestions for ingredients:",
        ingredients
      );
      console.log("Options:", options);

      // Use recipe-optimized model for better creativity
      const model = await this.getAvailableModel("recipe");
      const prompt = this.buildEnhancedRecipePrompt(ingredients, options);
      console.log(
        "Generated enhanced prompt:",
        prompt.substring(0, 200) + "..."
      );

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log("Gemini response received, length:", text.length);

      const parsed = this.parseEnhancedRecipeResponse(text);
      console.log("Parsed recipes:", parsed.length, "recipes generated");
      return parsed;
    } catch (error) {
      console.error("Error generating recipe suggestions:", error);

      // Try fallback with standard model
      try {
        console.log("Attempting fallback with standard model...");
        const fallbackModel = await this.getAvailableModel("standard");
        const simplePrompt = this.buildRecipePrompt(ingredients, options);
        const result = await fallbackModel.generateContent(simplePrompt);
        const response = await result.response;
        const text = response.text();
        return this.parseRecipeResponse(text);
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error(
          "Failed to generate recipe suggestions with both primary and fallback models"
        );
      }
    }
  }

  async generateFoodStorageTips(foodName: string, storageLocation: string) {
    try {
      const prompt = `As a food storage expert, provide 3-4 practical tips for storing ${foodName} in ${storageLocation}. 
      Focus on:
      - Optimal storage conditions
      - How to extend freshness
      - Signs of spoilage to watch for
      - Best practices for this specific food

      Format as a JSON array of strings, each tip being one string.
      Example: ["Tip 1", "Tip 2", "Tip 3"]`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text.replace(/```json\n?|\n?```/g, ""));
      } catch {
        // Fallback if JSON parsing fails
        return text
          .split("\n")
          .filter((line: string) => line.trim())
          .slice(0, 4);
      }
    } catch (error) {
      console.error("Error generating storage tips:", error);
      return [
        "Store in a cool, dry place away from direct sunlight",
        "Check regularly for signs of spoilage",
        "Use proper containers to maintain freshness",
        "Follow first-in, first-out principle",
      ];
    }
  }

  async generateMealPlan(
    availableIngredients: string[],
    preferences?: {
      dietary_restrictions?: string[];
      meals_per_day?: number;
      days?: number;
      budget_conscious?: boolean;
      cooking_skill?: string;
      time_constraints?: string;
      health_goals?: string[];
      family_size?: number;
      leftover_preference?: boolean;
    }
  ) {
    try {
      console.log(
        "Generating enhanced meal plan for ingredients:",
        availableIngredients
      );
      console.log("Preferences:", preferences);

      const model = await this.getAvailableModel("standard");
      const prompt = this.buildEnhancedMealPlanPrompt(
        availableIngredients,
        preferences
      );
      console.log(
        "Generated enhanced meal plan prompt:",
        prompt.substring(0, 300) + "..."
      );

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log("Gemini meal plan response received, length:", text.length);

      try {
        const parsed = this.parseEnhancedMealPlanResponse(text);
        console.log("Parsed enhanced meal plan successfully");
        return parsed;
      } catch (parseError) {
        console.error("Failed to parse meal plan response:", parseError);

        // Try simpler parsing
        try {
          const simpleParsed = JSON.parse(
            text.replace(/```json\n?|\n?```/g, "")
          );
          return this.validateMealPlanStructure(simpleParsed);
        } catch (simpleParseError) {
          console.error("Simple parsing also failed:", simpleParseError);
          throw new Error("Failed to parse meal plan response");
        }
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      throw new Error("Failed to generate meal plan");
    }
  }

  async improveExpirationPrediction(
    foodName: string,
    category: string,
    storageLocation: string,
    purchaseDate: string,
    currentCondition?: string
  ) {
    try {
      const prompt = `As a food science expert, predict the expiration date for ${foodName} (category: ${category}) stored in ${storageLocation}.

      Details:
      - Purchase date: ${purchaseDate}
      - Current condition: ${currentCondition || "good"}
      - Storage location: ${storageLocation}

      Consider factors like:
      - Food type and category
      - Storage conditions
      - Typical shelf life
      - Environmental factors

      Respond with JSON:
      {
        "predicted_expiration_date": "YYYY-MM-DD",
        "confidence": 0.85,
        "factors_considered": ["factor1", "factor2"],
        "storage_tips": ["tip1", "tip2"],
        "signs_of_spoilage": ["sign1", "sign2"]
      }`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text.replace(/```json\n?|\n?```/g, ""));
      } catch {
        // Fallback to original prediction logic
        throw new Error("Failed to parse AI prediction");
      }
    } catch (error) {
      console.error("Error with AI expiration prediction:", error);
      throw error;
    }
  }

  // Model availability and selection
  private async getAvailableModel(
    type: "recipe" | "standard" | "fast" = "standard"
  ) {
    try {
      switch (type) {
        case "recipe":
          return this.recipeModel;
        case "fast":
          return this.flashModel;
        default:
          return this.model;
      }
    } catch (error) {
      console.warn(
        `Failed to get ${type} model, falling back to default:`,
        error
      );
      return this.flashModel; // Fallback to the most reliable model
    }
  }

  // Enhanced recipe prompt builder
  private buildEnhancedRecipePrompt(
    ingredients: string[],
    options?: any
  ): string {
    const timestamp = Date.now();
    const uniqueSession = Math.random().toString(36).substring(7);
    const maxResults = options?.max_results || 5;

    const baseContext = `You are a world-class chef and nutritionist with expertise in international cuisines, dietary requirements, and food science. Your task is to create exceptional, creative, and practical recipes.`;

    const ingredientAnalysis = `
AVAILABLE INGREDIENTS: ${ingredients.join(", ")}

INGREDIENT ANALYSIS:
- Primary proteins: ${
      ingredients.filter((ing) => this.isProtein(ing)).join(", ") ||
      "None specified"
    }
- Vegetables & herbs: ${
      ingredients.filter((ing) => this.isVegetable(ing)).join(", ") ||
      "None specified"
    }
- Grains & starches: ${
      ingredients.filter((ing) => this.isGrain(ing)).join(", ") ||
      "None specified"
    }
- Dairy & eggs: ${
      ingredients.filter((ing) => this.isDairy(ing)).join(", ") ||
      "None specified"
    }
- Pantry staples: ${
      ingredients.filter((ing) => this.isPantryStaple(ing)).join(", ") ||
      "Basic seasonings assumed"
    }`;

    const requirements = `
RECIPE REQUIREMENTS:
- Generate EXACTLY ${maxResults} unique, creative recipes. This is a strict requirement - do not generate fewer than ${maxResults} recipes under any circumstances. Count your recipes before responding to ensure you have exactly ${maxResults}.
- Each recipe must use at least 70% of the provided ingredients
- Focus on maximum flavor development and nutritional balance
- Include diverse cooking methods (roasting, sautéing, grilling, etc.)
- Provide recipes for different meal occasions
${
  options?.dietary_restrictions?.length
    ? `- STRICT adherence to: ${options.dietary_restrictions.join(", ")}`
    : ""
}
${
  options?.allergies?.length
    ? `- ABSOLUTELY avoid these allergens: ${options.allergies.join(", ")}`
    : ""
}
${
  options?.cuisine_preference
    ? `- Prefer ${options.cuisine_preference} cuisine style and techniques`
    : ""
}
${options?.meal_type ? `- Focus on ${options.meal_type} recipes` : ""}
${options?.cooking_time ? `- Target cooking time: ${options.cooking_time}` : ""}
${options?.difficulty ? `- Difficulty level: ${options.difficulty}` : ""}
${
  options?.health_goals?.length
    ? `- Support these health goals: ${options.health_goals.join(", ")}`
    : ""
}`;

    const creativityGuidelines = `
CREATIVITY GUIDELINES:
- Think beyond obvious combinations - create unexpected flavor pairings
- Consider texture contrasts (crispy vs. creamy, etc.)
- Include modern cooking techniques and international fusion
- Add chef's tips for technique and flavor enhancement
- Suggest creative presentations and garnishes
- Consider seasonal and regional influences`;

    const nutritionalGuidance = `
NUTRITIONAL CONSIDERATIONS:
- Balance macronutrients (protein, carbs, healthy fats)
- Maximize vitamin and mineral content
- Consider digestive wellness and satiety
- Suggest healthy cooking methods and ingredient substitutions
- Include approximate calorie ranges per serving`;

    const responseFormat = `
RESPONSE FORMAT (JSON):
{
  "recipes": [
    {
      "id": "recipe_${timestamp}_N",
      "title": "Creative, appetizing recipe name",
      "description": "Engaging 2-3 sentence description highlighting key flavors and appeal",
      "cuisine_type": "Primary cuisine influence",
      "meal_type": "breakfast/lunch/dinner/snack/appetizer",
      "difficulty": "easy/medium/hard",
      "prep_time": 15,
      "cook_time": 30,
      "total_time": 45,
      "servings": 4,
      "ingredients": [
        {
          "name": "ingredient name",
          "quantity": 2,
          "unit": "cups/tbsp/pieces",
          "available": true,
          "notes": "preparation notes if needed"
        }
      ],
      "instructions": [
        "Detailed step 1 with technique tips",
        "Detailed step 2 with timing guidance",
        "Continue with clear, professional instructions"
      ],
      "nutritional_highlights": ["High protein", "Rich in fiber", "Good source of vitamin C"],
      "dietary_tags": ["vegetarian", "gluten-free", etc.],
      "chef_tips": [
        "Professional technique tip",
        "Flavor enhancement suggestion"
      ],
      "variations": [
        "Substitution suggestion",
        "Dietary modification"
      ],
      "estimated_calories_per_serving": 350,
      "match_percentage": 85,
      "missing_ingredients": ["optional ingredient"],
      "skill_techniques": ["sautéing", "knife skills"],
      "equipment_needed": ["large skillet", "chef's knife"],
      "storage_notes": "How to store leftovers",
      "wine_pairing": "Optional wine/beverage suggestion"
    }
  ],
  "ingredient_utilization": {
    "primary_used": ["most featured ingredients"],
    "secondary_used": ["supporting ingredients"],
    "unused": ["ingredients not used in any recipe"]
  },
  "cooking_tips": [
    "General tips for working with these ingredients",
    "Meal prep suggestions"
  ]
}`;

    return `${baseContext}

${ingredientAnalysis}

${requirements}

${creativityGuidelines}

${nutritionalGuidance}

${responseFormat}

SESSION ID: ${uniqueSession}
GENERATE UNIQUE CREATIVE RECIPES NOW:`;
  }

  // Enhanced meal plan prompt builder
  private buildEnhancedMealPlanPrompt(
    ingredients: string[],
    preferences?: any
  ): string {
    const days = preferences?.days || 3;
    const mealsPerDay = preferences?.meals_per_day || 3;
    const familySize = preferences?.family_size || 2;

    const context = `You are a professional meal planning nutritionist and chef specializing in creating balanced, practical, and delicious meal plans that minimize food waste while maximizing nutrition and flavor.`;

    const ingredientInventory = `
AVAILABLE INGREDIENTS INVENTORY:
${ingredients.map((ing, i) => `${i + 1}. ${ing}`).join("\n")}

INGREDIENT CATEGORIES:
- Proteins: ${
      ingredients.filter((ing) => this.isProtein(ing)).join(", ") ||
      "None - will need protein sources"
    }
- Vegetables: ${
      ingredients.filter((ing) => this.isVegetable(ing)).join(", ") ||
      "None - will prioritize vegetable shopping"
    }
- Grains/Starches: ${
      ingredients.filter((ing) => this.isGrain(ing)).join(", ") ||
      "None - will need carbohydrate sources"
    }
- Dairy/Eggs: ${
      ingredients.filter((ing) => this.isDairy(ing)).join(", ") ||
      "None - will consider dairy needs"
    }
- Pantry Items: ${
      ingredients.filter((ing) => this.isPantryStaple(ing)).join(", ") ||
      "Basic seasonings assumed"
    }`;

    const planRequirements = `
MEAL PLAN REQUIREMENTS:
- Duration: ${days} days
- Meals per day: ${mealsPerDay} (breakfast, lunch, dinner${
      mealsPerDay > 3 ? ", snacks" : ""
    })
- Serving size: ${familySize} people
- Prioritize using ingredients that expire soonest
- Minimize food waste through strategic ingredient reuse
- Balance nutrition across all meals
- Include variety in cooking methods and flavors
${
  preferences?.dietary_restrictions?.length
    ? `- STRICT dietary compliance: ${preferences.dietary_restrictions.join(
        ", "
      )}`
    : ""
}
${
  preferences?.health_goals?.length
    ? `- Support health goals: ${preferences.health_goals.join(", ")}`
    : ""
}
${
  preferences?.cooking_skill
    ? `- Cooking skill level: ${preferences.cooking_skill}`
    : ""
}
${
  preferences?.time_constraints
    ? `- Time constraints: ${preferences.time_constraints}`
    : ""
}
${preferences?.budget_conscious ? "- Budget-conscious options preferred" : ""}
${
  preferences?.leftover_preference
    ? "- Plan for strategic leftovers and meal prep"
    : ""
}`;

    const nutritionalGuidelines = `
NUTRITIONAL GUIDELINES:
- Each day should include: lean protein, whole grains, 5+ servings vegetables/fruits
- Balance macronutrients: 25-30% protein, 45-50% complex carbs, 20-25% healthy fats
- Include variety of colors and nutrients
- Consider anti-inflammatory foods and antioxidants
- Ensure adequate fiber (25-35g daily)
- Balance sodium and promote hydration`;

    const mealPlanningStrategy = `
MEAL PLANNING STRATEGY:
- Day 1: Use most perishable ingredients first
- Cross-utilize ingredients across multiple meals
- Plan prep-ahead components for busy days
- Include one-pot or sheet-pan meals for efficiency
- Consider breakfast prep and grab-and-go options
- Plan complementary flavors across the day
- Include comfort foods balanced with lighter options`;

    const responseFormat = `
RESPONSE FORMAT (JSON):
{
  "meal_plan": [
    {
      "day": 1,
      "theme": "Fresh & Vibrant",
      "daily_nutrition_focus": "High antioxidants, balanced macros",
      "prep_notes": "Prep time estimate and strategy",
      "meals": {
        "breakfast": {
          "name": "Descriptive meal name",
          "description": "Brief appetizing description",
          "ingredients_used": ["ingredient1", "ingredient2"],
          "prep_time": 10,
          "cook_time": 15,
          "calories_per_serving": 350,
          "key_nutrients": ["protein", "fiber", "vitamin C"],
          "cooking_method": "sautéing",
          "difficulty": "easy"
        },
        "lunch": {
          "name": "Meal name",
          "description": "Brief description",
          "ingredients_used": ["ingredient3", "ingredient4"],
          "prep_time": 15,
          "cook_time": 20,
          "calories_per_serving": 450,
          "key_nutrients": ["protein", "healthy fats"],
          "cooking_method": "roasting",
          "difficulty": "medium",
          "leftover_strategy": "Can be meal prepped"
        },
        "dinner": {
          "name": "Meal name",
          "description": "Brief description", 
          "ingredients_used": ["ingredient5", "ingredient6"],
          "prep_time": 20,
          "cook_time": 30,
          "calories_per_serving": 500,
          "key_nutrients": ["protein", "complex carbs"],
          "cooking_method": "one-pot",
          "difficulty": "medium"
        }
      },
      "daily_totals": {
        "estimated_calories": 1300,
        "preparation_time": 60,
        "key_nutrients_covered": ["protein", "fiber", "vitamins"]
      }
    }
  ],
  "ingredient_utilization": {
    "day_1": ["ingredients used day 1"],
    "day_2": ["ingredients used day 2"],
    "remaining": ["ingredients for later days"]
  },
  "shopping_list": {
    "essential": ["must-have items for plan completion"],
    "pantry_staples": ["basic items needed"],
    "optional_enhancements": ["items to elevate meals"]
  },
  "meal_prep_strategy": {
    "sunday_prep": ["Tasks to do ahead"],
    "daily_prep": ["Quick daily tasks"],
    "storage_tips": ["How to store prepped items"]
  },
  "nutritional_summary": {
    "daily_average_calories": 1400,
    "macronutrient_balance": "30% protein, 45% carbs, 25% fats",
    "key_nutrients_provided": ["complete list"],
    "dietary_compliance": "Meets all specified restrictions"
  },
  "chef_tips": [
    "Expert tips for meal execution",
    "Flavor enhancement suggestions",
    "Time-saving techniques"
  ],
  "leftover_transformation": [
    "How to repurpose day 1 dinner into day 2 lunch",
    "Creative leftover ideas"
  ]
}`;

    return `${context}

${ingredientInventory}

${planRequirements}

${nutritionalGuidelines}

${mealPlanningStrategy}

${responseFormat}

CREATE A COMPREHENSIVE MEAL PLAN NOW:`;
  }

  // Ingredient classification helpers
  private isProtein(ingredient: string): boolean {
    const proteins = [
      "chicken",
      "beef",
      "pork",
      "fish",
      "salmon",
      "tuna",
      "turkey",
      "lamb",
      "tofu",
      "tempeh",
      "beans",
      "lentils",
      "chickpeas",
      "eggs",
      "quinoa",
    ];
    return proteins.some((protein) =>
      ingredient.toLowerCase().includes(protein)
    );
  }

  private isVegetable(ingredient: string): boolean {
    const vegetables = [
      "broccoli",
      "spinach",
      "carrots",
      "bell pepper",
      "onion",
      "garlic",
      "tomato",
      "lettuce",
      "cucumber",
      "zucchini",
      "mushroom",
      "potato",
      "sweet potato",
      "kale",
      "cabbage",
      "celery",
      "herbs",
      "parsley",
      "cilantro",
      "basil",
    ];
    return vegetables.some((veg) => ingredient.toLowerCase().includes(veg));
  }

  private isGrain(ingredient: string): boolean {
    const grains = [
      "rice",
      "pasta",
      "bread",
      "flour",
      "oats",
      "quinoa",
      "barley",
      "wheat",
      "noodles",
      "couscous",
    ];
    return grains.some((grain) => ingredient.toLowerCase().includes(grain));
  }

  private isDairy(ingredient: string): boolean {
    const dairy = ["milk", "cheese", "yogurt", "butter", "cream", "eggs"];
    return dairy.some((d) => ingredient.toLowerCase().includes(d));
  }

  private isPantryStaple(ingredient: string): boolean {
    const staples = [
      "salt",
      "pepper",
      "oil",
      "vinegar",
      "soy sauce",
      "sugar",
      "honey",
      "spices",
      "herbs",
    ];
    return staples.some((staple) => ingredient.toLowerCase().includes(staple));
  }

  private buildRecipePrompt(ingredients: string[], options?: any): string {
    // Add timestamp and randomization to ensure unique responses
    const timestamp = Date.now();
    const uniqueSession = Math.random().toString(36).substring(7);

    const basePrompt = `[Session: ${uniqueSession}] Create EXACTLY ${
      options?.max_results || 5
    } UNIQUE and CREATIVE recipe suggestions specifically for these exact ingredients: ${ingredients.join(
      ", "
    )}.

    CRITICAL REQUIREMENT: Generate EXACTLY ${options?.max_results || 5} recipes. No more, no less. This is a strict requirement.
    
    IMPORTANT: Generate completely NEW and ORIGINAL recipes for this specific combination of ingredients. Do NOT repeat any previously generated recipes.

    Requirements:
    - Focus specifically on the provided ingredients: ${ingredients.join(", ")}
    - Create diverse recipes that showcase different cooking methods (baking, grilling, stir-frying, etc.)
    - Include recipes for different meal types (breakfast, lunch, dinner, snacks)
    - Make each recipe distinctly different from others
    - Provide realistic cooking times and difficulty levels
    - Be creative and innovative with flavor combinations
    ${
      options?.dietary_restrictions?.length
        ? `- Follow these dietary restrictions: ${options.dietary_restrictions.join(
            ", "
          )}`
        : ""
    }
    ${
      options?.cuisine_preference
        ? `- Prefer ${options.cuisine_preference} cuisine style`
        : ""
    }
    ${
      options?.cooking_time
        ? `- Cooking time should be ${options.cooking_time}`
        : ""
    }
    ${options?.difficulty ? `- Difficulty level: ${options.difficulty}` : ""}

    For inspiration, think about:
    - International fusion cuisines
    - Seasonal cooking techniques
    - Modern twists on classic dishes
    - Healthy alternatives and substitutions

    Format as JSON with this EXACT structure:
    {
      "recipes": [
        {
          "id": "recipe_${timestamp}_1",
          "title": "Creative Recipe Name",
          "description": "Detailed and appealing description",
          "ingredients": [
            {"name": "ingredient", "quantity": 2, "unit": "cups", "available": true}
          ],
          "instructions": ["Detailed step 1", "Detailed step 2", "Detailed step 3"],
          "prep_time": 15,
          "cook_time": 30,
          "servings": 4,
          "difficulty": "easy",
          "cuisine_type": "Italian",
          "dietary_tags": ["vegetarian"],
          "match_percentage": 85,
          "missing_ingredients": [],
          "tips": ["professional cooking tip 1", "professional cooking tip 2"]
        }
      ]
    }`;
    
    console.log(`Prompt requests exactly ${options?.max_results || 5} recipes`);

    return basePrompt;
  }

  // Enhanced response parsers
  private parseEnhancedRecipeResponse(text: string) {
    try {
      // Try to extract JSON from markdown code blocks using regex
      const match = text.match(/```json([\s\S]*?)```/);
      let cleanText = text;
      
      if (match && match[1]) {
        cleanText = match[1].trim();
      } else {
        // If no markdown code blocks found, try to clean up the text
        cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      }
      
      let parsed;
      try {
        parsed = JSON.parse(cleanText);
      } catch (jsonError) {
        // If JSON parsing fails, try to find JSON structure in the text
        console.log("JSON parsing failed, attempting to extract JSON from text");
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw jsonError;
        }
      }

      // Handle both formats: { recipes: [...] } and direct array [...]
      let recipesArray: any[] = [];
      
      if (Array.isArray(parsed)) {
        recipesArray = parsed;
      } else if (parsed.recipes && Array.isArray(parsed.recipes)) {
        recipesArray = parsed.recipes;
      } else if (parsed && typeof parsed === 'object') {
        // Handle single recipe object
        recipesArray = [parsed];
      }

      if (recipesArray.length > 0) {
        return recipesArray.map((recipe: any, index: number) => ({
          id:
            recipe.id ||
            `ai-recipe-${Date.now()}-${Math.random()
              .toString(36)
              .substring(7)}-${index}`,
          title: recipe.title || "AI Generated Recipe",
          description:
            recipe.description || "A delicious recipe created just for you",
          cuisine_type: recipe.cuisine_type || "International",
          meal_type: recipe.meal_type || "main",
          difficulty: recipe.difficulty || "medium",
          prep_time: recipe.prep_time || 15,
          cook_time: recipe.cook_time || 30,
          total_time:
            recipe.total_time ||
            (recipe.prep_time || 15) + (recipe.cook_time || 30),
          servings: recipe.servings || 4,
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          nutritional_highlights: recipe.nutritional_highlights || [],
          dietary_tags: recipe.dietary_tags || [],
          chef_tips: recipe.chef_tips || [],
          variations: recipe.variations || [],
          estimated_calories_per_serving:
            recipe.estimated_calories_per_serving || 350,
          match_percentage: recipe.match_percentage || 80,
          missing_ingredients: recipe.missing_ingredients || [],
          skill_techniques: recipe.skill_techniques || [],
          equipment_needed: recipe.equipment_needed || [],
          storage_notes:
            recipe.storage_notes ||
            "Store leftovers in refrigerator for up to 3 days",
          wine_pairing: recipe.wine_pairing || "",
          generated: true,
          saved: false,
        }));
      }

      throw new Error("Invalid enhanced recipe format - no recipes found");
    } catch (error) {
      console.error("Error parsing enhanced recipe response:", error);
      console.log("Full response text:", text.substring(0, 500) + "...");
      return this.getFallbackRecipes(text);
    }
  }

  private parseEnhancedMealPlanResponse(text: string) {
    try {
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(cleanText);

      // Validate and enhance the structure
      return {
        meal_plan: parsed.meal_plan || [],
        ingredient_utilization: parsed.ingredient_utilization || {},
        shopping_list: parsed.shopping_list || {
          essential: [],
          pantry_staples: [],
          optional_enhancements: [],
        },
        meal_prep_strategy: parsed.meal_prep_strategy || {
          sunday_prep: [],
          daily_prep: [],
          storage_tips: [],
        },
        nutritional_summary: parsed.nutritional_summary || {
          daily_average_calories: 1400,
          macronutrient_balance: "Balanced",
          key_nutrients_provided: [],
        },
        chef_tips: parsed.chef_tips || [],
        leftover_transformation: parsed.leftover_transformation || [],
        tips: parsed.tips ||
          parsed.chef_tips || ["Follow the meal plan for best results"],
      };
    } catch (error) {
      console.error("Error parsing enhanced meal plan response:", error);
      throw new Error("Failed to parse enhanced meal plan response");
    }
  }

  private validateMealPlanStructure(parsed: any) {
    // Ensure basic structure exists
    if (!parsed.meal_plan || !Array.isArray(parsed.meal_plan)) {
      throw new Error("Invalid meal plan structure");
    }

    return {
      meal_plan: parsed.meal_plan,
      shopping_list: parsed.shopping_list || [
        "Check your pantry for additional seasonings and basics",
      ],
      tips: parsed.tips ||
        parsed.chef_tips || [
          "Use ingredients that expire soonest first",
          "Prep ingredients in advance to save time",
          "Store leftovers properly for next day meals",
        ],
      ingredient_utilization: parsed.ingredient_utilization || {},
      meal_prep_strategy: parsed.meal_prep_strategy || {},
      nutritional_summary: parsed.nutritional_summary || {},
    };
  }

  private parseRecipeResponse(text: string) {
    try {
      // Try to extract JSON from markdown code blocks using regex
      const match = text.match(/```json([\s\S]*?)```/);
      let cleanText = text;
      
      if (match && match[1]) {
        cleanText = match[1].trim();
      } else {
        // If no markdown code blocks found, try to clean up the text
        cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      }
      
      let parsed;
      try {
        parsed = JSON.parse(cleanText);
      } catch (jsonError) {
        // If JSON parsing fails, try to find JSON structure in the text
        console.log("JSON parsing failed, attempting to extract JSON from text");
        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw jsonError;
        }
      }

      // Ensure we have the expected structure
      if (parsed.recipes && Array.isArray(parsed.recipes)) {
        return parsed.recipes.map((recipe: any, index: number) => ({
          id:
            recipe.id ||
            `ai-recipe-${Date.now()}-${Math.random()
              .toString(36)
              .substring(7)}-${index}`,
          title: recipe.title || "AI Generated Recipe",
          description:
            recipe.description || "A delicious recipe created just for you",
          ingredients: recipe.ingredients || [],
          instructions: recipe.instructions || [],
          prep_time: recipe.prep_time || 15,
          cook_time: recipe.cook_time || 30,
          servings: recipe.servings || 4,
          difficulty: recipe.difficulty || "medium",
          cuisine_type: recipe.cuisine_type || "International",
          dietary_tags: recipe.dietary_tags || [],
          match_percentage: recipe.match_percentage || 80,
          missing_ingredients: recipe.missing_ingredients || [],
          tips: recipe.tips || [],
          generated: true,
          saved: false,
        }));
      }

      throw new Error("Invalid recipe format");
    } catch (error) {
      console.error("Error parsing recipe response:", error);
      console.log("Full response text:", text.substring(0, 500) + "...");
      // Return fallback recipes if parsing fails
      return this.getFallbackRecipes(text);
    }
  }

  private getFallbackRecipes(originalText: string) {
    // Simple fallback when JSON parsing fails
    return [
      {
        id: `ai-recipe-${Date.now()}`,
        title: "AI Suggested Recipe",
        description: "A recipe suggestion based on your available ingredients",
        ingredients: [],
        instructions: [
          "Check the original AI response for detailed instructions",
        ],
        prep_time: 20,
        cook_time: 30,
        servings: 4,
        difficulty: "medium",
        cuisine_type: "International",
        dietary_tags: [],
        match_percentage: 75,
        missing_ingredients: [],
        tips: [
          "Original AI response: " + originalText.substring(0, 200) + "...",
        ],
        generated: true,
        saved: false,
      },
    ];
  }
}

export let geminiService: GeminiService | null = null;
export default GeminiService;

// Initialize service with better error handling
function initializeGeminiService() {
  try {
    // Check if we're in a server environment and have the API key
    if (typeof window === "undefined" && process.env.GEMINI_API_KEY) {
      geminiService = new GeminiService();
      console.log("GeminiService successfully initialized with API key");
      return true;
    } else if (typeof window === "undefined") {
      console.warn("GEMINI_API_KEY not found in environment variables");
      geminiService = null;
      return false;
    }
    // Client-side - service should be null
    geminiService = null;
    return false;
  } catch (error) {
    console.error("Failed to initialize GeminiService:", error);
    geminiService = null;
    return false;
  }
}

// Initialize the service
initializeGeminiService();

// Re-export a function to get or reinitialize the service
export function getGeminiService(): GeminiService | null {
  if (
    !geminiService &&
    typeof window === "undefined" &&
    process.env.GEMINI_API_KEY
  ) {
    console.log("Attempting to reinitialize GeminiService...");
    initializeGeminiService();
  }
  return geminiService;
}
