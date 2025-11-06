import { z } from "zod"

// Food item validation schema
export const foodItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  category: z.string().min(1, "Category is required"),
  purchase_date: z.string().min(1, "Purchase date is required"),
  expiration_date: z.string().optional(),
  storage_location: z.string().min(1, "Storage location is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unit: z.string().min(1, "Unit is required"),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
  image_url: z.string().url("Invalid image URL").optional().or(z.literal(""))
})

export type FoodItemFormData = z.infer<typeof foodItemSchema>

// Recipe validation schema
export const recipeSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  ingredients: z.array(z.object({
    name: z.string().min(1, "Ingredient name is required"),
    quantity: z.number().min(0, "Quantity must be positive"),
    unit: z.string().min(1, "Unit is required")
  })).min(1, "At least one ingredient is required"),
  instructions: z.array(z.string().min(1, "Instruction cannot be empty")).min(1, "At least one instruction is required"),
  cuisine_type: z.string().optional(),
  dietary_tags: z.array(z.string()).default([]),
  prep_time: z.number().min(0, "Prep time must be positive").optional(),
  cook_time: z.number().min(0, "Cook time must be positive").optional(),
  servings: z.number().min(1, "Servings must be at least 1").optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
  is_public: z.boolean().default(false)
})

export type RecipeFormData = z.infer<typeof recipeSchema>

// Donation validation schema
export const donationSchema = z.object({
  location_id: z.string().min(1, "Location is required"),
  scheduled_date: z.string().min(1, "Scheduled date is required"),
  items: z.array(z.object({
    food_item_id: z.string().optional(),
    name: z.string().min(1, "Item name is required"),
    quantity: z.number().min(0.01, "Quantity must be greater than 0"),
    unit: z.string().min(1, "Unit is required")
  })).min(1, "At least one item is required"),
  total_weight: z.number().min(0, "Weight must be positive").optional(),
  estimated_meals: z.number().min(0, "Estimated meals must be positive").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional()
})

export type DonationFormData = z.infer<typeof donationSchema>

// Waste log validation schema
export const wasteLogSchema = z.object({
  food_item_id: z.string().optional(),
  action: z.enum(["consumed", "donated", "wasted", "preserved", "composted"]),
  date: z.string().min(1, "Date is required"),
  quantity: z.number().min(0, "Quantity must be positive").optional(),
  estimated_value: z.number().min(0, "Value must be positive").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional()
})

export type WasteLogFormData = z.infer<typeof wasteLogSchema>

// User profile validation schema
export const userProfileSchema = z.object({
  full_name: z.string().max(100, "Name must be less than 100 characters").optional(),
  avatar_url: z.string().url("Invalid avatar URL").optional().or(z.literal("")),
  dietary_restrictions: z.array(z.string()).default([]),
  favorite_cuisines: z.array(z.string()).default([]),
  measurement_system: z.enum(["metric", "imperial"]).default("metric"),
  business_account: z.boolean().default(false),
  theme: z.enum(["light", "dark"]).default("light"),
  notification_settings: z.object({
    expiration_alerts: z.boolean().default(true),
    recipe_suggestions: z.boolean().default(true),
    donation_reminders: z.boolean().default(true),
    achievement_notifications: z.boolean().default(true),
    email_notifications: z.boolean().default(false)
  }).default({
    expiration_alerts: true,
    recipe_suggestions: true,
    donation_reminders: true,
    achievement_notifications: true,
    email_notifications: false
  })
})

export type UserProfileFormData = z.infer<typeof userProfileSchema>

// Authentication validation schemas
export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1, "Full name is required").max(100, "Name must be less than 100 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export type SignUpFormData = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
})

export type SignInFormData = z.infer<typeof signInSchema>

export const resetPasswordSchema = z.object({
  email: z.string().email("Invalid email address")
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

export const updatePasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
})

export type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>

// Search and filter validation schemas
export const foodItemFiltersSchema = z.object({
  status: z.enum(["all", "fresh", "expiring_soon", "expired"]).default("all"),
  category: z.string().optional(),
  storage_location: z.string().optional(),
  search: z.string().optional()
})

export type FoodItemFilters = z.infer<typeof foodItemFiltersSchema>

export const recipeFiltersSchema = z.object({
  cuisine_type: z.string().optional(),
  dietary_tags: z.string().optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  saved_only: z.boolean().default(false),
  search: z.string().optional()
})

export type RecipeFilters = z.infer<typeof recipeFiltersSchema>

export const donationFiltersSchema = z.object({
  status: z.enum(["all", "scheduled", "completed", "cancelled"]).default("all"),
  search: z.string().optional()
})

export type DonationFilters = z.infer<typeof donationFiltersSchema>

// Utility validation functions
export function validateDate(dateString: string): boolean {
  const date = new Date(dateString)
  return date instanceof Date && !isNaN(date.getTime())
}

export function validateFutureDate(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today
}

export function validatePastDate(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date <= today
}

export function validateImageFile(file: File): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  return allowedTypes.includes(file.type) && file.size <= maxSize
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '')
}