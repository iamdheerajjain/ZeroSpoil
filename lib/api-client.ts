import { FoodService } from "./services/food-service"
import { RecipeService } from "./services/recipe-service"
import { AnalyticsService } from "./services/analytics-service"
import { DonationService } from "./services/donation-service"
import { AuthService } from "./services/auth-service"

// Centralized API client
export class ApiClient {
  public food: FoodService
  public recipes: RecipeService
  public analytics: AnalyticsService
  public donations: DonationService
  public auth: AuthService

  constructor() {
    this.food = new FoodService()
    this.recipes = new RecipeService()
    this.analytics = new AnalyticsService()
    this.donations = new DonationService()
    this.auth = new AuthService()
  }
}

// Export singleton instance
export const apiClient = new ApiClient()

// Export individual services for direct use
export { FoodService, RecipeService, AnalyticsService, DonationService, AuthService }