"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { FoodItem } from "@/types";
import { FoodItemFilters } from "@/lib/validations";

export function useFoodItems(initialFilters?: Partial<FoodItemFilters>) {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FoodItemFilters>({
    status: "all",
    ...initialFilters,
  });

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const items = await apiClient.food.getFoodItems(filters);
      setFoodItems(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch food items"
      );
    } finally {
      setLoading(false);
    }
  };

  const createFoodItem = async (
    data: Omit<
      FoodItem,
      "id" | "user_id" | "created_at" | "updated_at" | "status"
    >
  ) => {
    try {
      const newItem = await apiClient.food.createFoodItem(data);
      setFoodItems((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      throw err;
    }
  };

  const updateFoodItem = async (id: string, updates: Partial<FoodItem>) => {
    try {
      const updatedItem = await apiClient.food.updateFoodItem(id, updates);
      setFoodItems((prev) =>
        prev.map((item) => (item.id === id ? updatedItem : item))
      );
      return updatedItem;
    } catch (err) {
      throw err;
    }
  };

  const deleteFoodItem = async (id: string) => {
    try {
      await apiClient.food.deleteFoodItem(id);
      setFoodItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const getExpiringItems = async (days: number = 3) => {
    try {
      return await apiClient.food.getExpiringItems(days);
    } catch (err) {
      throw err;
    }
  };

  const predictExpiration = async (
    foodName: string,
    category: string,
    storageLocation: string,
    purchaseDate: string
  ) => {
    try {
      return await apiClient.food.predictExpiration(
        foodName,
        category,
        storageLocation,
        purchaseDate
      );
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, [filters]);

  return {
    foodItems,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchFoodItems,
    createFoodItem,
    updateFoodItem,
    deleteFoodItem,
    getExpiringItems,
    predictExpiration,
  };
}
