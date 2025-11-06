"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  Users,
  ChefHat,
  Lightbulb,
  Heart,
  X,
  Loader2,
  Utensils,
  Timer,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Recipe } from "@/types";

interface RecipeDetailDialogProps {
  recipe: Recipe | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveToggle?: (recipe: Recipe) => void;
}

interface DetailedRecipeInfo {
  id: string;
  title: string;
  description: string;
  detailed_ingredients: {
    name: string;
    quantity: number;
    unit: string;
    notes?: string;
    category?: string;
  }[];
  detailed_instructions: {
    step: number;
    instruction: string;
    technique?: string;
    time_estimate?: number;
    tips?: string;
  }[];
  chef_tips: string[];
  variations: string[];
  nutritional_highlights: string[];
  equipment_needed: string[];
  storage_notes: string;
  wine_pairing?: string;
  skill_techniques: string[];
  estimated_calories_per_serving: number;
}

export function RecipeDetailDialog({
  recipe,
  open,
  onOpenChange,
  onSaveToggle,
}: RecipeDetailDialogProps) {
  const [detailedInfo, setDetailedInfo] = useState<DetailedRecipeInfo | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetailedRecipe = async (recipeId: string) => {
    if (!recipe) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/recipes/${recipeId}/detailed`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipe_title: recipe.title,
          basic_ingredients: recipe.ingredients,
          basic_instructions: recipe.instructions,
          cuisine_type: recipe.cuisine_type,
          difficulty: recipe.difficulty,
          servings: recipe.servings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch detailed recipe information");
      }

      const data = await response.json();
      setDetailedInfo(data.data);
    } catch (err) {
      console.error("Error fetching detailed recipe:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to load detailed recipe information. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && recipe && !detailedInfo) {
      fetchDetailedRecipe(recipe.id);
    }
    if (!newOpen) {
      setDetailedInfo(null);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const formatTime = (minutes?: number) => {
    if (!minutes) return "N/A";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (!recipe) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-gray-900 pr-8">
                {recipe.title}
              </DialogTitle>
              {recipe.description && (
                <p className="text-gray-600 mt-2">{recipe.description}</p>
              )}

              {/* Recipe Meta Info */}
              <div className="flex flex-wrap gap-3 mt-3">
                {recipe.cuisine_type && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    <Utensils className="w-3 h-3 mr-1" />
                    {recipe.cuisine_type}
                  </Badge>
                )}
                {recipe.difficulty && (
                  <Badge
                    variant="outline"
                    className={
                      recipe.difficulty === "easy"
                        ? "border-green-500 text-green-700"
                        : recipe.difficulty === "medium"
                        ? "border-yellow-500 text-yellow-700"
                        : "border-red-500 text-red-700"
                    }
                  >
                    <ChefHat className="w-3 h-3 mr-1" />
                    {recipe.difficulty}
                  </Badge>
                )}
                {recipe.generated && (
                  <Badge
                    variant="default"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                  >
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Generated
                  </Badge>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                {recipe.prep_time && (
                  <div className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    Prep: {formatTime(recipe.prep_time)}
                  </div>
                )}
                {recipe.cook_time && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Cook: {formatTime(recipe.cook_time)}
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    Serves {recipe.servings}
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            {onSaveToggle && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onSaveToggle(recipe)}
                className="ml-2"
              >
                <Heart
                  className={`h-5 w-5 ${
                    recipe.saved ? "fill-current text-red-500" : ""
                  }`}
                />
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <span className="ml-0 mt-4 text-lg font-medium text-gray-700">
              Loading detailed recipe information...
            </span>
            <p className="mt-2 text-gray-600 text-center max-w-md">
              Our AI is generating enhanced details for your recipe
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error Loading Recipe Details</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchDetailedRecipe(recipe.id)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Content */}
        {detailedInfo && (
          <div className="space-y-6">
            {/* Enhanced Description */}
            {detailedInfo.description &&
              detailedInfo.description !== recipe.description && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
                  <p className="text-gray-800 leading-relaxed">
                    {detailedInfo.description}
                  </p>
                </div>
              )}

            {/* Nutritional Info & Calories */}
            {(detailedInfo.nutritional_highlights?.length > 0 ||
              detailedInfo.estimated_calories_per_serving) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-green-600" />
                    Nutritional Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {detailedInfo.estimated_calories_per_serving && (
                      <div className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                        <span className="font-medium text-green-800">
                          Estimated Calories per Serving
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {detailedInfo.estimated_calories_per_serving} cal
                        </span>
                      </div>
                    )}
                    {detailedInfo.nutritional_highlights?.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">
                          Nutritional Highlights
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {detailedInfo.nutritional_highlights.map(
                            (highlight, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="bg-green-100 text-green-800"
                              >
                                {highlight}
                              </Badge>
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Enhanced Ingredients */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detailed Ingredients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedInfo.detailed_ingredients?.length > 0
                    ? detailedInfo.detailed_ingredients.map(
                        (ingredient, index) => (
                          <div
                            key={index}
                            className="flex items-start justify-between border-b border-gray-100 pb-2 last:border-0"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">
                                {ingredient.name}
                              </span>
                              {ingredient.notes && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {ingredient.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="font-medium text-gray-700">
                                {ingredient.quantity} {ingredient.unit}
                              </span>
                              {ingredient.category && (
                                <p className="text-xs text-gray-500">
                                  {ingredient.category}
                                </p>
                              )}
                            </div>
                          </div>
                        )
                      )
                    : recipe.ingredients.map((ingredient, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-0"
                        >
                          <span className="font-medium text-gray-900">
                            {ingredient.name}
                          </span>
                          <span className="text-gray-700">
                            {ingredient.quantity} {ingredient.unit}
                          </span>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>

            {/* Equipment Needed */}
            {detailedInfo.equipment_needed?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Equipment Needed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {detailedInfo.equipment_needed.map((equipment, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-gray-300"
                      >
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Detailed Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Step-by-Step Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {detailedInfo.detailed_instructions?.length > 0
                    ? detailedInfo.detailed_instructions.map((step, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {step.step}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-800 leading-relaxed">
                                {step.instruction}
                              </p>

                              <div className="mt-3 space-y-2">
                                {step.technique && (
                                  <p className="text-sm text-blue-700 bg-blue-50 rounded px-2 py-1 inline-block">
                                    <strong>Technique:</strong> {step.technique}
                                  </p>
                                )}
                                {step.time_estimate && (
                                  <p className="text-sm text-gray-600">
                                    <Clock className="w-3 h-3 inline mr-1" />
                                    Estimated time: {step.time_estimate} minutes
                                  </p>
                                )}
                                {step.tips && (
                                  <p className="text-sm text-green-700 bg-green-50 rounded px-2 py-1">
                                    <strong>Pro Tip:</strong> {step.tips}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    : recipe.instructions.map((instruction, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                              {index + 1}
                            </div>
                            <p className="text-gray-800 leading-relaxed flex-1">
                              {instruction}
                            </p>
                          </div>
                        </div>
                      ))}
                </div>
              </CardContent>
            </Card>

            {/* Chef Tips & Techniques */}
            {(detailedInfo.chef_tips?.length > 0 ||
              detailedInfo.skill_techniques?.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-orange-600" />
                    Chef Tips & Techniques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {detailedInfo.chef_tips?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">
                        Professional Tips
                      </h4>
                      <div className="space-y-2">
                        {detailedInfo.chef_tips.map((tip, index) => (
                          <div
                            key={index}
                            className="flex items-start gap-2 bg-orange-50 rounded-lg p-3"
                          >
                            <Lightbulb className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                            <p className="text-gray-800 text-sm leading-relaxed">
                              {tip}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailedInfo.skill_techniques?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Cooking Techniques Used
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {detailedInfo.skill_techniques.map(
                          (technique, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-orange-100 text-orange-800"
                            >
                              {technique}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Variations */}
            {detailedInfo.variations?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recipe Variations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {detailedInfo.variations.map((variation, index) => (
                      <div key={index} className="bg-purple-50 rounded-lg p-3">
                        <p className="text-gray-800 text-sm leading-relaxed">
                          {variation}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Storage & Wine Pairing */}
            <div className="grid md:grid-cols-2 gap-4">
              {detailedInfo.storage_notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Storage Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {detailedInfo.storage_notes}
                    </p>
                  </CardContent>
                </Card>
              )}

              {detailedInfo.wine_pairing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Wine Pairing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-800 text-sm leading-relaxed">
                      {detailedInfo.wine_pairing}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
