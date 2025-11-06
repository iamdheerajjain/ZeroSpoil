"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFoodItems } from "@/lib/hooks/use-food-items";
import { FoodItem } from "@/types";
import { Sparkles, ChefHat, Package, Calendar, MapPin } from "lucide-react";
import { formatRelativeDate, getStatusColor } from "@/lib/utils";

interface IngredientSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateRecipes: (selectedIngredients: string[]) => void;
  loading?: boolean;
}

export function IngredientSelector({
  open,
  onOpenChange,
  onGenerateRecipes,
  loading = false,
}: IngredientSelectorProps) {
  const { foodItems, loading: foodLoading } = useFoodItems();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<
    "all" | "expiring" | "fresh"
  >("all");

  // Filter items based on priority
  const filteredItems = foodItems.filter((item) => {
    if (priorityFilter === "expiring") {
      return item.status === "expiring_soon";
    }
    if (priorityFilter === "fresh") {
      return item.status === "fresh";
    }
    return item.status !== "expired"; // Show all except expired
  });

  // Group items by status for better organization
  const groupedItems = {
    expiring_soon: filteredItems.filter(
      (item) => item.status === "expiring_soon"
    ),
    fresh: filteredItems.filter((item) => item.status === "fresh"),
  };

  const handleItemToggle = (itemName: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((name) => name !== itemName)
        : [...prev, itemName]
    );
  };

  const handleSelectAll = (items: FoodItem[]) => {
    const itemNames = items.map((item) => item.name);
    setSelectedItems((prev) => {
      const newSelection = [...prev];
      itemNames.forEach((name) => {
        if (!newSelection.includes(name)) {
          newSelection.push(name);
        }
      });
      return newSelection;
    });
  };

  const handleClearAll = () => {
    setSelectedItems([]);
  };

  const handleGenerateRecipes = () => {
    if (selectedItems.length > 0) {
      onGenerateRecipes(selectedItems);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "fresh":
        return "success";
      case "expiring_soon":
        return "warning";
      case "expired":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
              <ChefHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="text-primary font-semibold">
                AI Recipe Generator
              </span>
              <p className="text-sm font-normal text-secondary-600 mt-1">
                Choose ingredients and let AI create amazing recipes for you!
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full px-6 pb-6">
          {/* Enhanced Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-gray-800">
                  Filter by status:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={priorityFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriorityFilter("all")}
                  className="relative overflow-hidden transition-all hover:shadow-md bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <span className="relative z-10 flex items-center">
                    <Package className="mr-1 h-3 w-3" />
                    All Items ({filteredItems.length})
                  </span>
                </Button>
                <Button
                  variant={
                    priorityFilter === "expiring" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setPriorityFilter("expiring")}
                  className="relative overflow-hidden transition-all hover:shadow-md text-orange-700 border-orange-300 bg-orange-50 hover:bg-orange-100"
                >
                  <Calendar className="mr-1 h-3 w-3" />
                  <span className="relative z-10">
                    Expiring ({groupedItems.expiring_soon.length})
                  </span>
                </Button>
                <Button
                  variant={priorityFilter === "fresh" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPriorityFilter("fresh")}
                  className="relative overflow-hidden transition-all hover:shadow-md text-green-700 border-green-300 bg-green-50 hover:bg-green-100"
                >
                  <Package className="mr-1 h-3 w-3" />
                  <span className="relative z-10">
                    Fresh ({groupedItems.fresh.length})
                  </span>
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSelectAll(filteredItems)}
                disabled={filteredItems.length === 0}
                className="transition-all hover:shadow-md hover:scale-105"
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Select All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                disabled={selectedItems.length === 0}
                className="transition-all hover:shadow-md hover:scale-105"
              >
                Clear All
              </Button>
            </div>
          </div>

          {/* Enhanced Selected Items Summary */}
          {selectedItems.length > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-primary">
                      {selectedItems.length} ingredient
                      {selectedItems.length !== 1 ? "s" : ""} selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedItems.slice(0, 10).map((item) => (
                      <Badge
                        key={item}
                        variant="secondary"
                        className="text-xs px-2 py-1 bg-white/80 dark:bg-gray-800/80 border border-primary/20 text-gray-700 dark:text-gray-300 hover:bg-primary/10 transition-colors"
                      >
                        {item}
                      </Badge>
                    ))}
                    {selectedItems.length > 10 && (
                      <Badge
                        variant="secondary"
                        className="text-xs bg-primary/20 text-primary border-primary/30"
                      >
                        +{selectedItems.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Items List */}
          <div
            className="flex-1 overflow-y-auto pr-2"
            style={{ maxHeight: "calc(90vh - 400px)" }}
          >
            {foodLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse flex items-center space-x-4 p-5 border rounded-xl bg-white shadow-sm border-gray-200"
                  >
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="flex space-x-2">
                        <div className="h-5 bg-gray-200 rounded w-16"></div>
                        <div className="h-5 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                    <div className="w-20 h-8 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
                  <Package className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  No ingredients available
                </h3>
                <p className="text-gray-600 max-w-md mx-auto leading-relaxed mb-8">
                  Add some food items to your inventory first, then come back to
                  generate amazing AI recipes!
                </p>
                <Button 
                  onClick={() => {
                    onOpenChange(false);
                    // Navigate to inventory page
                    window.location.href = '/inventory';
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  <Package className="mr-2 h-4 w-4" />
                  Add Food Items
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Expiring Soon Items */}
                {groupedItems.expiring_soon.length > 0 &&
                  (priorityFilter === "all" ||
                    priorityFilter === "expiring") && (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-orange-800 dark:text-orange-200 flex items-center text-lg">
                            <Calendar className="mr-2 h-5 w-5" />⚡ Use These
                            First!
                          </h4>
                          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                            {groupedItems.expiring_soon.length} ingredient
                            {groupedItems.expiring_soon.length !== 1
                              ? "s"
                              : ""}{" "}
                            expiring soon
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleSelectAll(groupedItems.expiring_soon)
                          }
                          className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/30"
                        >
                          Select All
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {groupedItems.expiring_soon.map((item) => (
                          <IngredientCard
                            key={item.id}
                            item={item}
                            selected={selectedItems.includes(item.name)}
                            onToggle={() => handleItemToggle(item.name)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                {/* Fresh Items */}
                {groupedItems.fresh.length > 0 &&
                  (priorityFilter === "all" || priorityFilter === "fresh") && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-green-800 dark:text-green-200 flex items-center text-lg">
                            <Package className="mr-2 h-5 w-5" />
                            🌿 Fresh & Ready
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                            {groupedItems.fresh.length} fresh ingredient
                            {groupedItems.fresh.length !== 1 ? "s" : ""}{" "}
                            available
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSelectAll(groupedItems.fresh)}
                          className="border-green-300 text-green-700 hover:bg-green-100 dark:border-green-600 dark:text-green-300 dark:hover:bg-green-900/30"
                        >
                          Select All
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {groupedItems.fresh.map((item) => (
                          <IngredientCard
                            key={item.id}
                            item={item}
                            selected={selectedItems.includes(item.name)}
                            onToggle={() => handleItemToggle(item.name)}
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200 mt-6 bg-gradient-to-r from-gray-50 to-gray-100 -mx-6 px-6 py-4 rounded-b-2xl">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <Sparkles className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-sm text-gray-700">
                {selectedItems.length > 0
                  ? `Ready to generate recipes with ${
                      selectedItems.length
                    } ingredient${selectedItems.length !== 1 ? "s" : ""}`
                  : "Select at least one ingredient to continue"}
              </div>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
                className="transition-all hover:shadow-md border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button
                onClick={handleGenerateRecipes}
                disabled={selectedItems.length === 0 || loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none disabled:hover:scale-100 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generating Recipes...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate AI Recipes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface IngredientCardProps {
  item: FoodItem;
  selected: boolean;
  onToggle: () => void;
}

function IngredientCard({ item, selected, onToggle }: IngredientCardProps) {
  const isExpiring = item.status === "expiring_soon";

  return (
    <div
      className={`group relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
        selected
          ? "border-primary bg-gradient-to-r from-primary/10 to-primary/5 shadow-lg scale-[1.02] ring-2 ring-primary/20"
          : isExpiring
          ? "border-orange-200 bg-orange-50/50 hover:border-orange-300 hover:bg-orange-50 hover:shadow-md dark:border-orange-800 dark:bg-orange-900/10 dark:hover:bg-orange-900/20"
          : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
      } ${selected ? "transform" : "hover:scale-[1.01]"}`}
      onClick={onToggle}
    >
      {/* Selection Indicator */}
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      )}

      <div className="flex items-start space-x-4">
        <Checkbox
          checked={selected}
          onChange={onToggle}
          className="mt-1 transition-transform group-hover:scale-110"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <h5 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-base leading-tight">
              {item.name}
            </h5>
            <Badge
              variant={isExpiring ? "warning" : "success"}
              className={`ml-2 px-2 py-1 text-xs font-medium ${
                isExpiring
                  ? "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-200 dark:border-orange-700"
                  : "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700"
              }`}
            >
              {item.status.replace("_", " ")}
            </Badge>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <div className="flex items-center">
              <Package className="mr-2 h-4 w-4 text-gray-400" />
              <span className="font-medium">
                {item.quantity} {item.unit}
              </span>
              <span className="mx-2">•</span>
              <span className="text-gray-500">{item.category}</span>
            </div>

            <div className="flex items-center">
              <MapPin className="mr-2 h-4 w-4 text-gray-400" />
              <span>{item.storage_location}</span>
            </div>

            {item.expiration_date && (
              <div
                className={`flex items-center ${
                  isExpiring ? "text-orange-600 dark:text-orange-400" : ""
                }`}
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span className="font-medium">
                  Expires {formatRelativeDate(item.expiration_date)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
