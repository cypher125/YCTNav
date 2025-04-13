"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowLeft, Navigation, Locate, Map, Info, Route, Clock, PinIcon, RefreshCw, Building } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useBuildings } from "@/hooks/useBuildings"
import type { Building as BuildingType } from "@/lib/types"
import { useSelector } from "react-redux"
import { RootState } from "@/store/store"
import { cn } from "@/lib/utils"

// Dynamically import the DirectionsMap component
const DirectionsMap = dynamic(() => import("@/components/directions-map"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[600px] items-center justify-center bg-gradient-to-r from-gray-50 to-gray-100">
      <div className="flex flex-col items-center rounded-lg bg-white p-6 shadow-md">
        <div className="mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-t-2 border-[var(--yabatech-green)]"></div>
        <div className="text-center">
          <p className="text-lg font-medium text-gray-700">Loading map...</p>
          <p className="text-sm text-gray-500">Preparing your navigation experience</p>
        </div>
      </div>
    </div>
  ),
})

export default function DirectionsPage() {
  const searchParams = useSearchParams()
  const { buildings, loading, error } = useBuildings()
  const [fromBuilding, setFromBuilding] = useState<BuildingType | null>(null)
  const [toBuilding, setToBuilding] = useState<BuildingType | null>(null)
  const [showDirections, setShowDirections] = useState(false)
  const [directions, setDirections] = useState<string[]>([])
  const [useCurrentLocation, setUseCurrentLocation] = useState(true)
  const [isMobileDirectionsOpen, setIsMobileDirectionsOpen] = useState(false)

  // Get user location from Redux
  const userLocation = useSelector((state: RootState) => state.userLocation)
  const routeDetails = useSelector((state: RootState) => state.userLocation.route)

  // Initialize using the search param
  useEffect(() => {
    if (loading || buildings.length === 0) return;

    const toSlug = searchParams.get("to")
    if (toSlug) {
      const found = buildings.find((b) => b.slug === toSlug)
      if (found) setToBuilding(found)
    }
  }, [searchParams, buildings, loading])

  // Update directions when route updates in Redux
  useEffect(() => {
    try {
      if (routeDetails?.coordinates && routeDetails.coordinates.length > 0) {
        // Use text directions if available from the routing engine
        if (routeDetails?.textDirections && Array.isArray(routeDetails.textDirections) && routeDetails.textDirections.length > 0) {
          setDirections(routeDetails.textDirections);
        } else {
          // Fallback to simple directions based on route
          const distance = routeDetails?.distance ? Math.round(routeDetails.distance / 10) / 100 : 0;
          const duration = routeDetails?.duration ? Math.round(routeDetails.duration / 60) : 0;
          
          const instructions = [
            `Head towards ${toBuilding?.name || "your destination"}.`,
            `Total distance: ${distance} km.`,
            `Estimated walking time: ${duration} minutes.`,
            `Follow the blue route line on the map.`
          ];
          
          setDirections(instructions);
        }
        
        setShowDirections(true);
        
        // Auto-open directions panel on mobile when route is available
        setIsMobileDirectionsOpen(true);
        
        // Note: We don't need to show toasts here as they are already shown in directions-map.tsx
      }
    } catch (error) {
      console.error('Error processing route details:', error);
      // Set fallback directions
      setDirections([
        `Head towards your destination.`,
        `Follow the blue route line on the map.`
      ]);
    }
  }, [routeDetails, toBuilding]);

  const handleFromChange = (value: string) => {
    if (value === "my-location") {
      setUseCurrentLocation(true)
      setFromBuilding(null)
    } else {
      setUseCurrentLocation(false)
    const found = buildings.find((b) => b.id === value)
    if (found) setFromBuilding(found)
    }
  }

  const handleToChange = (value: string) => {
    const found = buildings.find((b) => b.id === value)
    if (found) setToBuilding(found)
  }

  const getDirections = () => {
    if (!toBuilding) return
    
    // Since the map component will handle actual routing via OSRM,
    // we just need to show the map with the right props
    setShowDirections(true)
  }

  if (loading) {
    return (
      <div className="container mx-auto flex h-[80vh] items-center justify-center px-4">
        <div className="flex flex-col items-center rounded-xl bg-white p-8 shadow-lg">
          <div className="mb-6 h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[var(--yabatech-green)]"></div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Loading Campus Data</h2>
          <p className="text-center text-gray-500">We're preparing the campus buildings information for your journey</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto flex h-[80vh] items-center justify-center px-4">
        <div className="rounded-xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <Info className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="mb-2 text-2xl font-bold text-gray-800">Unable to Load Data</h2>
          <p className="mb-6 text-gray-600">{error}</p>
          <Link href="/map">
            <Button className="bg-[var(--yabatech-green)] hover:bg-[var(--yabatech-green)]/90">
              <Map className="mr-2 h-4 w-4" />
              Return to Map
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto min-h-[calc(100vh-5rem)] px-4 py-6">
      {/* Back to Map Link */}
      <Link 
        href="/map" 
        className="mb-6 inline-flex items-center rounded-full bg-white/90 px-4 py-2 text-gray-700 shadow-sm backdrop-blur-sm transition-colors hover:bg-[var(--yabatech-green)]/10 hover:text-[var(--yabatech-dark-green)]"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Map
      </Link>

      {/* Page Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--yabatech-green)]/10">
          <Navigation className="h-7 w-7 text-[var(--yabatech-green)]" />
        </div>
        <h1 className="text-3xl font-bold text-gray-800 sm:text-4xl">Get Directions</h1>
        <p className="mt-2 text-gray-600">Find the best route between buildings on campus</p>
      </div>

      {/* Route Selector Card */}
      <div className="mx-auto mb-8 max-w-2xl rounded-2xl bg-white p-6 shadow-md sm:p-8">
        <div className="mb-6 grid gap-6 sm:grid-cols-2">
          {/* From Field */}
          <div className="space-y-3">
            <label className="block font-medium text-gray-700">From</label>
            
            {/* Location Button */}
            <div className="flex flex-col gap-3">
              <Button 
                variant={useCurrentLocation ? "default" : "outline"}
                size="lg"
                className={cn(
                  "h-auto justify-start gap-3 border py-3 text-left",
                  useCurrentLocation 
                    ? "border-[var(--yabatech-green)]/30 bg-[var(--yabatech-green)]/10 text-[var(--yabatech-dark-green)] hover:bg-[var(--yabatech-green)]/20" 
                    : "border-gray-200 text-gray-700"
                )}
                onClick={() => setUseCurrentLocation(true)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--yabatech-green)]/20">
                  <Locate className="h-4 w-4 text-[var(--yabatech-green)]" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">Use My Precise Location</span>
                  <span className="text-xs font-normal opacity-80">Your current GPS position</span>
                </div>
              </Button>
              
              {/* Building Selector */}
              <Button 
                variant={!useCurrentLocation ? "default" : "outline"}
                size="lg"
                className={cn(
                  "h-auto justify-start gap-3 border py-3 text-left",
                  !useCurrentLocation 
                    ? "border-[var(--yabatech-green)]/30 bg-[var(--yabatech-green)]/10 text-[var(--yabatech-dark-green)] hover:bg-[var(--yabatech-green)]/20" 
                    : "border-gray-200 text-gray-700"
                )}
                onClick={() => setUseCurrentLocation(false)}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--yabatech-green)]/20">
                  <Building className="h-4 w-4 text-[var(--yabatech-green)]" />
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">Choose a Building</span>
                  <span className="text-xs font-normal opacity-80">Select from campus locations</span>
                </div>
              </Button>
              
              {!useCurrentLocation && (
                <div className="rounded-lg border border-gray-200">
            <Select onValueChange={handleFromChange}>
                    <SelectTrigger className="h-12 border-0 bg-transparent">
                <SelectValue placeholder="Select starting point" />
              </SelectTrigger>
              <SelectContent>
                      <SelectItem value="my-location">
                        <div className="flex items-center">
                          <Locate className="mr-2 h-4 w-4 text-[var(--yabatech-green)]" />
                          My Current Location
                        </div>
                      </SelectItem>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id || ''}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
                </div>
              )}
          </div>

            {useCurrentLocation && (
              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>For best results, allow precise location access in your browser and use the <span className="mx-0.5 font-medium">📍</span> button on the map to refresh your location</p>
                </div>
              </div>
            )}
          </div>

          {/* To Field */}
          <div className="space-y-3">
            <label className="block font-medium text-gray-700">To</label>
            <div className="rounded-lg border border-gray-200">
            <Select onValueChange={handleToChange} defaultValue={toBuilding?.id}>
                <SelectTrigger className="h-12">
                <SelectValue placeholder={toBuilding?.name || "Select destination"} />
              </SelectTrigger>
              <SelectContent>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={building.id || ''}>
                    {building.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
            
            {toBuilding && (
              <div className="rounded-lg bg-[var(--yabatech-green)]/5 p-3 text-sm">
                <div className="flex items-start gap-2">
                  <PinIcon className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--yabatech-green)]" />
                  <div>
                    <p className="font-medium text-[var(--yabatech-dark-green)]">{toBuilding.name}</p>
                    <p className="text-xs text-gray-600">{toBuilding.department}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={getDirections}
          disabled={!toBuilding}
          size="lg"
          className="w-full gap-2 bg-[var(--yabatech-green)] py-6 text-white hover:bg-[var(--yabatech-green)]/90"
        >
          <Route className="h-5 w-5" />
          <span className="font-medium">Get Directions</span>
        </Button>
      </div>

      {/* Map and Directions Areas */}
      {showDirections && toBuilding && (
        <div className="relative">
          {/* Mobile floating action button to toggle directions panel */}
          <div className="fixed bottom-6 right-6 z-20 md:hidden">
            <Button
              onClick={() => setIsMobileDirectionsOpen(!isMobileDirectionsOpen)}
              className="h-14 w-14 rounded-full bg-[var(--yabatech-green)] p-0 shadow-lg"
            >
              {isMobileDirectionsOpen ? <Map className="h-6 w-6" /> : <Navigation className="h-6 w-6" />}
            </Button>
          </div>
          
          {/* Mobile Directions Panel */}
          <div className={`fixed bottom-0 left-0 right-0 z-10 transition-transform duration-300 ease-in-out md:hidden ${
            isMobileDirectionsOpen ? 'translate-y-0' : 'translate-y-full'
          }`}>
            <div className="rounded-t-xl bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-800">
                  Directions to {toBuilding.name}
              </h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-gray-500"
                  onClick={() => setIsMobileDirectionsOpen(false)}
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>
              
              {directions.length > 0 ? (
                <div className="max-h-[40vh] space-y-4 overflow-y-auto">
                {directions.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--yabatech-green)] text-xs font-medium text-white">
                      {index + 1}
                      </div>
                      <p className="text-gray-700">{step}</p>
                    </div>
                  ))}
                  
                  {userLocation.lastUpdated && (
                    <div className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="h-3 w-3" />
                        <span>Last updated: {new Date(userLocation.lastUpdated).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PinIcon className="h-3 w-3" />
                        <span>Accuracy: {userLocation.accuracy ? Math.round(userLocation.accuracy) : '?'} meters</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6">
                  <div className="text-center">
                    <Clock className="mx-auto h-10 w-10 text-gray-300" />
                    <p className="mt-2 text-gray-500">
                      Route information will appear here once calculated
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Desktop Layout - Grid */}
          <div className="hidden grid-cols-3 gap-6 md:grid">
            <div className="col-span-1">
              <div className="sticky top-20 rounded-xl bg-white p-6 shadow-md">
                <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-800">
                  <Navigation className="h-5 w-5 text-[var(--yabatech-green)]" />
                  <span>Directions</span>
                </h2>
                
                <div className="mb-6 rounded-lg bg-[var(--yabatech-green)]/5 p-3">
                  <div className="mb-3 text-sm text-gray-600">
                    Route from
                  </div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--yabatech-green)]/20">
                      {useCurrentLocation ? (
                        <Locate className="h-4 w-4 text-[var(--yabatech-green)]" />
                      ) : (
                        <Building className="h-4 w-4 text-[var(--yabatech-green)]" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--yabatech-dark-green)]">
                        {useCurrentLocation ? "My Current Location" : fromBuilding?.name}
                      </p>
                      {!useCurrentLocation && fromBuilding && (
                        <p className="text-xs text-gray-500">{fromBuilding.department}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="h-6 border-l border-dashed border-gray-300"></div>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--yabatech-accent)]/20">
                      <PinIcon className="h-4 w-4 text-[var(--yabatech-accent)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--yabatech-dark-green)]">
                        {toBuilding.name}
                      </p>
                      <p className="text-xs text-gray-500">{toBuilding.department}</p>
                    </div>
                  </div>
                </div>
                
                {directions.length > 0 ? (
                  <div className="space-y-4">
                    {directions.map((step, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[var(--yabatech-green)] text-xs font-medium text-white">
                          {index + 1}
                        </div>
                        <p className="text-gray-700">{step}</p>
                  </div>
                ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-lg bg-gray-50 py-8">
                    <div className="text-center">
                      <Route className="mx-auto h-12 w-12 text-gray-300" />
                      <p className="mt-3 text-gray-500">
                        Directions will appear here once calculated
                      </p>
                    </div>
                  </div>
                )}
                
                {userLocation.lastUpdated && (
                  <div className="mt-6 rounded-lg bg-gray-50 p-4 text-xs text-gray-500">
                    <p className="mb-1 font-medium text-gray-700">Location Information</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Last updated: {new Date(userLocation.lastUpdated).toLocaleTimeString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <PinIcon className="h-3 w-3" />
                        <span>Accuracy: {userLocation.accuracy ? Math.round(userLocation.accuracy) : '?'} meters</span>
                      </div>
                      {userLocation.lat && userLocation.lng && (
                        <div className="flex items-center gap-2">
                          <Map className="h-3 w-3" />
                          <span>Coords: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="col-span-2 overflow-hidden rounded-xl shadow-md">
              {useCurrentLocation ? (
                <DirectionsMap 
                  key={`map-to-${toBuilding?.id || ''}`}
                  fromBuilding={{ 
                    id: 'my-location',
                    name: 'My Location',
                    department: '',
                    slug: 'my-location',
                    coordinates: {
                      lat: userLocation.lat || 6.5200,
                      lng: userLocation.lng || 3.3750
                    }
                  }}
                  toBuilding={toBuilding}
                />
              ) : (
                fromBuilding && (
                  <DirectionsMap
                    key={`map-from-${fromBuilding?.id || ''}-to-${toBuilding?.id || ''}`}
                    fromBuilding={fromBuilding}
                    toBuilding={toBuilding}
                  />
                )
              )}
            </div>
          </div>

          {/* Mobile Map Full Width */}
          <div className="md:hidden">
            <div className="h-[70vh] overflow-hidden rounded-xl shadow-md">
              {useCurrentLocation ? (
                <DirectionsMap 
                  key={`mobile-map-to-${toBuilding?.id || ''}`}
                  fromBuilding={{ 
                    id: 'my-location',
                    name: 'My Location',
                    department: '',
                    slug: 'my-location',
                    coordinates: {
                      lat: userLocation.lat || 6.5200,
                      lng: userLocation.lng || 3.3750
                    }
                  }}
                  toBuilding={toBuilding}
                />
              ) : (
                fromBuilding && (
                  <DirectionsMap
                    key={`mobile-map-from-${fromBuilding?.id || ''}-to-${toBuilding?.id || ''}`}
                    fromBuilding={fromBuilding}
                    toBuilding={toBuilding}
                  />
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

