"use client"

import type React from "react"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import BuildingDetails from "@/components/building-details"
import { buildings } from "@/lib/data"
import type { Building } from "@/lib/types"

// Dynamically import the Map component to avoid SSR issues with Leaflet
const CampusMap = dynamic(() => import("@/components/campus-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-12rem)] items-center justify-center bg-gray-100">
      <div className="text-lg font-medium text-gray-500">Loading map...</div>
    </div>
  ),
})

export default function MapPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    const found = buildings.find((building) => building.name.toLowerCase().includes(searchQuery.toLowerCase()))

    if (found) {
      setSelectedBuilding(found)
      setShowDetails(true)
    }
  }

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building)
    setShowDetails(true)
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
  }

  const BuildingsList = () => (
    <div className="h-full overflow-y-auto">
      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search buildings..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" className="bg-[#3498DB] hover:bg-[#3498DB]/90">
          Search
        </Button>
      </form>

      <div className="space-y-2">
        <h3 className="mb-3 font-medium text-[#2C3E50]">Campus Buildings</h3>
        {buildings.map((building) => (
          <div
            key={building.id}
            className={`cursor-pointer rounded-md p-3 transition-colors ${
              selectedBuilding?.id === building.id ? "bg-[#3498DB] text-white" : "bg-gray-100 hover:bg-gray-200"
            }`}
            onClick={() => handleBuildingSelect(building)}
          >
            <h4 className="font-medium">{building.name}</h4>
            <p className={`text-sm ${selectedBuilding?.id === building.id ? "text-white/90" : "text-gray-600"}`}>
              {building.department}
            </p>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="relative flex h-[calc(100vh-4rem)] flex-col">
      {/* Mobile View */}
      <div className="block p-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <Search className="mr-2 h-4 w-4" />
              Search Buildings
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-lg">
            <BuildingsList />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop View */}
      <div className="hidden h-full md:grid md:grid-cols-[350px_1fr]">
        <div className="border-r p-4">
          <BuildingsList />
        </div>
        <div className="relative">
          <CampusMap
            buildings={buildings}
            selectedBuilding={selectedBuilding}
            onBuildingSelect={handleBuildingSelect}
          />
          {showDetails && selectedBuilding && (
            <BuildingDetails building={selectedBuilding} onClose={handleCloseDetails} />
          )}
        </div>
      </div>

      {/* Mobile Map View */}
      <div className="relative flex-1 md:hidden">
        <CampusMap buildings={buildings} selectedBuilding={selectedBuilding} onBuildingSelect={handleBuildingSelect} />
        {showDetails && selectedBuilding && (
          <BuildingDetails building={selectedBuilding} onClose={handleCloseDetails} />
        )}
      </div>
    </div>
  )
}

