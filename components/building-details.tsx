import Image from "next/image"
import Link from "next/link"
import { X, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Building } from "@/lib/types"

interface BuildingDetailsProps {
  building: Building
  onClose: () => void
}

export default function BuildingDetails({ building, onClose }: BuildingDetailsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 z-10 flex items-center justify-center bg-black/50 p-4 md:p-8">
      <div className="relative max-h-full w-full max-w-2xl overflow-auto rounded-lg bg-white shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full bg-white/90 p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
        >
          <X className="h-5 w-5" />
          <span className="sr-only">Close</span>
        </button>

        <div className="relative h-48 w-full sm:h-64">
          <Image
            src={building.image || "/placeholder.svg?height=300&width=600"}
            alt={building.name}
            fill
            className="object-cover"
          />
        </div>

        <div className="p-6">
          <h2 className="mb-2 text-2xl font-bold text-[#2C3E50]">{building.name}</h2>
          <p className="mb-4 text-sm text-gray-600">{building.department}</p>

          <div className="mb-4">
            <h3 className="mb-1 font-medium text-[#2C3E50]">Description</h3>
            <p className="text-sm text-[#34495E]">{building.description}</p>
          </div>

          {building.facilities && building.facilities.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-1 font-medium text-[#2C3E50]">Facilities</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-[#34495E]">
                {building.facilities.map((facility, index) => (
                  <li key={index}>{facility}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/buildings/${building.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
            <Link href={`/directions?to=${building.id}`} className="flex-1">
              <Button className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90">
                <Navigation className="mr-2 h-4 w-4" />
                Get Directions
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

