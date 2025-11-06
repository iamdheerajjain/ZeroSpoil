import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Food expiration prediction data (in days from purchase)
const FOOD_EXPIRATION_DATA: Record<
  string,
  { min: number; max: number; storage: Record<string, number> }
> = {
  // Fruits
  apples: {
    min: 21,
    max: 35,
    storage: { refrigerator: 35, pantry: 7, freezer: 365 },
  },
  bananas: {
    min: 5,
    max: 7,
    storage: { refrigerator: 7, pantry: 5, freezer: 90 },
  },
  oranges: {
    min: 14,
    max: 21,
    storage: { refrigerator: 21, pantry: 7, freezer: 365 },
  },
  strawberries: {
    min: 3,
    max: 7,
    storage: { refrigerator: 7, pantry: 1, freezer: 365 },
  },
  grapes: {
    min: 7,
    max: 14,
    storage: { refrigerator: 14, pantry: 3, freezer: 365 },
  },

  // Vegetables
  lettuce: {
    min: 7,
    max: 10,
    storage: { refrigerator: 10, pantry: 1, freezer: 60 },
  },
  carrots: {
    min: 21,
    max: 28,
    storage: { refrigerator: 28, pantry: 7, freezer: 365 },
  },
  potatoes: {
    min: 14,
    max: 21,
    storage: { refrigerator: 21, pantry: 14, freezer: 365 },
  },
  tomatoes: {
    min: 5,
    max: 7,
    storage: { refrigerator: 7, pantry: 5, freezer: 365 },
  },
  onions: {
    min: 30,
    max: 60,
    storage: { refrigerator: 60, pantry: 30, freezer: 365 },
  },

  // Dairy
  milk: {
    min: 5,
    max: 7,
    storage: { refrigerator: 7, pantry: 0, freezer: 90 },
  },
  cheese: {
    min: 14,
    max: 21,
    storage: { refrigerator: 21, pantry: 0, freezer: 180 },
  },
  yogurt: {
    min: 7,
    max: 14,
    storage: { refrigerator: 14, pantry: 0, freezer: 60 },
  },
  eggs: {
    min: 21,
    max: 28,
    storage: { refrigerator: 28, pantry: 0, freezer: 365 },
  },

  // Meat & Poultry
  chicken: {
    min: 1,
    max: 2,
    storage: { refrigerator: 2, pantry: 0, freezer: 365 },
  },
  beef: {
    min: 3,
    max: 5,
    storage: { refrigerator: 5, pantry: 0, freezer: 365 },
  },
  pork: {
    min: 3,
    max: 5,
    storage: { refrigerator: 5, pantry: 0, freezer: 365 },
  },
  fish: {
    min: 1,
    max: 2,
    storage: { refrigerator: 2, pantry: 0, freezer: 180 },
  },

  // Bread & Grains
  bread: {
    min: 5,
    max: 7,
    storage: { refrigerator: 7, pantry: 5, freezer: 90 },
  },
  rice: {
    min: 365,
    max: 730,
    storage: { refrigerator: 730, pantry: 365, freezer: 1095 },
  },
  pasta: {
    min: 365,
    max: 730,
    storage: { refrigerator: 730, pantry: 365, freezer: 1095 },
  },

  // Default for unknown items
  default: {
    min: 3,
    max: 7,
    storage: { refrigerator: 7, pantry: 3, freezer: 90 },
  },
};

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
      food_name,
      category,
      storage_location,
      purchase_date,
      current_condition,
    } = body;

    if (!food_name || !storage_location || !purchase_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First try AI-enhanced prediction for better accuracy
    try {
      const { getGeminiService } = await import(
        "@/lib/services/gemini-service"
      );
      const geminiService = getGeminiService();

      if (!geminiService) {
        throw new Error("Gemini service not available");
      }

      const aiPrediction = await geminiService.improveExpirationPrediction(
        food_name,
        category || "Other",
        storage_location,
        purchase_date,
        current_condition
      );

      // Get AI-powered storage tips
      const storageTips = await geminiService.generateFoodStorageTips(
        food_name,
        storage_location
      );

      const enhancedPrediction = {
        predicted_expiration: aiPrediction.predicted_expiration_date,
        prediction_confidence: aiPrediction.confidence,
        days_until_expiration: Math.ceil(
          (new Date(aiPrediction.predicted_expiration_date).getTime() -
            new Date(purchase_date).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        storage_recommendation: getBestStorageForFood(
          food_name,
          storage_location
        ),
        tips: storageTips,
        factors_considered: aiPrediction.factors_considered || [],
        signs_of_spoilage: aiPrediction.signs_of_spoilage || [],
        ai_enhanced: true,
      };

      console.log("AI-enhanced expiration prediction generated");
      return NextResponse.json({ data: enhancedPrediction });
    } catch (aiError) {
      console.error(
        "AI prediction failed, falling back to lookup table:",
        aiError
      );

      // Fallback to original lookup table method
      const normalizedName = food_name.toLowerCase().trim();

      let foodData = FOOD_EXPIRATION_DATA[normalizedName];

      if (!foodData) {
        const matchingKey = Object.keys(FOOD_EXPIRATION_DATA).find(
          (key) => normalizedName.includes(key) || key.includes(normalizedName)
        );
        foodData = matchingKey
          ? FOOD_EXPIRATION_DATA[matchingKey]
          : FOOD_EXPIRATION_DATA.default;
      }

      const storageKey = storage_location.toLowerCase();
      let expirationDays = foodData.storage[storageKey] || foodData.max;

      // Add some randomness for more realistic predictions
      const variance = Math.floor(expirationDays * 0.1);
      const randomVariance =
        Math.floor(Math.random() * variance * 2) - variance;
      expirationDays = Math.max(1, expirationDays + randomVariance);

      const purchaseDateTime = new Date(purchase_date);
      const predictedExpiration = new Date(purchaseDateTime);
      predictedExpiration.setDate(
        predictedExpiration.getDate() + expirationDays
      );

      let confidence = 0.85;
      if (FOOD_EXPIRATION_DATA[normalizedName]) {
        confidence = 0.95;
      } else if (
        Object.keys(FOOD_EXPIRATION_DATA).some(
          (key) => normalizedName.includes(key) || key.includes(normalizedName)
        )
      ) {
        confidence = 0.75;
      } else {
        confidence = 0.6;
      }

      if (foodData.storage[storageKey]) {
        confidence += 0.05;
      }

      const prediction = {
        predicted_expiration: predictedExpiration.toISOString().split("T")[0],
        prediction_confidence: Math.min(0.99, confidence),
        days_until_expiration: expirationDays,
        storage_recommendation: getBestStorageRecommendation(foodData),
        tips: getStorageTips(normalizedName, storage_location),
        ai_enhanced: false,
      };

      return NextResponse.json({ data: prediction });
    }
  } catch (error) {
    console.error("Error predicting expiration:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getBestStorageRecommendation(foodData: any): string {
  const storageOptions = Object.entries(foodData.storage) as [string, number][];
  const bestStorage = storageOptions.reduce((best, current) =>
    current[1] > best[1] ? current : best
  );
  return bestStorage[0];
}

function getBestStorageForFood(
  foodName: string,
  currentStorage: string
): string {
  // Simple logic to recommend best storage
  const foodLower = foodName.toLowerCase();

  if (
    foodLower.includes("milk") ||
    foodLower.includes("dairy") ||
    foodLower.includes("cheese")
  ) {
    return "refrigerator";
  }
  if (foodLower.includes("bread") || foodLower.includes("grain")) {
    return "pantry";
  }
  if (foodLower.includes("meat") || foodLower.includes("fish")) {
    return "refrigerator";
  }

  return currentStorage; // Default to current storage
}

function getStorageTips(foodName: string, currentStorage: string): string[] {
  const tips: string[] = [];

  // General tips based on food type
  if (
    foodName.includes("fruit") ||
    ["apples", "oranges", "grapes"].some((f) => foodName.includes(f))
  ) {
    tips.push(
      "Store away from ethylene-producing fruits to prevent over-ripening"
    );
    tips.push("Check regularly and remove any spoiled pieces");
  }

  if (
    foodName.includes("vegetable") ||
    ["lettuce", "carrots", "tomatoes"].some((f) => foodName.includes(f))
  ) {
    tips.push("Keep in crisper drawer for optimal humidity");
    tips.push("Don't wash until ready to use");
  }

  if (["milk", "cheese", "yogurt"].some((f) => foodName.includes(f))) {
    tips.push("Keep refrigerated at 40°F (4°C) or below");
    tips.push("Store in original container when possible");
  }

  if (["chicken", "beef", "pork", "fish"].some((f) => foodName.includes(f))) {
    tips.push("Use within recommended timeframe or freeze");
    tips.push("Keep at coldest part of refrigerator");
    tips.push("Ensure proper packaging to prevent cross-contamination");
  }

  // Storage-specific tips
  if (currentStorage === "pantry") {
    tips.push("Store in cool, dry place away from direct sunlight");
  } else if (currentStorage === "refrigerator") {
    tips.push("Maintain consistent temperature");
  } else if (currentStorage === "freezer") {
    tips.push("Label with date and use within recommended freezer time");
  }

  return tips.slice(0, 3); // Return max 3 tips
}
