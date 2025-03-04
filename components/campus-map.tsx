"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Building } from "@/lib/types"

// Fix Leaflet marker icon issue in Next.js
const defaultIcon = L.icon({
  iconUrl: "/marker-icon.png",
  iconRetinaUrl: "/marker-icon-2x.png",
  shadowUrl: "/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

L.Marker.prototype.options.icon = defaultIcon

const campusBoundaries: [number, number][] = [
  [6.5225, 3.3745], // Southwest corner
  [6.5225, 3.379], // Southeast corner
  [6.5255, 3.379], // Northeast corner
  [6.5255, 3.3745], // Northwest corner
]

// Component to handle map center changes
function MapController({ center }: { center: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    map.setView(center, 17)
    // Force a resize event after a short delay to ensure proper rendering
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
  }, [center, map])

  return null
}

interface CampusMapProps {
  buildings: Building[]
  selectedBuilding: Building | null
  onBuildingSelect: (building: Building) => void
}

const defaultCenter: [number, number] = [6.524, 3.3768]

export default function CampusMap({ buildings, selectedBuilding, onBuildingSelect }: CampusMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter)

  useEffect(() => {
    if (selectedBuilding && selectedBuilding.coordinates) {
      setMapCenter([selectedBuilding.coordinates.lat, selectedBuilding.coordinates.lng])
    }
  }, [selectedBuilding])

  return (
    <div className="absolute inset-0">
      <MapContainer
        center={mapCenter}
        zoom={17}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer
          attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
          url={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
          tileSize={512}
          zoomOffset={-1}
          maxZoom={19}
        />

        <MapController center={mapCenter} />

        <Polygon
          positions={campusBoundaries}
          pathOptions={{
            fillColor: "#2C3E50",
            fillOpacity: 0.2,
            weight: 2,
            color: "#3498DB",
            opacity: 0.7,
          }}
        />

        {buildings.map(
          (building) =>
            building.coordinates && (
              <Marker
                key={building.id}
                position={[building.coordinates.lat, building.coordinates.lng]}
                icon={
                  selectedBuilding?.id === building.id
                    ? L.icon({
                        ...defaultIcon.options,
                        iconUrl: "/marker-icon-selected.png",
                        iconSize: [30, 46],
                        iconAnchor: [15, 46],
                      })
                    : defaultIcon
                }
                eventHandlers={{
                  click: () => onBuildingSelect(building),
                }}
              >
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-medium">{building.name}</h3>
                    <p className="text-sm text-gray-600">{building.department}</p>
                  </div>
                </Popup>
              </Marker>
            ),
        )}
      </MapContainer>
    </div>
  )
}

