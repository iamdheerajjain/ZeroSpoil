"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { FoodItemCard } from "@/components/features/food-items/food-item-card"
import { FoodItemForm } from "@/components/features/food-items/food-item-form"
import { FoodItemsFilters } from "@/components/features/food-items/food-items-filters"
import { WasteLogForm } from "@/components/features/food-items/waste-log-form"
import { useFoodItems } from "@/lib/hooks/use-food-items"
import { FoodItem } from "@/types"
import { motion, AnimatePresence } from "framer-motion"

export default function FoodItemsPage() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showWasteLogForm, setShowWasteLogForm] = useState(false)
  const [selectedItem, setSelectedItem] = useState<FoodItem | undefined>()

  const { 
    foodItems, 
    loading, 
    error, 
    filters, 
    setFilters, 
    deleteFoodItem 
  } = useFoodItems()

  const handleEditItem = (item: FoodItem) => {
    setSelectedItem(item)
    setShowEditForm(true)
  }

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteFoodItem(id)
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleCreateWasteLog = (item: FoodItem) => {
    setSelectedItem(item)
    setShowWasteLogForm(true)
  }

  const filteredItems = foodItems.filter(item => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      if (!item.name.toLowerCase().includes(searchLower) &&
          !item.category.toLowerCase().includes(searchLower)) {
        return false
      }
    }
    return true
  })

  return (
    <DashboardLayout
      title="Food Items"
      description={`Manage your food inventory (${filteredItems.length} items)`}
      action={{
        label: "Add Food Item",
        onClick: () => {
          setSelectedItem(undefined)
          setShowAddForm(true)
        }
      }}
    >
      <div className="space-y-6">
        {/* Filters */}
        <FoodItemsFilters
          filters={filters}
          onFiltersChange={setFilters}
        />

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Items
              </h3>
              <p className="text-gray-600 mb-6">
                There was an error loading your food items: {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-2 rounded-lg hover:from-primary/90 hover:to-blue-700 transition-all shadow-md hover:shadow-lg"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="h-24 w-24 bg-gradient-to-br from-primary/10 to-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <svg className="h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {foodItems.length === 0 ? "No Food Items Yet" : "No Matching Items"}
              </h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                {foodItems.length === 0 
                  ? "Start by adding your first food item to track expiration dates and reduce waste."
                  : "Try adjusting your filters to see more items."
                }
              </p>
              {foodItems.length === 0 && (
                <button
                  onClick={() => {
                    setSelectedItem(undefined)
                    setShowAddForm(true)
                  }}
                  className="bg-gradient-to-r from-primary to-blue-600 text-white px-6 py-3 rounded-lg hover:from-primary/90 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-medium"
                >
                  Add Your First Item
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredItems.map((item) => (
                <FoodItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onCreateWasteLog={handleCreateWasteLog}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Forms */}
      <FoodItemForm
        open={showAddForm}
        onOpenChange={setShowAddForm}
        onSuccess={() => {
          setSelectedItem(undefined)
        }}
      />

      <FoodItemForm
        open={showEditForm}
        onOpenChange={setShowEditForm}
        item={selectedItem}
        onSuccess={() => {
          setSelectedItem(undefined)
        }}
      />

      <WasteLogForm
        open={showWasteLogForm}
        onOpenChange={setShowWasteLogForm}
        item={selectedItem}
        onSuccess={() => {
          setSelectedItem(undefined)
        }}
      />
    </DashboardLayout>
  )
}