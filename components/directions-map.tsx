"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Polygon } from "react-leaflet"
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
  [6.523, 3.378], // Southwest corner
  [6.523, 3.381], // Southeast corner
  [6.526, 3.381], // Northeast corner
  [6.526, 3.378], // Northwest corner
]

// Component to handle map bounds
function MapController({ from, to }: { from: [number, number]; to: [number, number] }) {
  const map = useMap()

  useEffect(() => {
    const bounds = L.latLngBounds([from, to])
    map.fitBounds(bounds, { padding: [50, 50] })
  }, [from, to, map])

  return null
}

interface DirectionsMapProps {
  fromBuilding: Building
  toBuilding: Building
}

export default function DirectionsMap({ fromBuilding, toBuilding }: DirectionsMapProps) {
  const [routePoints, setRoutePoints] = useState<[number, number][]>([])

  useEffect(() => {
    if (fromBuilding.coordinates && toBuilding.coordinates) {
      // In a real app, you would fetch the route from a routing API
      // For this demo, we'll create a simple straight line with a midpoint
      const fromCoords: [number, number] = [fromBuilding.coordinates.lat, fromBuilding.coordinates.lng]
      const toCoords: [number, number] = [toBuilding.coordinates.lat, toBuilding.coordinates.lng]

      // Create a midpoint to simulate a route
      const midLat = (fromCoords[0] + toCoords[0]) / 2
      const midLng = (fromCoords[1] + toCoords[1]) / 2

      // Add a slight offset to the midpoint to make the route look more realistic
      const offset = 0.0005
      const midpoint: [number, number] = [midLat + offset, midLng - offset]

      setRoutePoints([fromCoords, midpoint, toCoords])
    }
  }, [fromBuilding, toBuilding])

  if (!fromBuilding.coordinates || !toBuilding.coordinates) {
    return (
      <div className="flex h-full items-center justify-center bg-gray-100">
        <div className="text-lg font-medium text-gray-500">Coordinates not available for one or both buildings.</div>
      </div>
    )
  }

  const fromCoords: [number, number] = [fromBuilding.coordinates.lat, fromBuilding.coordinates.lng]
  const toCoords: [number, number] = [toBuilding.coordinates.lat, toBuilding.coordinates.lng]

  return (
    <MapContainer
      center={[6.5244, 3.3792]} // Initial center, will be adjusted by MapController
      zoom={17}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='© <a href="https://www.mapbox.com/about/maps/">Mapbox</a>'
        url={`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}`}
        tileSize={512}
        zoomOffset={-1}
      />

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

      <MapController from={fromCoords} to={toCoords} />

      {/* Start Marker */}
      <Marker
        position={fromCoords}
        icon={L.icon({
          ...defaultIcon.options,
          iconUrl: "/marker-icon-start.png",
          iconSize: [30, 46],
          iconAnchor: [15, 46],
        })}
      >
        <Popup>
          <div className="min-w-[200px]">
            <h3 className="font-medium">Start: {fromBuilding.name}</h3>
            <p className="text-sm text-gray-600">{fromBuilding.department}</p>
          </div>
        </Popup>
      </Marker>

      {/* End Marker */}
      <Marker
        position={toCoords}
        icon={L.icon({
          ...defaultIcon.options,
          iconUrl: "/marker-icon-end.png",
          iconSize: [30, 46],
          iconAnchor: [15, 46],
        })}
      >
        <Popup>
          <div className="min-w-[200px]">
            <h3 className="font-medium">Destination: {toBuilding.name}</h3>
            <p className="text-sm text-gray-600">{toBuilding.department}</p>
          </div>
        </Popup>
      </Marker>

      {/* Route Line */}
      {routePoints.length > 0 && <Polyline positions={routePoints} color="#3498DB" weight={5} opacity={0.7} />}
    </MapContainer>
  )
}

