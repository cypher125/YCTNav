"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, useMap, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Building } from "@/lib/types"

// Create custom SVG building marker
const createBuildingIcon = (isSelected: boolean = false) => {
  const sizeFactor = isSelected ? 1.5 : 1.3;
  const baseSize = 32;
  const width = baseSize * sizeFactor;
  const height = baseSize * sizeFactor;
  
  return L.divIcon({
    html: `
      <svg width="${width}" height="${height}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.5));">
        <!-- Building Base -->
        <rect x="3" y="4" width="18" height="16" rx="1" 
              fill="${isSelected ? '#e74c3c' : '#3498db'}" 
              stroke="${isSelected ? '#c0392b' : '#2980b9'}" 
              stroke-width="2" />
        
        <!-- Windows -->
        <rect x="6" y="7" width="3" height="3" fill="white" />
        <rect x="6" y="12" width="3" height="3" fill="white" />
        <rect x="15" y="7" width="3" height="3" fill="white" />
        <rect x="15" y="12" width="3" height="3" fill="white" />
        
        <!-- Door -->
        <rect x="10.5" y="15" width="3" height="5" fill="white" rx="1" />
        
        <!-- Roof -->
        <polygon points="3,4 12,1 21,4" 
                fill="${isSelected ? '#c0392b' : '#2980b9'}" 
                stroke="${isSelected ? '#c0392b' : '#2980b9'}" />
      </svg>
    `,
    className: '',
    iconSize: [width, height],
    iconAnchor: [width/2, height],
    popupAnchor: [0, -height]
  });
};

// Create a custom pin marker for the active location
const createPinIcon = () => {
  return L.divIcon({
    html: `
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 3px rgba(0, 0, 0, 0.5));">
        <path d="M12 21C11.5 21 11 20.8 10.6 20.4C7.1 16.9 5 13.5 5 10.5C5 7.6 7.5 5 10.5 5C11.3 5 12 5.1 12.8 5.5C16.4 5.5 19 8 19 11C19 13.9 16.9 17.4 13.4 20.4C13 20.8 12.5 21 12 21Z" 
              fill="#e74c3c" 
              stroke="#c0392b" 
              stroke-width="2" />
        <circle cx="12" cy="11" r="3" fill="white" />
      </svg>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// MapController component to handle events
function MapController({ 
  onMapClick,
  position,
}: { 
  onMapClick: (position: {lat: number, lng: number}) => void
  position: {lat: number, lng: number}
}) {
  const map = useMap()
  
  useEffect(() => {
    // Center map on the current position with a more suitable zoom level for satellite imagery
    map.setView([position.lat, position.lng], 18, {
      animate: true,
      duration: 1 // 1 second animation
    })
    
    // Invalidate map size to ensure proper rendering
    setTimeout(() => {
      map.invalidateSize()
    }, 100)
    
    // Enable smooth wheel zoom for better zooming experience
    // @ts-ignore - Types might not include this method but it exists in Leaflet
    if (map.options && !map.options.smoothWheelZoom) {
      map.options.smoothWheelZoom = true
      map.options.smoothSensitivity = 1.5
    }
  }, [map, position])
  
  useEffect(() => {
    // Add click handler to map
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      onMapClick({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      })
    }
    
    map.on('click', handleMapClick)
    
    return () => {
      map.off('click', handleMapClick)
    }
  }, [map, onMapClick])
  
  return null
}

interface MapSelectorProps {
  value: {lat: number, lng: number}
  onChange: (position: {lat: number, lng: number}) => void
  buildings?: Building[]
}

export default function MapSelector({ value, onChange, buildings = [] }: MapSelectorProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  
  // Default center on YabaTech
  const defaultPosition = { lat: 6.51771, lng: 3.37534 }
  const position = value.lat && value.lng ? value : defaultPosition
  
  // Handle marker drag
  const handleMarkerDrag = (e: L.LeafletEvent) => {
    const marker = e.target
    const position = marker.getLatLng()
    onChange({
      lat: position.lat,
      lng: position.lng
    })
  }
  
  // Handle map click
  const handleMapClick = (newPosition: {lat: number, lng: number}) => {
    onChange(newPosition)
  }
  
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={18}
        style={{ height: "100%", width: "100%" }}
        ref={mapContainerRef}
        zoomControl={false}
        scrollWheelZoom={true}
        doubleClickZoom={true}
        dragging={true}
        attributionControl={true}
        maxZoom={20}
        minZoom={10}
        zoomSnap={0.5}
        zoomDelta={0.5}
      >
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          maxZoom={20}
          minZoom={10}
          tileSize={256}
        />
        
        {/* Hybrid Layer for Labels */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
          maxZoom={20}
          minZoom={10}
          tileSize={256}
          className="reference-layer"
          opacity={0.7}
        />
        
        {/* Existing buildings */}
        {buildings.map((building, index) => (
          <Marker
            key={building.name ? building.name : `map-building-${index}`}
            position={[building.coordinates.lat, building.coordinates.lng]}
            opacity={0.7}
            icon={createBuildingIcon(false)}
          />
        ))}
        
        {/* Current position marker (draggable) */}
        <Marker
          position={[position.lat, position.lng]}
          draggable={true}
          eventHandlers={{
            dragend: handleMarkerDrag
          }}
          icon={createPinIcon()}
        />
        
        {/* Map controller for handling events */}
        <MapController
          onMapClick={handleMapClick}
          position={position}
        />
        
        {/* Add zoom control in bottom right */}
        <ZoomControl position="bottomright" />
      </MapContainer>
      
      <div className="bg-gray-100 text-xs p-2 text-gray-500">
        Click on the map to place the marker or drag the marker to adjust position
      </div>
    </div>
  )
} 