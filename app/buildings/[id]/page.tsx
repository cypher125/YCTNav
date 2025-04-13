"use client"

import { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, MapPin, Navigation, Clock, Info, Building2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useBuildingBySlug } from "@/hooks/useBuildings"
import type { Building } from "@/lib/types"
import { getBuildingImageUrl } from '@/lib/api'
import { Badge } from "@/components/ui/badge"

// Helper function to format building name to slug
function formatSlug(name: string): string {
  // First decode any URL encoded characters (like %20 for spaces)
  const decoded = decodeURIComponent(name);
  // Then convert to lowercase and replace spaces with hyphens
  return decoded.toLowerCase().replace(/\s+/g, "-");
}

export default function BuildingPage({ params }: { params: { id: string } }) {
  const resolvedParams = use(params)
  const router = useRouter()
  
  // Format the ID as a proper slug (decode URL encoding first, then convert to slug format)
  const formattedSlug = formatSlug(resolvedParams.id)
  
  const { building, loading, error } = useBuildingBySlug(formattedSlug)
  const [imageError, setImageError] = useState(false)

  // Redirect to search if building not found
  useEffect(() => {
    if (!loading && !building && error) {
      router.push("/search")
    }
  }, [loading, building, error, router])

  if (loading) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-[var(--yabatech-green)]"></div>
          <h2 className="text-2xl font-bold text-gray-700">Loading building information...</h2>
        </div>
      </div>
    )
  }

  if (error || !building) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
            <Building2 className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-red-600">Building Not Found</h2>
          <p className="mb-6 text-gray-600">The building you&apos;re looking for doesn&apos;t exist or couldn&apos;t be loaded.</p>
          <Link href="/buildings">
            <Button className="bg-[var(--yabatech-green)] hover:bg-[var(--yabatech-green)]/90">
              Browse All Buildings
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Get the properly formatted slug for this building
  const buildingSlug = formatSlug(building.name)

  // Create a URL for the image with proper error handling
  const imageUrl = building.image 
    ? getBuildingImageUrl(buildingSlug)
    : "/placeholder.svg?height=600&width=800";

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Hero section with image */}
      <div className="relative h-[300px] w-full overflow-hidden sm:h-[400px]">
        <Image
          src={!imageError ? imageUrl : "/placeholder.svg?height=600&width=800"}
          alt={building.name}
          fill
          priority
          className="object-cover"
          onError={() => setImageError(true)}
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        {/* Navigation and content overlay */}
        <div className="container absolute inset-0 mx-auto flex flex-col justify-between p-4 text-white">
          <Link href="/buildings" className="mb-auto inline-flex w-fit items-center rounded-full bg-black/30 px-3 py-1.5 text-sm backdrop-blur-sm transition-colors hover:bg-black/50">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Buildings
          </Link>
          
          <div>
            <Badge className="mb-2 bg-[var(--yabatech-accent)] text-xs font-medium uppercase tracking-wider text-white">
              {building.department}
            </Badge>
            <h1 className="mb-2 text-3xl font-bold drop-shadow-sm sm:text-4xl">{building.name}</h1>
          </div>
        </div>
      </div>
      
      {/* Content area */}
      <div className="container relative mx-auto -mt-6 px-4">
        <div className="rounded-xl bg-white p-6 shadow-lg md:p-8">
          {/* Quick info badges */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4 text-center">
              <Building2 className="mb-2 h-6 w-6 text-[var(--yabatech-green)]" />
              <span className="text-sm text-gray-500">Type</span>
              <span className="font-medium">{building.type || "Academic"}</span>
            </div>
            
            {building.hours && (
              <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4 text-center">
                <Clock className="mb-2 h-6 w-6 text-[var(--yabatech-green)]" />
                <span className="text-sm text-gray-500">Hours</span>
                <span className="font-medium">{building.hours}</span>
              </div>
            )}
            
            {building.capacity && (
              <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4 text-center">
                <Users className="mb-2 h-6 w-6 text-[var(--yabatech-green)]" />
                <span className="text-sm text-gray-500">Capacity</span>
                <span className="font-medium">{building.capacity}</span>
              </div>
            )}
            
            <div className="flex flex-col items-center rounded-lg bg-gray-50 p-4 text-center">
              <MapPin className="mb-2 h-6 w-6 text-[var(--yabatech-green)]" />
              <span className="text-sm text-gray-500">Location</span>
              <span className="font-medium">{building.location || "Main Campus"}</span>
            </div>
          </div>
          
          {/* Description section */}
          <div className="mb-8">
            <h2 className="mb-3 text-xl font-semibold text-gray-800">Description</h2>
            <p className="leading-relaxed text-gray-700">{building.description || "No description available for this building."}</p>
          </div>
          
          {/* Facilities section */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-gray-800">Facilities</h2>
            {building.facilities && building.facilities.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {building.facilities.map((facility, index) => (
                  <div key={index} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <div className="rounded-full bg-[var(--yabatech-green)]/10 p-1">
                      <Info className="h-4 w-4 text-[var(--yabatech-green)]" />
                    </div>
                    <span className="text-gray-800">{facility}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No facilities information available for this building.</p>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={`/map?building=${encodeURIComponent(buildingSlug)}`}>
              <Button className="w-full bg-[var(--yabatech-green)] hover:bg-[var(--yabatech-green)]/90 sm:w-auto">
                <MapPin className="mr-2 h-4 w-4" />
                View on Map
              </Button>
            </Link>
            <Link href={`/directions?to=${encodeURIComponent(buildingSlug)}`}>
              <Button variant="outline" className="w-full sm:w-auto">
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

