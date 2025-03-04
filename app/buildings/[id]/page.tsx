"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buildings } from "@/lib/data"
import type { Building } from "@/lib/types"

export default function BuildingPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [building, setBuilding] = useState<Building | null>(null)

  useEffect(() => {
    const foundBuilding = buildings.find((b) => b.id === params.id)
    if (foundBuilding) {
      setBuilding(foundBuilding)
    } else {
      router.push("/search")
    }
  }, [params.id, router])

  if (!building) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <h2 className="mb-2 text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/search" className="mb-6 inline-flex items-center text-[#3498DB] hover:underline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Search
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative h-[300px] overflow-hidden rounded-lg md:h-[400px]">
          <Image
            src={building.image || "/placeholder.svg?height=400&width=600"}
            alt={building.name}
            fill
            className="object-cover"
          />
        </div>

        <div>
          <h1 className="mb-2 text-3xl font-bold text-[#2C3E50]">{building.name}</h1>
          <div className="mb-4 flex items-center text-gray-600">
            <MapPin className="mr-1 h-5 w-5" />
            <span>{building.department}</span>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold text-[#2C3E50]">Description</h2>
            <p className="text-[#34495E]">{building.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="mb-2 text-xl font-semibold text-[#2C3E50]">Facilities</h2>
            <ul className="list-inside list-disc space-y-1 text-[#34495E]">
              {building.facilities?.map((facility, index) => <li key={index}>{facility}</li>) || (
                <li>Information not available</li>
              )}
            </ul>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/map?building=${building.id}`}>
              <Button className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90 sm:w-auto">
                <MapPin className="mr-2 h-5 w-5" />
                View on Map
              </Button>
            </Link>
            <Link href={`/directions?to=${building.id}`}>
              <Button variant="outline" className="w-full sm:w-auto">
                <Navigation className="mr-2 h-5 w-5" />
                Get Directions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

