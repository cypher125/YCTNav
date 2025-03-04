"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import BuildingCard from "@/components/building-card"
import { buildings } from "@/lib/data"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [results, setResults] = useState(buildings)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setResults(buildings)
      return
    }

    const filtered = buildings.filter(
      (building) =>
        building.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        building.department.toLowerCase().includes(searchQuery.toLowerCase()),
    )

    setResults(filtered)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-center text-3xl font-bold text-[#2C3E50] sm:text-4xl">Search Campus Buildings</h1>

      <div className="mx-auto mb-8 max-w-2xl">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for buildings, departments, or facilities..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" className="bg-[#3498DB] hover:bg-[#3498DB]/90">
            Search
          </Button>
        </form>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {results.length > 0 ? (
          results.map((building) => <BuildingCard key={building.id} building={building} />)
        ) : (
          <div className="col-span-full py-8 text-center text-lg text-gray-500">
            No buildings found matching your search criteria.
          </div>
        )}
      </div>
    </div>
  )
}

