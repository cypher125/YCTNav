import Image from "next/image"
import Link from "next/link"
import { MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Building } from "@/lib/types"

interface BuildingCardProps {
  building: Building
}

export default function BuildingCard({ building }: BuildingCardProps) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-md transition-transform hover:scale-[1.02]">
      <div className="relative h-48 w-full">
        <Image
          src={building.image || "/placeholder.svg?height=300&width=500"}
          alt={building.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-1 text-xl font-bold text-[#2C3E50]">{building.name}</h3>
        <div className="mb-3 flex items-center text-gray-600">
          <MapPin className="mr-1 h-4 w-4" />
          <span className="text-sm">{building.department}</span>
        </div>
        <p className="mb-4 line-clamp-2 text-sm text-[#34495E]">{building.description}</p>
        <div className="flex gap-2">
          <Link href={`/buildings/${building.id}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Details
            </Button>
          </Link>
          <Link href={`/map?building=${building.id}`} className="flex-1">
            <Button className="w-full bg-[#3498DB] hover:bg-[#3498DB]/90">View on Map</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

