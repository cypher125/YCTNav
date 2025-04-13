"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Search, Menu, X, MapPin, Building, Settings, ChevronLeft, ChevronRight, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer"
import { Badge } from "@/components/ui/badge"
import BuildingDetails from "@/components/building-details"
import { useBuildings } from "@/hooks/useBuildings"
import type { Building } from "@/lib/types"

// Dynamically import the Map component to avoid SSR issues with Leaflet
const CampusMap = dynamic(() => import("@/components/campus-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[calc(100vh-12rem)] items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="flex flex-col items-center gap-3 rounded-lg bg-white p-6 shadow-lg">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[var(--yabatech-green)]"></div>
        <div className="text-lg font-medium text-gray-700">Loading map...</div>
        <p className="text-sm text-gray-500">Preparing the campus view</p>
      </div>
    </div>
  ),
})

export default function MapPage() {
  const { buildings, loading, error } = useBuildings()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [filtered, setFiltered] = useState<Building[]>([])
  const sidebarRef = useRef<HTMLDivElement>(null)
  
  // Filter buildings based on search query
  useEffect(() => {
    if (buildings.length > 0) {
      if (searchQuery.trim() === "") {
        setFiltered(buildings)
      } else {
        const query = searchQuery.toLowerCase()
        setFiltered(
          buildings.filter(
            (building) => 
              building.name.toLowerCase().includes(query) ||
              building.department.toLowerCase().includes(query)
          )
        )
      }
    }
  }, [searchQuery, buildings])

  // Parse building from URL query parameter on initial load
  useEffect(() => {
    if (typeof window !== 'undefined' && buildings.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const buildingSlug = urlParams.get('building');
      
      if (buildingSlug) {
        const foundBuilding = buildings.find(b => b.slug === buildingSlug);
        if (foundBuilding) {
          setSelectedBuilding(foundBuilding);
          setShowDetails(true);
        }
      }
    }
  }, [buildings]);

  // Close sidebar on mobile when viewing a building
  useEffect(() => {
    if (window.innerWidth < 768 && selectedBuilding) {
      setSidebarOpen(false)
    }
  }, [selectedBuilding])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) return

    const found = buildings.find((building) => 
      building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      building.department.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (found) {
      setSelectedBuilding(found)
      setShowDetails(true)
    }
  }

  const handleBuildingSelect = (building: Building) => {
    setSelectedBuilding(building)
    setShowDetails(true)
    
    // Update URL to include selected building
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('building', building.slug);
      window.history.pushState({}, '', url.toString());
    }
  }

  const handleCloseDetails = () => {
    setShowDetails(false)
    
    // Remove building from URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('building');
      window.history.pushState({}, '', url.toString());
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev)
  }

  const departmentFilters = Array.from(new Set(buildings.map(b => b.department)));

  const BuildingsList = () => (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--yabatech-dark-green)]">Campus Buildings</h3>
        <button 
          onClick={() => setSidebarOpen(false)}
          className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search buildings..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" className="bg-[var(--yabatech-green)] hover:bg-[var(--yabatech-green)]/90">
          <Search className="h-4 w-4" />
        </Button>
      </form>

      <div className="mb-4 flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer bg-gray-100 hover:bg-gray-200">All</Badge>
        {departmentFilters.slice(0, 3).map(dept => (
          <Badge key={dept} variant="outline" className="cursor-pointer bg-white hover:bg-gray-100">
            {dept}
          </Badge>
        ))}
        <Badge variant="outline" className="cursor-pointer bg-white hover:bg-gray-100">
          <Filter className="mr-1 h-3 w-3" /> More
        </Badge>
      </div>

      <div className="flex-1 overflow-y-auto pb-4 pr-1 custom-scrollbar">
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[var(--yabatech-green)]"></div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="rounded-md bg-red-50 p-4 text-center text-red-800">
            <p>{error}</p>
            <p className="text-sm">Please try again later.</p>
          </div>
        )}

        {/* Buildings list */}
        {!loading && !error && (
      <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="rounded-md bg-gray-50 p-4 text-center">
                <p className="text-gray-500">No buildings match your search.</p>
              </div>
            ) : (
              filtered.map((building) => (
                <div
                  key={building.name}
                  className={`cursor-pointer overflow-hidden rounded-lg border transition-all hover:-translate-y-1 ${
                    selectedBuilding?.name === building.name 
                      ? "border-[var(--yabatech-green)] bg-[var(--yabatech-green)]/10" 
                      : "border-gray-200 bg-white hover:border-[var(--yabatech-green)]/50 hover:shadow-md"
                  }`}
                  onClick={() => handleBuildingSelect(building)}
                >
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 rounded-full p-2 ${
                        selectedBuilding?.name === building.name 
                          ? "bg-[var(--yabatech-green)]/20" 
                          : "bg-gray-100"
                      }`}>
                        <Building className={`h-4 w-4 ${
                          selectedBuilding?.name === building.name 
                            ? "text-[var(--yabatech-green)]" 
                            : "text-gray-500"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-medium ${
                          selectedBuilding?.name === building.name 
                            ? "text-[var(--yabatech-dark-green)]" 
                            : "text-gray-800"
                        }`}>
                          {building.name}
                        </h4>
                        <p className={`text-sm ${
                          selectedBuilding?.name === building.name 
                            ? "text-[var(--yabatech-green)]" 
                            : "text-gray-500"
                        }`}>
              {building.department}
            </p>
                      </div>
                      <div className={`rounded-full p-1 ${
                        selectedBuilding?.name === building.name 
                          ? "bg-[var(--yabatech-green)] text-white" 
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        <MapPin className="h-3 w-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-[var(--yabatech-green)]/5 p-3 text-center">
        <p className="text-xs text-gray-600">Showing {filtered.length} of {buildings.length} buildings</p>
      </div>
    </div>
  )

  return (
    <div className="relative flex h-[calc(100vh-5rem)] flex-col overflow-hidden">
      {/* Mobile Controls - Top Bar */}
      <div className="bg-white p-2 shadow-sm md:hidden">
        <div className="flex items-center justify-between">
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 border-gray-200">
                <Building className="h-4 w-4" />
                <span className="text-sm">Buildings</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[85vh]">
              <div className="p-4">
                <BuildingsList />
              </div>
            </DrawerContent>
          </Drawer>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-9 px-2 py-0">
              <Settings className="h-4 w-4 text-gray-600" />
            </Button>
            {selectedBuilding && (
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9 gap-1 border-[var(--yabatech-green)] bg-[var(--yabatech-green)]/5 text-[var(--yabatech-dark-green)]"
                onClick={() => setShowDetails(true)}
              >
                <MapPin className="h-4 w-4 text-[var(--yabatech-green)]" />
                <span className="text-xs truncate max-w-[120px]">{selectedBuilding.name}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Sidebar - Desktop */}
        <div 
          ref={sidebarRef}
          className={`bg-white h-full w-[350px] border-r transition-all duration-300 ease-in-out md:block ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } absolute left-0 top-0 z-10 md:relative`}
        >
          <div className="h-full p-4 md:pr-3">
          <BuildingsList />
          </div>
        </div>

        {/* Sidebar Toggle - Desktop */}
        <button 
          onClick={toggleSidebar}
          className={`absolute left-[350px] top-1/2 z-20 hidden -translate-y-1/2 transform rounded-r-md bg-white p-1 shadow-md transition-all duration-300 ease-in-out md:block ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-[350px]'
          }`}
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-600" />
          )}
        </button>

        {/* Map Container */}
        <div className="relative flex-1">
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
    </div>
  )
}

