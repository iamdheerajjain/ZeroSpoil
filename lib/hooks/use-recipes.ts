"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Recipe } from "@/types"
import { RecipeFilters } from "@/lib/validations"

export function useRecipes(initialFilters?: Partial<RecipeFilters>) {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<RecipeFilters>({
    saved_only: false,
    ...initialFilters
  })

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      setError(null)
      const recipeList = await apiClient.recipes.getRecipes(filters)
      setRecipes(recipeList)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recipes")
    } finally {
      setLoading(false)
    }
  }

  const getRecipe = async (id: string) => {
    try {
      return await apiClient.recipes.getRecipe(id)
    } catch (err) {
      throw err
    }
  }

  const createRecipe = async (data: Omit<Recipe, 'id' | 'user_id' | 'created_at' | 'saved'>) => {
    try {
      const newRecipe = await apiClient.recipes.createRecipe(data)
      setRecipes(prev => [newRecipe, ...prev])
      return newRecipe
    } catch (err) {
      throw err
    }
  }

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    try {
      const updatedRecipe = await apiClient.recipes.updateRecipe(id, updates)
      setRecipes(prev => prev.map(recipe => recipe.id === id ? updatedRecipe : recipe))
      return updatedRecipe
    } catch (err) {
      throw err
    }
  }

  const deleteRecipe = async (id: string) => {
    try {
      await apiClient.recipes.deleteRecipe(id)
      setRecipes(prev => prev.filter(recipe => recipe.id !== id))
    } catch (err) {
      throw err
    }
  }

  const saveRecipe = async (id: string) => {
    try {
      await apiClient.recipes.saveRecipe(id)
      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? { ...recipe, saved: true } : recipe
      ))
    } catch (err) {
      throw err
    }
  }

  const unsaveRecipe = async (id: string) => {
    try {
      await apiClient.recipes.unsaveRecipe(id)
      setRecipes(prev => prev.map(recipe => 
        recipe.id === id ? { ...recipe, saved: false } : recipe
      ))
    } catch (err) {
      throw err
    }
  }

  const getRecipeSuggestions = async (ingredients: string[], options?: {
    dietary_restrictions?: string[]
    cuisine_preference?: string
    max_results?: number
  }) => {
    try {
      const result = await apiClient.recipes.getRecipeSuggestions(ingredients, options)
      console.log('useRecipes hook received:', result.length, 'recipes');
      return result;
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchRecipes()
  }, [filters])

  return {
    recipes,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchRecipes,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    saveRecipe,
    unsaveRecipe,
    getRecipeSuggestions
  }
}