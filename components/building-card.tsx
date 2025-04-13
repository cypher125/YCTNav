import Image from "next/image"
import Link from "next/link"
import { MapPin, ArrowUpRight, Info, Navigation, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Building } from "@/lib/types"
import { getBuildingImageUrl } from "@/lib/api"

interface BuildingCardProps {
  building: Building
}

export default function BuildingCard({ building }: BuildingCardProps) {
  // Get the proper image URL or use a placeholder
  const imagePath = building.image 
    ? getBuildingImageUrl(building.slug || building.id)
    : "/placeholder.svg?height=300&width=500";
  const blurHash = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="%23${building.color?.replace('#', '') || '3498db'}99" /></svg>`;
  
  return (
    <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md">
      {/* Image container with gradient overlay */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={imagePath}
          alt={building.name}
          fill
          placeholder="blur"
          blurDataURL={blurHash}
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Department badge */}
        <div className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
          <span className="text-xs font-medium text-white">{building.department}</span>
        </div>
        
        {/* Hours badge if available */}
        {building.hours && (
          <div className="absolute right-3 top-3 flex items-center rounded-full bg-[var(--yabatech-accent)]/90 px-2 py-1 text-xs text-white backdrop-blur-sm">
            <CalendarClock className="mr-1 h-3 w-3" />
            {building.hours}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <Link href={`/buildings/${encodeURIComponent(building.name)}`} className="flex-1">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-1">{building.name}</h3>
          </Link>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--yabatech-green)]/10 text-[var(--yabatech-green)]">
            <Info className="h-3.5 w-3.5" />
          </span>
        </div>
        
        <div className="mb-3 flex items-center text-gray-600">
          <MapPin className="mr-1 h-4 w-4 text-[var(--yabatech-green)]" />
          <span className="text-sm">{building.department}</span>
        </div>
        
        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-700">{building.description}</p>
        
        {/* Facilities tags */}
        {building.facilities && building.facilities.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1">
            {building.facilities.slice(0, 3).map((facility, index) => (
              <Badge key={index} variant="secondary" className="text-xs bg-gray-100">
                {facility}
              </Badge>
            ))}
            {building.facilities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{building.facilities.length - 3} more
              </Badge>
            )}
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Link href={`/buildings/${encodeURIComponent(building.name)}`} className="flex-1">
            <Button 
              variant="outline" 
              className="w-full border-gray-200 hover:bg-gray-50 hover:text-[var(--yabatech-dark-green)]"
            >
              <Info className="mr-2 h-4 w-4" />
              Details
            </Button>
          </Link>
          <Link href={`/map?building=${encodeURIComponent(building.name)}`} className="flex-1">
            <Button 
              variant="default" 
              size="sm" 
              className="w-full bg-[var(--yabatech-green)]"
            >
              View on Map
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Mobile card overlay */}
      <Link href={`/buildings/${encodeURIComponent(building.name)}`} className="absolute inset-0 z-10 hidden md:block">
        <span className="sr-only">View building details</span>
      </Link>
      
      {/* Direct link button that appears on hover */}
      <div className="absolute right-3 top-3 z-20 hidden transition-opacity group-hover:block">
        <Link href={`/buildings/${encodeURIComponent(building.name)}`}>
          <Button 
            size="sm" 
            className="h-8 w-8 rounded-full bg-white p-0 text-[var(--yabatech-dark-green)] shadow-md hover:bg-[var(--yabatech-accent)]"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

