import Image from "next/image"
import Link from "next/link"
import { X, Navigation, Clock, Users, Info, Share2, ExternalLink, Calendar, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Building } from "@/lib/types"
import { getBuildingImageUrl } from "@/lib/api"

interface BuildingDetailsProps {
  building: Building
  onClose: () => void
}

export default function BuildingDetails({ building, onClose }: BuildingDetailsProps) {
  // Get the proper image URL or use a placeholder
  const imagePath = building.image 
    ? getBuildingImageUrl(building.slug || building.id)
    : "/placeholder.svg?height=300&width=600";
  const blurHash = `data:image/svg+xml;charset=utf-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"><rect width="1" height="1" fill="%23${building.color?.replace('#', '') || '3B82F6'}99" /></svg>`;
  
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm md:p-8" 
         onClick={(e) => {
           // Close when clicking outside the modal
           if (e.target === e.currentTarget) {
             onClose();
           }
         }}>
      <div className="relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl md:max-w-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition-transform hover:bg-black/70 hover:scale-105 active:scale-95"
          aria-label="Close details"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Share button */}
        <button
          className="absolute right-14 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white shadow-lg backdrop-blur-sm transition-transform hover:bg-black/70 hover:scale-105 active:scale-95"
          aria-label="Share building"
        >
          <Share2 className="h-4 w-4" />
        </button>

        <div className="relative">
          <div className="relative h-56 w-full sm:h-64">
          <Image
              src={imagePath}
            alt={building.name}
            fill
              placeholder="blur"
              blurDataURL={blurHash}
            className="object-cover"
              sizes="(max-width: 768px) 100vw, 600px"
          />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50"></div>
            
            {/* Department badge */}
            <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 backdrop-blur-sm">
              <p className="text-xs font-medium text-white">{building.department}</p>
        </div>

            {/* Building name overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h2 className="text-2xl font-bold text-white drop-shadow-sm">{building.name}</h2>
            </div>
          </div>
        </div>

        <div className="divide-y">
          {/* Content area */}
          <div className="p-5">
            {/* Quick info pills */}
            <div className="mb-5 flex flex-wrap gap-2">
              {building.type && (
                <div className="flex items-center rounded-full bg-[var(--yabatech-green)]/10 px-3 py-1">
                  <Info className="mr-1 h-3 w-3 text-[var(--yabatech-green)]" />
                  <span className="text-xs font-medium text-[var(--yabatech-dark-green)]">{building.type}</span>
                </div>
              )}
              {building.hours && (
                <div className="flex items-center rounded-full bg-blue-50 px-3 py-1">
                  <Clock className="mr-1 h-3 w-3 text-blue-500" />
                  <span className="text-xs font-medium text-blue-700">{building.hours}</span>
                </div>
              )}
              {building.capacity && (
                <div className="flex items-center rounded-full bg-amber-50 px-3 py-1">
                  <Users className="mr-1 h-3 w-3 text-amber-500" />
                  <span className="text-xs font-medium text-amber-700">Capacity: {building.capacity}</span>
                </div>
              )}
          </div>

            {/* Description section */}
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-semibold text-[var(--yabatech-dark-green)]">About this Building</h3>
              <p className="text-sm leading-relaxed text-gray-700">{building.description || "No description available for this building."}</p>
            </div>

            {/* Facilities section */}
            {building.facilities && building.facilities.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-semibold text-[var(--yabatech-dark-green)]">Facilities & Services</h3>
                <div className="flex flex-wrap gap-2">
                {building.facilities.map((facility, index) => (
                    <div key={index} className="rounded-md bg-gray-100 px-3 py-1">
                      <span className="text-xs text-gray-800">{facility}</span>
                    </div>
                ))}
                </div>
            </div>
          )}

            {/* Contact information */}
            <div className="mb-6 space-y-2 rounded-lg bg-gray-50 p-3">
              {building.contact && (
                <div className="flex items-start gap-2">
                  <Phone className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Contact</p>
                    <p className="text-sm text-gray-600">{building.contact}</p>
                  </div>
                </div>
              )}
              {building.openingHours && (
                <div className="flex items-start gap-2">
                  <Calendar className="mt-0.5 h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs font-medium text-gray-700">Opening Hours</p>
                    <p className="text-sm text-gray-600">{building.openingHours}</p>
                  </div>
                </div>
              )}
              {building.website && (
                <a 
                  href={building.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md text-sm text-[var(--yabatech-green)] hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span>Visit website</span>
                </a>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between p-4">
            <Link href={`/directions?to=${building.slug}`} className="flex-1">
              <Button 
                className="w-full border-0 bg-[var(--yabatech-green)] text-white hover:bg-[var(--yabatech-green)]/90"
                size="lg"
              >
                <Navigation className="mr-2 h-4 w-4" />
                <span>Get Directions</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

