"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useRecipes } from "@/lib/hooks/use-recipes";
import { useFoodItems } from "@/lib/hooks/use-food-items";
import { IngredientSelector } from "@/components/features/recipes/ingredient-selector";
import { RecipeDetailDialog } from "@/components/features/recipes/recipe-detail-dialog";
import {
  CUISINE_TYPES,
  DIETARY_TAGS,
  RECIPE_DIFFICULTY,
} from "@/lib/constants";
import {
  ChefHat,
  Clock,
  Users,
  Heart,
  Search,
  Sparkles,
  BookOpen,
  Package,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Recipe } from "@/types";

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState("");
  const [selectedDietary, setSelectedDietary] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [showSavedOnly, setShowSavedOnly] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [showIngredientSelector, setShowIngredientSelector] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);

  // Debug effect to monitor suggestions
  useEffect(() => {
    console.log('Suggestions state changed:', suggestions.length, 'recipes');
  }, [suggestions]);

  const { recipes, loading, saveRecipe, unsaveRecipe, getRecipeSuggestions } =
    useRecipes({
      cuisine_type: selectedCuisine,
      dietary_tags: selectedDietary,
      difficulty: selectedDifficulty as any,
      saved_only: showSavedOnly,
    });

  const { foodItems } = useFoodItems();

  const filteredRecipes = recipes.filter((recipe) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        recipe.title.toLowerCase().includes(searchLower) ||
        recipe.description?.toLowerCase().includes(searchLower)
      );
    }
    return true;
  });

  const handleGetSuggestions = async (selectedIngredients: string[]) => {
    if (selectedIngredients.length === 0) return;

    try {
      setLoadingSuggestions(true);
      console.log(
        "Generating AI recipes with selected ingredients:",
        selectedIngredients
      );

      const recipeSuggestions = await getRecipeSuggestions(
        selectedIngredients,
        {
          max_results: 6,
        }
      );
      console.log('Received recipe suggestions:', recipeSuggestions.length, recipeSuggestions);
      console.log('Setting suggestions state with:', recipeSuggestions.length, 'recipes');
      setSuggestions(recipeSuggestions);
      console.log('Suggestions state updated');
      setShowIngredientSelector(false); // Close the selector
    } catch (error) {
      console.error("Error getting recipe suggestions:", error);
      alert("Failed to generate recipes. Please try again.");
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleToggleSave = async (recipe: any) => {
    try {
      if (recipe.saved) {
        await unsaveRecipe(recipe.id);
      } else {
        await saveRecipe(recipe.id);
      }
    } catch (error) {
      console.error("Error toggling recipe save:", error);
    }
  };

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeDetail(true);
  };

  const handleSuggestionClick = (suggestion: any) => {
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "success";
      case "medium":
        return "warning";
      case "hard":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <DashboardLayout
      title="Recipes"
      description="Discover recipes and get personalized suggestions based on your ingredients"
    >
      <div className="space-y-6">
        {/* AI Suggestions Section */}
        <Card className="shadow-lg border-2 border-gradient-to-r from-purple-500/20 to-pink-500/20 bg-gradient-to-br from-white to-purple-50">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-gray-900">AI-Powered Recipe Suggestions</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">Get personalized recipes based on your available ingredients</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      setLoadingSuggestions(true);
                      const ingredients = foodItems
                        .filter(
                          (item) =>
                            item.status === "expiring_soon" ||
                            item.status === "fresh"
                        )
                        .slice(0, 8)
                        .map((item) => item.name);

                      if (ingredients.length > 0) {
                        const response = await fetch("/api/ai/meal-plan", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            available_ingredients: ingredients,
                            days: 3,
                            meals_per_day: 3,
                          }),
                        });

                        if (response.ok) {
                          const result = await response.json();
                          console.log("Meal plan generated:", result);
                          alert(
                            "Meal plan generated! Check console for details."
                          );
                        }
                      }
                    } catch (error) {
                      console.error("Error generating meal plan:", error);
                      alert("Failed to generate meal plan. Please try again.");
                    } finally {
                      setLoadingSuggestions(false);
                    }
                  }}
                  disabled={loadingSuggestions || foodItems.length === 0}
                  className="transition-all hover:shadow-md border-gray-300 hover:border-purple-300"
                >
                  {loadingSuggestions ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500 mr-2"></div>
                      Planning...
                    </>
                  ) : (
                    "Generate Meal Plan"
                  )}
                </Button>
                <Button
                  onClick={() => setShowIngredientSelector(true)}
                  disabled={loadingSuggestions || foodItems.length === 0}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none disabled:hover:scale-100"
                >
                  {loadingSuggestions ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Getting Suggestions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Get AI Recipes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {foodItems.length === 0 ? (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="h-20 w-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ingredients Found</h3>
                  <p className="text-gray-600 mb-6">Add some food items to your inventory to get personalized AI recipe suggestions!</p>
                  <Button 
                    onClick={() => window.location.href = '/inventory'}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white"
                  >
                    Add Food Items
                  </Button>
                </div>
              </div>
            ) : suggestions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {suggestions.map((recipe, index) => (
                  <motion.div
                    key={recipe.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="h-full hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-primary/30 hover:scale-[1.02]"
                      onClick={() => handleSuggestionClick(recipe)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 flex-1 line-clamp-2">
                            {recipe.title}
                          </h4>
                          {recipe.generated && (
                            <Badge
                              variant="default"
                              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white ml-2 flex-shrink-0"
                            >
                              <Sparkles className="mr-1 h-3 w-3" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {recipe.description ||
                            "A delicious recipe using your selected ingredients"}
                        </p>
                        {recipe.match_percentage && (
                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-500">Ingredient Match</span>
                              <span className="font-medium text-gray-900">{recipe.match_percentage}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full" 
                                style={{ width: `${recipe.match_percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {recipe.prep_time && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="mr-1 h-3 w-3" />
                              {recipe.prep_time}m
                            </Badge>
                          )}
                          {recipe.cook_time && (
                            <Badge variant="outline" className="text-xs">
                              <ChefHat className="mr-1 h-3 w-3" />
                              {recipe.cook_time}m
                            </Badge>
                          )}
                          {recipe.servings && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="mr-1 h-3 w-3" />
                              {recipe.servings}
                            </Badge>
                          )}
                          {recipe.difficulty && (
                            <Badge 
                              variant="outline" 
                              className="text-xs capitalize"
                            >
                              {recipe.difficulty}
                            </Badge>
                          )}
                        </div>
                        {recipe.dietary_tags && recipe.dietary_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {recipe.dietary_tags.slice(0, 3).map((tag: string, idx: number) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="text-xs bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {recipe.dietary_tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                +{recipe.dietary_tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                        {recipe.tips && recipe.tips.length > 0 && (
                          <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg border border-blue-100">
                            <div className="flex items-start">
                              <span className="mr-1">💡</span>
                              <span>{recipe.tips[0]}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="h-20 w-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="h-10 w-10 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Create Magic?</h3>
                  <p className="text-gray-600 mb-6">Click "Get AI Recipes" to select ingredients and generate personalized recipes!</p>
                  <Button 
                    onClick={() => setShowIngredientSelector(true)}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get AI Recipes
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search recipes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Cuisine Filter */}
              <div className="relative">
                <Select
                  value={selectedCuisine}
                  onChange={(e) => setSelectedCuisine(e.target.value)}
                  className="appearance-none w-full"
                >
                  <option value="">All Cuisines</option>
                  {CUISINE_TYPES.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>
                      {cuisine}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Dietary Filter */}
              <div className="relative">
                <Select
                  value={selectedDietary}
                  onChange={(e) => setSelectedDietary(e.target.value)}
                  className="appearance-none w-full"
                >
                  <option value="">All Dietary</option>
                  {DIETARY_TAGS.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Difficulty Filter */}
              <div className="relative">
                <Select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="appearance-none w-full"
                >
                  <option value="">All Difficulties</option>
                  {RECIPE_DIFFICULTY.map((diff) => (
                    <option key={diff.value} value={diff.value}>
                      {diff.label}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Saved Only Toggle */}
              <Button
                variant={showSavedOnly ? "default" : "outline"}
                onClick={() => setShowSavedOnly(!showSavedOnly)}
                className="flex items-center transition-all hover:shadow-md"
              >
                <Heart
                  className={`mr-2 h-4 w-4 ${
                    showSavedOnly ? "fill-current" : ""
                  }`}
                />
                Saved Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recipes Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-12"></div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    <div className="h-5 bg-gray-200 rounded w-12"></div>
                    <div className="h-5 bg-gray-200 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 rounded w-10"></div>
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                    <div className="h-8 bg-gray-200 rounded-full w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="h-24 w-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <BookOpen className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {recipes.length === 0
                  ? "No recipes found"
                  : "No recipes match your filters"}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {recipes.length === 0
                  ? "Try getting AI suggestions based on your ingredients, or browse public recipes."
                  : "Try adjusting your filters to see more recipes."}
              </p>
              {recipes.length === 0 && (
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button 
                    onClick={() => setShowIngredientSelector(true)}
                    className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Recipes
                  </Button>
                  <Button variant="outline">
                    Browse All Recipes
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card
                    className="h-full hover:shadow-lg transition-all cursor-pointer border-2 border-transparent hover:border-primary/30 hover:scale-[1.02]"
                    onClick={() => handleRecipeClick(recipe)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg line-clamp-2">
                            {recipe.title}
                          </CardTitle>
                          {recipe.description && (
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {recipe.description}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent card click when clicking save button
                            handleToggleSave(recipe);
                          }}
                          className="ml-2 hover:bg-red-50 hover:text-red-500 transition-colors"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              recipe.saved ? "fill-current text-red-500" : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      {/* Recipe Info */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {recipe.prep_time && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {recipe.prep_time}m prep
                          </Badge>
                        )}
                        {recipe.cook_time && (
                          <Badge variant="outline" className="text-xs">
                            <ChefHat className="mr-1 h-3 w-3" />
                            {recipe.cook_time}m cook
                          </Badge>
                        )}
                        {recipe.servings && (
                          <Badge variant="outline" className="text-xs">
                            <Users className="mr-1 h-3 w-3" />
                            {recipe.servings} servings
                          </Badge>
                        )}
                        {recipe.difficulty && (
                          <Badge
                            variant={getDifficultyColor(recipe.difficulty)}
                            className="text-xs capitalize"
                          >
                            {recipe.difficulty}
                          </Badge>
                        )}
                      </div>

                      {/* Tags */}
                      {recipe.dietary_tags &&
                        recipe.dietary_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {recipe.dietary_tags.slice(0, 3).map((tag: string) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </Badge>
                            ))}
                            {recipe.dietary_tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                +{recipe.dietary_tags.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}

                      {/* Ingredients Preview */}
                      {recipe.ingredients && recipe.ingredients.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">
                            Ingredients:
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {recipe.ingredients
                              .slice(0, 3)
                              .map((ing: any) =>
                                typeof ing === "string" ? ing : ing.name
                              )
                              .join(", ")}
                            {recipe.ingredients.length > 3 && "..."}
                          </p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {recipe.generated && (
                            <Badge
                              variant="default"
                              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs"
                            >
                              <Sparkles className="mr-1 h-3 w-3" />
                              AI
                            </Badge>
                          )}
                        </div>

                        {recipe.cuisine_type && (
                          <Badge variant="secondary" className="text-xs">
                            {recipe.cuisine_type}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Ingredient Selector Modal */}
        <IngredientSelector
          open={showIngredientSelector}
          onOpenChange={setShowIngredientSelector}
          onGenerateRecipes={handleGetSuggestions}
          loading={loadingSuggestions}
        />

        {/* Recipe Detail Dialog */}
        <RecipeDetailDialog
          recipe={selectedRecipe}
          open={showRecipeDetail}
          onOpenChange={setShowRecipeDetail}
          onSaveToggle={handleToggleSave}
        />
      </div>
    </DashboardLayout>
  );
}
