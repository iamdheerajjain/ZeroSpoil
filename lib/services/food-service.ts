import { createClient } from "@/lib/supabase/client";
import { FoodItem } from "@/types";

export class FoodService {
  private supabase = createClient();

  async getFoodItems(filters?: {
    status?: string;
    category?: string;
    storage_location?: string;
  }) {
    try {
      const params = new URLSearchParams();
      if (filters?.status && filters.status !== "all") {
        params.append("status", filters.status);
      }
      if (filters?.category) {
        params.append("category", filters.category);
      }
      if (filters?.storage_location) {
        params.append("storage_location", filters.storage_location);
      }

      const response = await fetch(`/api/food-items?${params}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch food items");
      }

      const result = await response.json();
      return result.data as FoodItem[];
    } catch (error) {
      console.error("Error fetching food items:", error);
      throw error;
    }
  }

  async createFoodItem(
    foodItem: Omit<
      FoodItem,
      "id" | "user_id" | "created_at" | "updated_at" | "status"
    >
  ) {
    try {
      const response = await fetch("/api/food-items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(foodItem),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create food item");
      }

      const result = await response.json();
      return result.data as FoodItem;
    } catch (error) {
      console.error("Error creating food item:", error);
      throw error;
    }
  }

  async updateFoodItem(id: string, updates: Partial<FoodItem>) {
    try {
      const response = await fetch(`/api/food-items/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update food item");
      }

      const result = await response.json();
      return result.data as FoodItem;
    } catch (error) {
      console.error("Error updating food item:", error);
      throw error;
    }
  }

  async deleteFoodItem(id: string) {
    try {
      const response = await fetch(`/api/food-items/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete food item");
      }
    } catch (error) {
      console.error("Error deleting food item:", error);
      throw error;
    }
  }

  async getExpiringItems(days: number = 3) {
    try {
      // For now, get all items and filter client-side
      // In production, you might want a dedicated API endpoint for this
      const allItems = await this.getFoodItems();

      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);

      return allItems
        .filter((item) => {
          if (!item.expiration_date || item.status === "expired") return false;
          const expirationDate = new Date(item.expiration_date);
          return expirationDate <= targetDate;
        })
        .sort((a, b) => {
          const dateA = new Date(a.expiration_date!).getTime();
          const dateB = new Date(b.expiration_date!).getTime();
          return dateA - dateB;
        });
    } catch (error) {
      console.error("Error fetching expiring items:", error);
      throw error;
    }
  }

  async predictExpiration(
    foodName: string,
    category: string,
    storageLocation: string,
    purchaseDate: string
  ) {
    try {
      const response = await fetch("/api/ai/predict-expiration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          food_name: foodName,
          category,
          storage_location: storageLocation,
          purchase_date: purchaseDate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to predict expiration");
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error("Error predicting expiration:", error);
      throw error;
    }
  }
}
