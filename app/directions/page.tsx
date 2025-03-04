"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { buildings } from "@/lib/data"
import type { Building } from "@/lib/types"

// Dynamically import the DirectionsMap component
const DirectionsMap = dynamic(() => import("@/components/directions-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center bg-gray-100">
      <div className="text-lg font-medium text-gray-500">Loading map...</div>
    </div>
  ),
})

export default function DirectionsPage() {
  const searchParams = useSearchParams()
  const [fromBuilding, setFromBuilding] = useState<Building | null>(null)
  const [toBuilding, setToBuilding] = useState<Building | null>(null)
  const [showDirections, setShowDirections] = useState(false)
  const [directions, setDirections] = useState<string[]>([])

  useEffect(() => {
    const toId = searchParams.get("to")
    if (toId) {
      const found = buildings.find((b) => b.id === toId)
      if (found) setToBuilding(found)
    }
  }, [searchParams])

  const handleFromChange = (value: string) => {
    const found = buildings.find((b) => b.id === value)
    if (found) setFromBuilding(found)
  }

  const handleToChange = (value: string) => {
    const found = buildings.find((b) => b.id === value)
    if (found) setToBuilding(found)
  }

  const getDirections = () => {
    if (!fromBuilding || !toBuilding) return

    // Simulate directions with placeholder data
    setDirections([
      `Exit ${fromBuilding.name} and head east.`,
      "Walk straight for about 100 meters.",
      "Turn right at the junction near the cafeteria.",
      "Continue straight for 50 meters.",
      `${toBuilding.name} will be on your left.`,
    ])

    setShowDirections(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/map" className="mb-6 inline-flex items-center text-[#3498DB] hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Map
      </Link>

      <h1 className="mb-8 text-center text-3xl font-bold text-[#2C3E50] sm:text-4xl">Get Directions</h1>

      <div className="mx-auto mb-8 max-w-2xl rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block font-medium text-[#2C3E50]">From</label>
            <Select onValueChange={handleFromChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select starting point" />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-2 block font-medium text-[#2C3E50]">To</label>
            <Select onValueChange={handleToChange} defaultValue={toBuilding?.id}>
              <SelectTrigger>
                <SelectValue placeholder={toBuilding?.name || "Select destination"} />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={getDirections}
          disabled={!fromBuilding || !toBuilding}
          className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90"
        >
          <Navigation className="mr-2 h-5 w-5" />
          Get Directions
        </Button>
      </div>

      {showDirections && fromBuilding && toBuilding && (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="rounded-lg bg-white p-6 shadow-md">
              <h2 className="mb-4 text-xl font-semibold text-[#2C3E50]">
                Directions: {fromBuilding.name} to {toBuilding.name}
              </h2>
              <div className="space-y-3">
                {directions.map((step, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#3498DB] text-xs font-medium text-white">
                      {index + 1}
                    </div>
                    <p className="text-[#34495E]">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="h-[500px] overflow-hidden rounded-lg">
              <DirectionsMap fromBuilding={fromBuilding} toBuilding={toBuilding} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

