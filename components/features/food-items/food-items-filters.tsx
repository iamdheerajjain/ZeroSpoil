"use client"

import { Select } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { FOOD_CATEGORIES, STORAGE_LOCATIONS, FOOD_STATUS } from "@/lib/constants"
import { FoodItemFilters } from "@/lib/validations"
import { Search } from "lucide-react"

interface FoodItemsFiltersProps {
  filters: FoodItemFilters
  onFiltersChange: (filters: FoodItemFilters) => void
}

export function FoodItemsFilters({ filters, onFiltersChange }: FoodItemsFiltersProps) {
  const updateFilter = (key: keyof FoodItemFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    })
  }

  return (
    <div className="bg-white p-4 rounded-lg border space-y-4">
      <h3 className="font-medium text-gray-900">Filters</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search items..."
            value={filters.search || ""}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status}
          onChange={(e) => updateFilter('status', e.target.value)}
        >
          <option value="all">All Status</option>
          {FOOD_STATUS.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>

        {/* Category Filter */}
        <Select
          value={filters.category || ""}
          onChange={(e) => updateFilter('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {FOOD_CATEGORIES.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>

        {/* Storage Location Filter */}
        <Select
          value={filters.storage_location || ""}
          onChange={(e) => updateFilter('storage_location', e.target.value)}
        >
          <option value="">All Locations</option>
          {STORAGE_LOCATIONS.map(location => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </Select>
      </div>

      {/* Active filters count */}
      {(filters.search || filters.category || filters.storage_location || filters.status !== 'all') && (
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-gray-600">
            {Object.values(filters).filter(v => v && v !== 'all').length} filter(s) active
          </span>
          <button
            onClick={() => onFiltersChange({ status: 'all' })}
            className="text-sm text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}