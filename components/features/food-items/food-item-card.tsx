"use client"

import { useState } from "react"
import { FoodItem } from "@/types"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate, formatRelativeDate, getStatusColor } from "@/lib/utils"
import { Edit, Trash2, Calendar, MapPin, Package } from "lucide-react"
import { motion } from "framer-motion"

interface FoodItemCardProps {
  item: FoodItem
  onEdit: (item: FoodItem) => void
  onDelete: (id: string) => void
  onCreateWasteLog: (item: FoodItem) => void
}

export function FoodItemCard({ item, onEdit, onDelete, onCreateWasteLog }: FoodItemCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      setIsDeleting(true)
      try {
        await onDelete(item.id)
      } catch (error) {
        console.error("Error deleting item:", error)
        setIsDeleting(false)
      }
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'fresh':
        return 'success'
      case 'expiring_soon':
        return 'warning'
      case 'expired':
        return 'danger'
      default:
        return 'default'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 border border-gray-200 rounded-xl overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.category}</p>
            </div>
            <Badge 
              variant={getStatusBadgeVariant(item.status)}
              className="text-xs font-semibold capitalize"
            >
              {item.status.replace('_', ' ')}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          {/* Item details */ }
          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-700">
              <div className="p-2 bg-blue-50 rounded-lg mr-3">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium">{item.quantity} {item.unit}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-700">
              <div className="p-2 bg-green-50 rounded-lg mr-3">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <span>{item.storage_location}</span>
            </div>
            
            {item.expiration_date && (
              <div className="flex items-center text-sm text-gray-700">
                <div className="p-2 bg-orange-50 rounded-lg mr-3">
                  <Calendar className="h-4 w-4 text-orange-600" />
                </div>
                <span>Expires {formatRelativeDate(item.expiration_date)}</span>
              </div>
            )}
            
            {item.predicted_expiration && (
              <div className="flex items-center text-sm text-gray-600 bg-purple-50 p-2 rounded-lg">
                <Calendar className="mr-2 h-4 w-4 text-purple-600" />
                <span>
                  Predicted: {formatDate(item.predicted_expiration)}
                  {item.prediction_confidence && (
                    <span className="ml-1 text-xs">
                      ({Math.round(item.prediction_confidence * 100)}% confidence)
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Notes */ }
          {item.notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-700">{item.notes}</p>
            </div>
          )}

          {/* Actions */ }
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item)}
                className="border-2 hover:bg-blue-50 hover:border-blue-200 text-blue-700"
              >
                <Edit className="mr-1 h-3 w-3" />
                Edit
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCreateWasteLog(item)}
                className="border-2 hover:bg-purple-50 hover:border-purple-200 text-purple-700"
              >
                Log Action
              </Button>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2"
            >
              {isDeleting ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}