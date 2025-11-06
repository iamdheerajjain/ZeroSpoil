// Food categories
export const FOOD_CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Dairy',
  'Meat & Poultry',
  'Fish & Seafood',
  'Grains & Cereals',
  'Bread & Bakery',
  'Canned Goods',
  'Frozen Foods',
  'Snacks',
  'Beverages',
  'Condiments & Sauces',
  'Herbs & Spices',
  'Other'
] as const

// Storage locations
export const STORAGE_LOCATIONS = [
  'Refrigerator',
  'Freezer',
  'Pantry',
  'Counter',
  'Cellar',
  'Other'
] as const

// Units of measurement
export const MEASUREMENT_UNITS = [
  'pieces',
  'kg',
  'g',
  'lbs',
  'oz',
  'liters',
  'ml',
  'cups',
  'tbsp',
  'tsp',
  'packages',
  'cans',
  'bottles',
  'bags'
] as const

// Food status options
export const FOOD_STATUS = [
  { value: 'fresh', label: 'Fresh', color: 'green' },
  { value: 'expiring_soon', label: 'Expiring Soon', color: 'yellow' },
  { value: 'expired', label: 'Expired', color: 'red' }
] as const

// Waste actions
export const WASTE_ACTIONS = [
  { value: 'consumed', label: 'Consumed', color: 'green' },
  { value: 'donated', label: 'Donated', color: 'blue' },
  { value: 'wasted', label: 'Wasted', color: 'red' },
  { value: 'preserved', label: 'Preserved', color: 'purple' },
  { value: 'composted', label: 'Composted', color: 'orange' }
] as const

// Recipe difficulty levels
export const RECIPE_DIFFICULTY = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' }
] as const

// Cuisine types
export const CUISINE_TYPES = [
  'Italian',
  'Chinese',
  'Mexican',
  'Indian',
  'Japanese',
  'Thai',
  'French',
  'Mediterranean',
  'American',
  'Korean',
  'Vietnamese',
  'Greek',
  'Spanish',
  'Middle Eastern',
  'Other'
] as const

// Dietary restrictions/tags
export const DIETARY_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
  'Halal',
  'Kosher',
  'Low-Sodium',
  'High-Protein'
] as const

// Donation status
export const DONATION_STATUS = [
  { value: 'scheduled', label: 'Scheduled', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
] as const

// Achievement types
export const ACHIEVEMENT_TYPES = [
  'first_item_added',
  'first_recipe_saved',
  'first_donation',
  'waste_reducer',
  'eco_warrior',
  'recipe_master',
  'donation_hero',
  'streak_keeper'
] as const

// Notification types
export const NOTIFICATION_TYPES = [
  'expiration_alert',
  'recipe_suggestion',
  'donation_reminder',
  'achievement_earned',
  'weekly_summary'
] as const

// Date formats
export const DATE_FORMATS = {
  SHORT: 'MMM dd',
  MEDIUM: 'MMM dd, yyyy',
  LONG: 'MMMM dd, yyyy',
  ISO: 'yyyy-MM-dd'
} as const

// API endpoints
export const API_ENDPOINTS = {
  FOOD_ITEMS: '/api/food-items',
  RECIPES: '/api/recipes',
  DONATIONS: '/api/donations',
  DONATION_LOCATIONS: '/api/donation-locations',
  WASTE_LOGS: '/api/waste-logs',
  ANALYTICS: '/api/analytics',
  PROFILE: '/api/profile',
  AUTH: {
    SIGNUP: '/api/auth/signup',
    SIGNIN: '/api/auth/signin',
    SIGNOUT: '/api/auth/signout'
  },
  AI: {
    PREDICT_EXPIRATION: '/api/ai/predict-expiration',
    RECIPE_SUGGESTIONS: '/api/ai/recipe-suggestions'
  }
} as const

// Default values
export const DEFAULTS = {
  EXPIRATION_WARNING_DAYS: 3,
  ANALYTICS_PERIOD_DAYS: 30,
  MAX_RECIPE_SUGGESTIONS: 5,
  DONATION_SEARCH_RADIUS_KM: 10,
  PAGINATION_LIMIT: 20
} as const

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You need to be logged in to perform this action.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
  UNKNOWN_ERROR: 'An unexpected error occurred.'
} as const

// Success messages
export const SUCCESS_MESSAGES = {
  ITEM_CREATED: 'Item added successfully!',
  ITEM_UPDATED: 'Item updated successfully!',
  ITEM_DELETED: 'Item deleted successfully!',
  RECIPE_SAVED: 'Recipe saved successfully!',
  RECIPE_UNSAVED: 'Recipe removed from saved recipes.',
  DONATION_SCHEDULED: 'Donation scheduled successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_RESET: 'Password reset email sent!',
  SIGNUP_SUCCESS: 'Account created successfully!',
  SIGNIN_SUCCESS: 'Welcome back!',
  SIGNOUT_SUCCESS: 'Signed out successfully!'
} as const