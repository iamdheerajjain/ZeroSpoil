"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { foodItemSchema, type FoodItemFormData } from "@/lib/validations";
import { FoodItem } from "@/types";
import {
  FOOD_CATEGORIES,
  STORAGE_LOCATIONS,
  MEASUREMENT_UNITS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useFoodItems } from "@/lib/hooks/use-food-items";
import {
  Package,
  Calendar,
  MapPin,
  Hash,
  FileText,
  Sparkles,
  Plus,
  Edit3,
} from "lucide-react";

interface FoodItemFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: FoodItem;
  onSuccess?: () => void;
}

export function FoodItemForm({
  open,
  onOpenChange,
  item,
  onSuccess,
}: FoodItemFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const { createFoodItem, updateFoodItem, predictExpiration } = useFoodItems();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FoodItemFormData>({
    resolver: zodResolver(foodItemSchema),
    defaultValues: item
      ? {
          name: item.name,
          category: item.category,
          purchase_date: item.purchase_date,
          expiration_date: item.expiration_date || "",
          storage_location: item.storage_location,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes || "",
          image_url: item.image_url || "",
        }
      : {
          purchase_date: new Date().toISOString().split("T")[0],
          quantity: 1,
          unit: "pieces",
        },
  });

  const watchedFields = watch([
    "name",
    "category",
    "storage_location",
    "purchase_date",
  ]);

  // Auto-predict expiration when key fields change
  useEffect(() => {
    const [name, category, storageLocation, purchaseDate] = watchedFields;

    if (name && category && storageLocation && purchaseDate && !item) {
      const predictExpirationDate = async () => {
        try {
          setPredictionLoading(true);
          const prediction = await predictExpiration(
            name,
            category,
            storageLocation,
            purchaseDate
          );
          setValue("expiration_date", prediction.predicted_expiration);
        } catch (error) {
          console.error("Error predicting expiration:", error);
        } finally {
          setPredictionLoading(false);
        }
      };

      const timeoutId = setTimeout(predictExpirationDate, 1000); // Debounce
      return () => clearTimeout(timeoutId);
    }
  }, watchedFields);

  const onSubmit = async (data: FoodItemFormData) => {
    try {
      setIsSubmitting(true);
      console.log("Submitting food item:", data);

      if (item) {
        const updatedItem = await updateFoodItem(item.id, data);
        console.log("Updated food item:", updatedItem);
      } else {
        const newItem = await createFoodItem(data);
        console.log("Created food item:", newItem);
      }

      onSuccess?.();
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Error saving food item:", error);
      alert(
        `Error saving food item: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0 p-0">
        <DialogHeader className="relative pb-6 px-6 pt-6 bg-gradient-to-r from-primary/5 to-blue-50 rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${
              item 
                ? "bg-blue-100 text-blue-600" 
                : "bg-gradient-to-br from-primary to-blue-600 text-white shadow-lg"
            }`}>
              {item ? (
                <Edit3 className="h-6 w-6" />
              ) : (
                <Plus className="h-6 w-6" />
              )}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 mb-1">
                {item ? "Edit Food Item" : "Add New Food Item"}
              </DialogTitle>
              <p className="text-sm text-gray-600">
                {item
                  ? "Update your food item details"
                  : "Add a new item to your inventory"}
              </p>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Basic Information Section */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-primary/10 rounded-lg mr-3">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <span className="text-primary mr-1">*</span>
                  Item Name
                </label>
                <div className="relative">
                  <Input
                    {...register("name")}
                    placeholder="e.g., Fresh Apples, Organic Milk, Whole Wheat Bread"
                    className="pl-4 pr-4 h-12 text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 hover:border-gray-300"
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <span className="text-primary mr-1">*</span>
                  Category
                </label>
                <div className="relative">
                  <div className="relative">
                    <Select
                      {...register("category")}
                      className="h-12 text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 hover:border-gray-300 appearance-none w-full"
                    >
                      <option value="" className="text-gray-500">
                        Choose a category
                      </option>
                      {FOOD_CATEGORIES.map((category) => (
                        <option
                          key={category}
                          value={category}
                          className="text-gray-900 py-2"
                        >
                          {category}
                        </option>
                      ))}
                    </Select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                {errors.category && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.category.message}
                  </p>
                )}
              </div>

              {/* Storage Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <span className="text-primary mr-1">*</span>
                  Storage Location
                </label>
                <div className="relative">
                  <div className="relative">
                    <Select
                      {...register("storage_location")}
                      className="h-12 text-base border-2 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200 hover:border-gray-300 appearance-none w-full"
                    >
                      <option value="" className="text-gray-500">
                        Select location
                      </option>
                      {STORAGE_LOCATIONS.map((location) => (
                        <option
                          key={location}
                          value={location}
                          className="text-gray-900 py-2"
                        >
                          {location}
                        </option>
                      ))}
                    </Select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                {errors.storage_location && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.storage_location.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Date Information Section */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Date Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Purchase Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <span className="text-primary mr-1">*</span>
                  Purchase Date
                </label>
                <Input
                  type="date"
                  {...register("purchase_date")}
                  className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200 hover:border-gray-300"
                />
                {errors.purchase_date && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.purchase_date.message}
                  </p>
                )}
              </div>

              {/* Expiration Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Expiration Date
                  {predictionLoading && (
                    <span className="ml-2 inline-flex items-center text-primary">
                      <Sparkles className="h-4 w-4 mr-1 animate-pulse" />
                      <span className="text-xs">AI Predicting...</span>
                    </span>
                  )}
                </label>
                <Input
                  type="date"
                  {...register("expiration_date")}
                  className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200 hover:border-gray-300"
                />
                {errors.expiration_date && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.expiration_date.message}
                  </p>
                )}
                {!errors.expiration_date && !item && (
                  <p className="text-xs text-gray-500 mt-2 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    AI will predict this based on your item details
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Information Section */}
          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Hash className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Quantity & Measurement
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <span className="text-primary mr-1">*</span>
                  Quantity
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  {...register("quantity", { valueAsNumber: true })}
                  placeholder="1.0"
                  className="h-12 text-base border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg transition-all duration-200 hover:border-gray-300"
                />
                {errors.quantity && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.quantity.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  <span className="text-primary mr-1">*</span>
                  Unit
                </label>
                <div className="relative">
                  <div className="relative">
                    <Select
                      {...register("unit")}
                      className="h-12 text-base border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg transition-all duration-200 hover:border-gray-300 appearance-none w-full"
                    >
                      {MEASUREMENT_UNITS.map((unit) => (
                        <option
                          key={unit}
                          value={unit}
                          className="text-gray-900 py-2"
                        >
                          {unit}
                        </option>
                      ))}
                    </Select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>
                {errors.unit && (
                  <p className="text-sm text-red-500 mt-2 flex items-center">
                    <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                    {errors.unit.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Notes Section */}
          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Additional Notes
              </h3>
              <span className="text-xs text-gray-500 ml-2">
                (Optional)
              </span>
            </div>

            <div>
              <Textarea
                {...register("notes")}
                placeholder="Add any additional notes about this item (e.g., brand, special storage requirements, dietary notes...)"
                rows={4}
                className="w-full text-base border-2 border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 rounded-lg transition-all duration-200 hover:border-gray-300 resize-none"
              />
              {errors.notes && (
                <p className="text-sm text-red-500 mt-2 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.notes.message}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-12 text-base font-medium border-2 hover:bg-gray-50 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:transform-none disabled:shadow-md rounded-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  {item ? "Updating..." : "Adding Item"}
                </div>
              ) : (
                <div className="flex items-center">
                  {item ? (
                    <>
                      <Edit3 className="h-5 w-5 mr-2" />
                      Update Item
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5 mr-2" />
                      Add to Inventory
                    </>
                  )}
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
