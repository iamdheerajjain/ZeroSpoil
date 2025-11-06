"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { wasteLogSchema, type WasteLogFormData } from "@/lib/validations";
import { FoodItem } from "@/types";
import { WASTE_ACTIONS } from "@/lib/constants";
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
import { useAnalytics } from "@/lib/hooks/use-analytics";
import { Leaf, Calendar, Hash, DollarSign, FileText } from "lucide-react";

interface WasteLogFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: FoodItem;
  onSuccess?: () => void;
}

export function WasteLogForm({
  open,
  onOpenChange,
  item,
  onSuccess,
}: WasteLogFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createWasteLog } = useAnalytics();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<WasteLogFormData>({
    resolver: zodResolver(wasteLogSchema),
    defaultValues: {
      food_item_id: item?.id,
      date: new Date().toISOString().split("T")[0],
      quantity: item?.quantity || 1,
      action: "consumed",
    },
  });

  const selectedAction = watch("action");

  const onSubmit = async (data: WasteLogFormData) => {
    try {
      setIsSubmitting(true);
      await createWasteLog(data);
      onSuccess?.();
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("Error creating waste log:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    reset();
  };

  const getEstimatedValue = (action: string, quantity: number) => {
    // Simple estimation based on action and quantity
    const baseValue = 3.5; // Average cost per item
    const multiplier = action === "wasted" ? 1 : 0.8; // Slightly less value for consumed/donated
    return (quantity * baseValue * multiplier).toFixed(2);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "consumed":
        return "✅";
      case "donated":
        return "❤️";
      case "wasted":
        return "😔";
      case "preserved":
        return "🧊";
      case "composted":
        return "🌱";
      default:
        return "📝";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border-0 p-0">
        <DialogHeader className="relative pb-6 px-6 pt-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-white shadow-lg">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Log Food Action
              </DialogTitle>
              {item && (
                <p className="text-sm text-gray-600 mt-1">
                  Recording action for: <strong>{item.name}</strong>
                </p>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Action */}
          <div className="bg-gradient-to-br from-white to-green-50 rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Leaf className="h-5 w-5 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Action Type
              </h3>
            </div>
            
            <div className="relative">
              <div className="relative">
                <Select 
                  {...register("action")}
                  className="h-12 text-base border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 rounded-lg transition-all duration-200 hover:border-gray-300 appearance-none w-full"
                >
                  {WASTE_ACTIONS.map((action) => (
                    <option key={action.value} value={action.value} className="py-2">
                      {getActionIcon(action.value)} {action.label}
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
            {errors.action && (
              <p className="text-sm text-red-600 mt-2">
                {errors.action.message}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Date
              </h3>
            </div>
            
            <Input
              type="date"
              {...register("date")}
              className="h-12 text-base border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-lg transition-all duration-200 hover:border-gray-300"
            />
            {errors.date && (
              <p className="text-sm text-red-600 mt-2">
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <Hash className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Quantity
              </h3>
            </div>
            
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("quantity", { valueAsNumber: true })}
              placeholder={
                item ? `Max: ${item.quantity} ${item.unit}` : "Enter quantity"
              }
              className="h-12 text-base border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg transition-all duration-200 hover:border-gray-300"
            />
            {errors.quantity && (
              <p className="text-sm text-red-600 mt-2">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Estimated Value */}
          <div className="bg-gradient-to-br from-white to-yellow-50 rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Estimated Value ($)
              </h3>
            </div>
            
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("estimated_value", { valueAsNumber: true })}
              placeholder="Optional"
              className="h-12 text-base border-2 border-gray-200 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 rounded-lg transition-all duration-200 hover:border-gray-300"
            />
            {errors.estimated_value && (
              <p className="text-sm text-red-600 mt-2">
                {errors.estimated_value.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-gray-100 rounded-lg mr-3">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Notes
              </h3>
            </div>
            
            <Textarea
              {...register("notes")}
              placeholder="Any additional details about this action..."
              rows={3}
              className="w-full text-base border-2 border-gray-200 focus:border-gray-500 focus:ring-2 focus:ring-gray-500/20 rounded-lg transition-all duration-200 hover:border-gray-300 resize-none"
            />
            {errors.notes && (
              <p className="text-sm text-red-600 mt-2">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* Action Impact Info */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100 shadow-sm">
            <h4 className="text-sm font-semibold text-green-900 mb-3 flex items-center">
              <Leaf className="h-4 w-4 mr-2" />
              Impact of Your Action
            </h4>
            <div className="text-sm text-green-800 space-y-2">
              {selectedAction === "consumed" && (
                <p className="flex items-start">
                  <span className="mr-2">✅</span>
                  <span>Great! You prevented food waste by consuming this item.</span>
                </p>
              )}
              {selectedAction === "donated" && (
                <p className="flex items-start">
                  <span className="mr-2">❤️</span>
                  <span>Excellent! You helped others and prevented waste.</span>
                </p>
              )}
              {selectedAction === "wasted" && (
                <p className="flex items-start">
                  <span className="mr-2">😔</span>
                  <span>This item was wasted. Consider preservation tips for next time.</span>
                </p>
              )}
              {selectedAction === "preserved" && (
                <p className="flex items-start">
                  <span className="mr-2">🧊</span>
                  <span>Smart! You extended the life of this food item.</span>
                </p>
              )}
              {selectedAction === "composted" && (
                <p className="flex items-start">
                  <span className="mr-2">🌱</span>
                  <span>Good choice! You're contributing to sustainable waste management.</span>
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 h-12 text-base font-medium border-2 hover:bg-gray-50 transition-all duration-200 rounded-lg"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 h-12 text-base font-medium bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 rounded-lg"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Logging...
                </div>
              ) : (
                "Log Action"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}