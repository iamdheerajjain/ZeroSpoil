"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Loading, SkeletonCard } from "@/components/ui/loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useFoodItems } from "@/lib/hooks/use-food-items";
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { useRecipes } from "@/lib/hooks/use-recipes";
import { FoodItemCard } from "@/components/features/food-items/food-item-card";
import { FoodItemForm } from "@/components/features/food-items/food-item-form";
import { WasteLogForm } from "@/components/features/food-items/waste-log-form";
import { IngredientSelector } from "@/components/features/recipes/ingredient-selector";
import { RecipeDetailDialog } from "@/components/features/recipes/recipe-detail-dialog";
import {
  Package,
  AlertTriangle,
  TrendingUp,
  Heart,
  ChefHat,
  Plus,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { FoodItem, Recipe } from "@/types";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showWasteLogForm, setShowWasteLogForm] = useState(false);
  const [showIngredientSelector, setShowIngredientSelector] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoodItem | undefined>();
  const [expiringItems, setExpiringItems] = useState<FoodItem[]>([]);
  const [recipeSuggestions, setRecipeSuggestions] = useState<any[]>([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);

  const { foodItems, loading: foodLoading, getExpiringItems } = useFoodItems();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const { getRecipeSuggestions } = useRecipes();

  // Load expiring items and recipe suggestions
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Get expiring items
        const expiring = await getExpiringItems(3);
        setExpiringItems(expiring);

        // Get recipe suggestions based on expiring items (just show we have expiring items)
        if (expiring.length > 0) {
          // Don't auto-generate recipes, just show that we have expiring items
          setRecipeSuggestions([]);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    };

    loadDashboardData();
  }, [foodItems]);

  const handleEditItem = (item: FoodItem) => {
    setSelectedItem(item);
    setShowAddForm(true);
  };

  const handleCreateWasteLog = (item: FoodItem) => {
    setSelectedItem(item);
    setShowWasteLogForm(true);
  };

  const handleDeleteItem = async (id: string) => {
    // This will be handled by the FoodItemCard component
  };

  const handleGenerateRecipes = async (selectedIngredients: string[]) => {
    try {
      setLoadingRecipes(true);
      const suggestions = await getRecipeSuggestions(selectedIngredients, {
        max_results: 3,
      });
      setRecipeSuggestions(suggestions);
      setShowIngredientSelector(false);
    } catch (error) {
      console.error("Error generating recipes:", error);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleRecipeClick = (suggestion: any) => {
    // Convert suggestion to Recipe format for the dialog
    const recipeFormat: Recipe = {
      id: suggestion.id || `ai-recipe-${Date.now()}`,
      title: suggestion.title,
      description: suggestion.description,
      ingredients: suggestion.ingredients || [],
      instructions: suggestion.instructions || [],
      cuisine_type: suggestion.cuisine_type,
      meal_type: suggestion.meal_type,
      dietary_tags: suggestion.dietary_tags || [],
      prep_time: suggestion.prep_time,
      cook_time: suggestion.cook_time,
      total_time: suggestion.total_time,
      servings: suggestion.servings,
      difficulty: suggestion.difficulty,
      saved: false,
      generated: true,
      created_at: new Date().toISOString(),
      // Enhanced AI fields
      nutritional_highlights: suggestion.nutritional_highlights,
      chef_tips: suggestion.chef_tips,
      variations: suggestion.variations,
      estimated_calories_per_serving: suggestion.estimated_calories_per_serving,
      match_percentage: suggestion.match_percentage,
      missing_ingredients: suggestion.missing_ingredients,
      skill_techniques: suggestion.skill_techniques,
      equipment_needed: suggestion.equipment_needed,
      storage_notes: suggestion.storage_notes,
      wine_pairing: suggestion.wine_pairing,
    };
    setSelectedRecipe(recipeFormat);
    setShowRecipeDetail(true);
  };

  const stats = [
    {
      title: "Total Items",
      value: analytics?.total_items || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Expiring Soon",
      value: analytics?.expiring_soon || 0,
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Money Saved",
      value: `$${analytics?.money_saved?.toFixed(2) || "0.00"}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "CO₂ Saved",
      value: `${analytics?.co2_saved?.toFixed(1) || "0.0"} kg`,
      icon: Heart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <DashboardLayout
      title="Dashboard"
      description="Overview of your food inventory and waste reduction progress"
      action={{
        label: "Add Food Item",
        onClick: () => {
          setSelectedItem(undefined);
          setShowAddForm(true);
        },
      }}
    >
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {analyticsLoading
            ? // Loading skeletons
              [...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <Card variant="elevated">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="h-8 bg-gray-200 rounded w-16"></div>
                        </div>
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            : stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    variant="elevated"
                    className="hover-lift cursor-pointer group"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">
                            {stat.title}
                          </p>
                          <p className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                            {stat.value}
                          </p>
                        </div>
                        <div
                          className={`p-3 rounded-full ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}
                        >
                          <stat.icon className={`h-6 w-6 ${stat.color}`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expiring Items */}
          <Card variant="elevated" className="overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                Items Expiring Soon
              </CardTitle>
              <Link href="/dashboard/food-items?status=expiring_soon">
                <Button variant="ghost" size="sm" className="hover-scale">
                  View All
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {foodLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-xl mb-2"></div>
                    </div>
                  ))}
                </div>
              ) : expiringItems.length > 0 ? (
                <div className="space-y-3">
                  {expiringItems.slice(0, 5).map((item, index) => {
                    const daysUntilExpiration = Math.ceil(
                      (new Date(item.expiration_date!).getTime() -
                        new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    );

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-xl border-l-4 border-yellow-400 hover-lift"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-foreground">
                            {item.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {item.category} • Expires in{" "}
                            <span
                              className={`font-medium ${
                                daysUntilExpiration <= 1
                                  ? "text-red-600"
                                  : daysUntilExpiration <= 3
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {daysUntilExpiration}
                            </span>{" "}
                            {daysUntilExpiration === 1 ? "day" : "days"}
                          </p>
                        </div>
                        <Badge
                          variant={
                            daysUntilExpiration <= 1 ? "destructive" : "warning"
                          }
                          className="animate-pulse"
                        >
                          {daysUntilExpiration <= 1 ? "Urgent" : "Soon"}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎉</div>
                  <p className="text-muted-foreground">
                    No items expiring soon!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    You're doing great at managing your food!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipe Suggestions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recipe Suggestions</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowIngredientSelector(true)}
                disabled={foodItems.length === 0}
              >
                <ChefHat className="mr-1 h-4 w-4" />
                Get AI Recipes
              </Button>
            </CardHeader>
            <CardContent>
              {loadingRecipes ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
                  <p className="text-gray-500">Generating AI recipes...</p>
                </div>
              ) : recipeSuggestions.length > 0 ? (
                <div className="space-y-3">
                  {recipeSuggestions.map((recipe, index) => (
                    <div
                      key={recipe.id || index}
                      className="p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={() => handleRecipeClick(recipe)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {recipe.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {recipe.description ||
                              "A delicious AI-generated recipe using your selected ingredients"}
                          </p>
                        </div>
                        {recipe.generated && (
                          <Badge
                            variant="default"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-2"
                          >
                            <Sparkles className="mr-1 h-3 w-3" />
                            AI
                          </Badge>
                        )}
                      </div>
                      {recipe.match_percentage && (
                        <Badge variant="success" className="mt-2">
                          {recipe.match_percentage}% ingredient match
                        </Badge>
                      )}
                    </div>
                  ))}
                  <div className="pt-2">
                    <Link href="/dashboard/recipes">
                      <Button variant="outline" size="sm" className="w-full">
                        View All Recipes
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">
                    {foodItems.length === 0
                      ? "Add some food items to get personalized recipe suggestions!"
                      : "Click 'Get AI Recipes' to select ingredients and generate personalized recipes!"}
                  </p>
                  {foodItems.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowIngredientSelector(true)}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get AI Recipes
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button
                onClick={() => {
                  setSelectedItem(undefined);
                  setShowAddForm(true);
                }}
                className="h-20 flex flex-col items-center justify-center"
              >
                <Plus className="h-6 w-6 mb-2" />
                Add Food Item
              </Button>

              <Link href="/dashboard/donations">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center w-full"
                >
                  <Heart className="h-6 w-6 mb-2" />
                  Schedule Donation
                </Button>
              </Link>

              <Link href="/dashboard/analytics">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center w-full"
                >
                  <TrendingUp className="h-6 w-6 mb-2" />
                  View Analytics
                </Button>
              </Link>

              <Link href="/dashboard/recipes">
                <Button
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center w-full"
                >
                  <ChefHat className="h-6 w-6 mb-2" />
                  View Recipes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms */}
      <FoodItemForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        item={selectedItem}
        onSuccess={() => {
          setSelectedItem(undefined);
        }}
      />

      <WasteLogForm
        open={showWasteLogForm}
        onOpenChange={setShowWasteLogForm}
        item={selectedItem}
        onSuccess={() => {
          setSelectedItem(undefined);
        }}
      />

      <IngredientSelector
        open={showIngredientSelector}
        onOpenChange={setShowIngredientSelector}
        onGenerateRecipes={handleGenerateRecipes}
        loading={loadingRecipes}
      />

      {/* Recipe Detail Dialog */}
      <RecipeDetailDialog
        recipe={selectedRecipe}
        open={showRecipeDetail}
        onOpenChange={setShowRecipeDetail}
      />
    </DashboardLayout>
  );
}
