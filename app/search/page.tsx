"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Filter, X, MapPin, Grid3X3, List, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BuildingCard from "@/components/building-card"
import { buildings } from "@/lib/data"
import Link from "next/link"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState(buildings)
  const [filteredCount, setFilteredCount] = useState(buildings.length)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  
  // Extract unique departments for filter options
  const departments = Array.from(new Set(buildings.map(b => b.department))).sort()
  
  // Handle search and filtering
  useEffect(() => {
    let filtered = buildings
    
    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(
      (building) =>
        building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.department.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    }
    
    // Apply department filters
    if (activeFilters.length > 0) {
      filtered = filtered.filter(building => 
        activeFilters.includes(building.department)
      )
    }

    setResults(filtered)
    setFilteredCount(filtered.length)
  }, [searchQuery, activeFilters])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
  }
  
  const toggleFilter = (department: string) => {
    setActiveFilters(prev => 
      prev.includes(department)
        ? prev.filter(d => d !== department)
        : [...prev, department]
    )
  }
  
  const clearFilters = () => {
    setActiveFilters([])
    setSearchQuery("")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero section with search */}
      <div className="relative mb-12 overflow-hidden rounded-xl bg-gradient-to-r from-[var(--yabatech-dark-green)] to-[var(--yabatech-green)] p-8 text-white shadow-lg md:p-12">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <h1 className="mb-4 text-center text-3xl font-bold sm:text-4xl md:text-5xl">
            Search Campus Buildings
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-center text-white/90">
            Find information about academic buildings, facilities, and departments across campus
          </p>
          
          <div className="relative mx-auto max-w-3xl">
            <form onSubmit={handleSearch} className="relative">
              <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for buildings, departments, or facilities..."
                    className="h-12 bg-white pl-12 pr-4 text-gray-800 placeholder-gray-500 focus:border-[var(--yabatech-accent)] focus:ring-[var(--yabatech-accent)]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
                  {searchQuery && (
                    <button 
                      type="button"
                      onClick={() => setSearchQuery("")} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-gray-200 p-1 text-gray-500 hover:bg-gray-300 hover:text-gray-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
          </div>
                <Button 
                  type="submit" 
                  className="h-12 bg-[var(--yabatech-accent)] text-[var(--yabatech-dark-green)] hover:bg-[var(--yabatech-accent)]/90"
                >
                  <Search className="mr-2 h-5 w-5" />
            Search
          </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="h-12 border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 sm:ml-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="mr-2 h-5 w-5" />
                  Filters
                </Button>
              </div>
        </form>
          </div>
        </div>
      </div>

      {/* Filters and results controls */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[var(--yabatech-green)]" />
          <span className="font-medium text-gray-700">
            {filteredCount} {filteredCount === 1 ? 'building' : 'buildings'} found
          </span>
          
          {(activeFilters.length > 0 || searchQuery) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="ml-2 h-8 gap-1 text-xs text-gray-500 hover:text-gray-700"
            >
              <X className="h-3 w-3" /> Clear filters
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">View:</span>
          <div className="rounded-md border border-gray-200 p-1">
            <Button 
              variant={viewMode === "grid" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "default" : "ghost"} 
              size="sm"
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="ml-2 hidden items-center gap-2 md:flex">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select className="rounded-md border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700">
              <option value="name">Name (A-Z)</option>
              <option value="department">Department</option>
              <option value="recent">Recently Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Active filters:</span>
            {activeFilters.map(filter => (
              <Badge 
                key={filter}
                variant="outline" 
                className="flex items-center gap-1 border-[var(--yabatech-green)]/30 bg-[var(--yabatech-green)]/5"
              >
                {filter}
                <button onClick={() => toggleFilter(filter)}>
                  <X className="ml-1 h-3 w-3 text-gray-500 hover:text-gray-700" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* Filter panel */}
      {showFilters && (
        <div className="mb-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-medium text-gray-800">
              <SlidersHorizontal className="mr-2 inline-block h-4 w-4" />
              Filter Buildings
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowFilters(false)}
              className="h-8 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Tabs defaultValue="department">
            <TabsList className="mb-4">
              <TabsTrigger value="department">Department</TabsTrigger>
              <TabsTrigger value="type">Building Type</TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
            </TabsList>
            
            <TabsContent value="department" className="mt-2">
              <div className="flex flex-wrap gap-2">
                {departments.map(department => (
                  <Badge 
                    key={department}
                    variant={activeFilters.includes(department) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      activeFilters.includes(department) 
                        ? 'bg-[var(--yabatech-green)] hover:bg-[var(--yabatech-green)]/90' 
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => toggleFilter(department)}
                  >
                    {department}
                  </Badge>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="type" className="text-center text-gray-500">
              Building type filters coming soon
            </TabsContent>
            
            <TabsContent value="facilities" className="text-center text-gray-500">
              Facilities filters coming soon
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Results grid */}
      {viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.length > 0 ? (
            results.map((building) => (
              <BuildingCard key={building.name} building={building} />
            ))
          ) : (
            <div className="col-span-full rounded-lg bg-gray-50 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-gray-800">No buildings found</h3>
              <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
              <Button 
                className="mt-4 bg-[var(--yabatech-green)]" 
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-white shadow">
        {results.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {results.map((building) => (
                <div key={building.name} className="flex flex-col p-4 sm:flex-row sm:items-center">
                  <div className="relative mb-4 h-20 w-full overflow-hidden rounded-lg sm:mb-0 sm:mr-4 sm:h-24 sm:w-32 md:h-28 md:w-40">
                    <Image
                      src={building.image || "/placeholder.svg?height=300&width=500"}
                      alt={building.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-bold text-gray-800">{building.name}</h3>
                    <div className="mb-2 text-sm text-gray-600">
                      <MapPin className="mr-1 inline-block h-4 w-4" />
                      {building.department}
                    </div>
                    <p className="mb-3 line-clamp-2 text-sm text-gray-700">{building.description}</p>
                    <div className="flex gap-2">
                      <Link href={`/buildings/${encodeURIComponent(building.name)}`}>
                        <Button variant="outline" size="sm">
                          Details
                        </Button>
                      </Link>
                      <Link href={`/map?building=${encodeURIComponent(building.name)}`}>
                        <Button size="sm" className="bg-[var(--yabatech-green)]">
                          View on Map
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-1 text-lg font-medium text-gray-800">No buildings found</h3>
              <p className="text-gray-500">Try adjusting your search or filters to find what you're looking for.</p>
              <Button 
                className="mt-4 bg-[var(--yabatech-green)]" 
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
          </div>
        )}
      </div>
      )}
    </div>
  )
}

