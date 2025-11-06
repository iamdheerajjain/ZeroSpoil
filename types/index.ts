export interface FoodItem {
  id: string;
  user_id: string;
  name: string;
  category: string;
  purchase_date: string;
  expiration_date?: string;
  predicted_expiration?: string;
  prediction_confidence?: number;
  storage_location: string;
  quantity: number;
  unit: string;
  image_url?: string;
  status: "fresh" | "expiring_soon" | "expired";
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  user_id?: string;
  title: string;
  description?: string;
  ingredients: RecipeIngredient[];
  instructions: string[];
  cuisine_type?: string;
  meal_type?: string;
  dietary_tags: string[];
  prep_time?: number;
  cook_time?: number;
  total_time?: number;
  servings?: number;
  difficulty?: "easy" | "medium" | "hard";
  image_url?: string;
  saved: boolean;
  generated?: boolean;
  created_at: string;
  // Enhanced AI recipe fields
  nutritional_highlights?: string[];
  chef_tips?: string[];
  variations?: string[];
  estimated_calories_per_serving?: number;
  match_percentage?: number;
  missing_ingredients?: string[];
  skill_techniques?: string[];
  equipment_needed?: string[];
  storage_notes?: string;
  wine_pairing?: string;
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: string;
  available?: boolean;
  notes?: string;
}

export interface DonationLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  contact_phone?: string;
  contact_email?: string;
  hours: Record<string, string>;
  accepted_items: string[];
  website?: string;
  notes?: string;
  created_at: string;
}

export interface UserPreferences {
  user_id: string;
  dietary_restrictions: string[];
  favorite_cuisines: string[];
  notification_settings: NotificationSettings;
  measurement_system: "metric" | "imperial";
  business_account: boolean;
  theme: "light" | "dark";
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  expiration_alerts: boolean;
  recipe_suggestions: boolean;
  donation_reminders: boolean;
  achievement_notifications: boolean;
  email_notifications: boolean;
}

export interface WasteLog {
  id: string;
  user_id: string;
  food_item_id?: string;
  action: "consumed" | "donated" | "wasted" | "preserved" | "composted";
  date: string;
  quantity?: number;
  estimated_value?: number;
  notes?: string;
  created_at: string;
}

export interface Donation {
  id: string;
  user_id: string;
  location_id: string;
  scheduled_date: string;
  status: "scheduled" | "completed" | "cancelled";
  items: DonationItem[];
  total_weight?: number;
  estimated_meals?: number;
  notes?: string;
  created_at: string;
}

export interface DonationItem {
  food_item_id: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface Achievement {
  id: string;
  user_id: string;
  achievement_type: string;
  earned_at: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsMetrics {
  total_items: number;
  expiring_soon: number;
  money_saved: number;
  waste_prevented: number;
  co2_saved: number;
  meals_preserved: number;
  donation_count: number;
  waste_trend: WasteTrendData[];
  category_breakdown: CategoryData[];
  action_distribution: ActionData[];
}

export interface WasteTrendData {
  date: string;
  wasted: number;
  saved: number;
  donated: number;
}

export interface CategoryData {
  category: string;
  count: number;
  percentage: number;
}

export interface ActionData {
  action: string;
  count: number;
  percentage: number;
}

// Enhanced meal planning types
export interface MealPlan {
  meal_plan: DayMealPlan[];
  ingredient_utilization?: IngredientUtilization;
  shopping_list?: ShoppingList;
  meal_prep_strategy?: MealPrepStrategy;
  nutritional_summary?: NutritionalSummary;
  chef_tips?: string[];
  leftover_transformation?: string[];
  tips: string[];
}

export interface DayMealPlan {
  day: number;
  theme?: string;
  daily_nutrition_focus?: string;
  prep_notes?: string;
  meals: {
    breakfast?: MealPlanMeal;
    lunch?: MealPlanMeal;
    dinner?: MealPlanMeal;
    snack?: MealPlanMeal;
  };
  daily_totals?: {
    estimated_calories: number;
    preparation_time: number;
    key_nutrients_covered: string[];
  };
}

export interface MealPlanMeal {
  name: string;
  description?: string;
  ingredients_used: string[];
  prep_time?: number;
  cook_time?: number;
  calories_per_serving?: number;
  key_nutrients?: string[];
  cooking_method?: string;
  difficulty?: string;
  leftover_strategy?: string;
}

export interface IngredientUtilization {
  day_1?: string[];
  day_2?: string[];
  day_3?: string[];
  remaining?: string[];
  primary_used?: string[];
  secondary_used?: string[];
  unused?: string[];
}

export interface ShoppingList {
  essential: string[];
  pantry_staples: string[];
  optional_enhancements: string[];
}

export interface MealPrepStrategy {
  sunday_prep: string[];
  daily_prep: string[];
  storage_tips: string[];
}

export interface NutritionalSummary {
  daily_average_calories: number;
  macronutrient_balance: string;
  key_nutrients_provided: string[];
  dietary_compliance?: string;
}
