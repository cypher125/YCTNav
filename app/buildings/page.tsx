'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import BuildingCard from '@/components/building-card'
import { useBuildings } from '@/hooks/useBuildings'
import { Input } from '@/components/ui/input'

export default function BuildingsPage() {
  const { buildings, loading, error } = useBuildings()
  const [searchTerm, setSearchTerm] = useState('')

  // Filter buildings based on search term
  const filteredBuildings = buildings.filter((building) => 
    building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    building.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-[#2C3E50]">Campus Buildings</h1>
      
      {/* Search Bar */}
      <div className="mb-8 relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          type="text"
          placeholder="Search buildings by name or department..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[#3498DB]"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-md bg-red-50 p-4 text-center text-red-800">
          <p>{error}</p>
          <p className="text-sm">Please try again later or contact support.</p>
        </div>
      )}

      {/* No Results */}
      {!loading && !error && filteredBuildings.length === 0 && (
        <div className="rounded-md bg-gray-50 p-8 text-center">
          <p className="text-lg text-gray-600">No buildings found matching your search.</p>
        </div>
      )}

      {/* Buildings Grid */}
      {!loading && !error && filteredBuildings.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredBuildings.map((building) => (
            <BuildingCard key={building.id} building={building} />
          ))}
        </div>
      )}
    </div>
  )
} 