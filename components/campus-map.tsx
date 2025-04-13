"use client"

import { useEffect, useState, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, Polygon, Tooltip, Polyline, ZoomControl, ScaleControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Building } from "@/lib/types"
import BuildingEditor from "./BuildingEditor"
import { fetchOSMRoads, getRoadStyle, OSMRoad } from "@/lib/osm"
import { loadBoundaries, saveBoundaries } from "@/lib/api"
import 'leaflet-editable'

// Default campus boundaries (fallback)
const DEFAULT_BOUNDARIES: [number, number][] = [

];

// Add custom CSS for map layers
const mapStyles = `
  .reference-layer {
    mix-blend-mode: multiply;
    opacity: 0.8;
    filter: brightness(1.1) contrast(1.2);
    pointer-events: none;
  }

  .road-label {
    background: rgba(255, 255, 255, 0.9) !important;
    border: none !important;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2) !important;
    padding: 4px 8px !important;
    font-size: 12px !important;
    font-weight: 500 !important;
    color: #2c3e50 !important;
    border-radius: 4px !important;
  }

  .road-label::before {
    border-top-color: rgba(255, 255, 255, 0.9) !important;
  }

  .google-map-tiles {
    filter: saturate(1.1) contrast(1.1);
  }
`;

// Inject the styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = mapStyles;
  document.head.appendChild(style);
}

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

L.Marker.prototype.options.icon = defaultIcon

// Component to handle map interactions
function MapController({ 
  center, 
  isEditing, 
  isAddingBuilding,
  boundaryEditMode,
  onBoundaryChange,
  onSaveRequest,
  onMapClick,
  initialBoundaries,
}: { 
  center: [number, number]; 
  isEditing: boolean;
  isAddingBuilding: boolean;
  boundaryEditMode: 'add' | 'edit' | null;
  onBoundaryChange: (coordinates: [number, number][]) => void;
  onSaveRequest: () => void;
  onMapClick: (latlng: L.LatLng) => void;
  initialBoundaries: [number, number][];
}) {
  const map = useMap()
  const editablePoly = useRef<L.Polygon | null>(null)

  useEffect(() => {
    map.setView(center, 15.5)
    setTimeout(() => {
      map.invalidateSize()
    }, 100)

    if (typeof window !== 'undefined') {
      try {
        import('leaflet-editable').then(() => {
          if (!map.editTools) {
            map.editTools = new L.Editable(map);
          }
        }).catch((importError) => {
          console.warn("Error loading Leaflet.Editable:", importError)
        });
      } catch (error) {
        console.warn("Error setting up Leaflet.Editable:", error)
      }
    }

    return () => {
      if (editablePoly.current) {
        editablePoly.current.disableEdit?.();
        editablePoly.current.remove();
      }
    }
  }, [center, map])

  useEffect(() => {
    if (!map.editTools || !boundaryEditMode) return;

    if (boundaryEditMode === 'add') {
      const poly = map.editTools.startPolygon() as L.Polygon;
      editablePoly.current = poly;
      
      poly.on('editable:drawing:end', () => {
        const latlngs = poly.getLatLngs();
        if (Array.isArray(latlngs[0])) {
          const coordinates = (latlngs[0] as L.LatLng[]).map(c => [c.lat, c.lng] as [number, number]);
          if (coordinates.length >= 3) {
            onBoundaryChange(coordinates);
          }
        }
      });
    } else if (boundaryEditMode === 'edit' && initialBoundaries.length > 0) {
      const poly = L.polygon(initialBoundaries);
      editablePoly.current = poly;
      poly.addTo(map);
      
      if (poly.enableEdit) {
        poly.enableEdit();
      }
      
      poly.on('editable:vertex:dragend', () => {
        const latlngs = poly.getLatLngs();
        if (Array.isArray(latlngs[0])) {
          const coordinates = (latlngs[0] as L.LatLng[]).map(c => [c.lat, c.lng] as [number, number]);
          if (coordinates.length >= 3) {
            onBoundaryChange(coordinates);
          }
        }
      });
    }

    return () => {
          if (editablePoly.current) {
        editablePoly.current.disableEdit?.();
        editablePoly.current.remove();
        editablePoly.current = null;
      }
    };
  }, [boundaryEditMode, map, initialBoundaries, onBoundaryChange]);

  useEffect(() => {
    if (!isEditing && editablePoly.current) {
      editablePoly.current.disableEdit?.();
      editablePoly.current.remove();
      editablePoly.current = null;
    }
  }, [isEditing]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isEditing) {
            onSaveRequest();
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [isEditing, onSaveRequest]);

  useEffect(() => {
      const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isAddingBuilding) {
        onMapClick(e.latlng);
      }
      };

      map.on('click', handleMapClick);
    return () => map.off('click', handleMapClick);
  }, [map, isAddingBuilding, onMapClick]);

  return null;
}

// Add OSM Roads Controller component
function OSMRoadsController() {
  const [roads, setRoads] = useState<OSMRoad[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const map = useMap();
  const retryCount = useRef(0);
  const maxRetries = 3;

  useEffect(() => {
    const loadRoads = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const bounds = map.getBounds();
        const roadData = await fetchOSMRoads(bounds);
        
        const validRoads = roadData.filter(road => 
          road.coordinates.every(coord => 
            typeof coord[0] === 'number' && 
            typeof coord[1] === 'number' &&
            !isNaN(coord[0]) && !isNaN(coord[1])
          )
        );
        
        setRoads(validRoads);
        retryCount.current = 0; // Reset retry count on success
      } catch (error) {
        console.error('Error loading OSM roads:', error);
        setError('Failed to load road data');
        
        // Retry logic
        if (retryCount.current < maxRetries) {
          retryCount.current += 1;
          setTimeout(() => {
            loadRoads();
          }, 2000 * retryCount.current); // Exponential backoff
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadRoads();
  }, [map]);

  if (isLoading || error) return null;

  return (
    <>
      {roads.map((road, index) => {
        const positions = road.coordinates.filter(
          (coord): coord is [number, number] => 
            Array.isArray(coord) && 
            coord.length === 2 && 
            typeof coord[0] === 'number' && 
            typeof coord[1] === 'number' &&
            !isNaN(coord[0]) && !isNaN(coord[1])
        );
        
        if (positions.length < 2) return null; // Skip roads with insufficient valid coordinates
        
        return (
          <Polyline
            key={`${road.id}-${index}`}
            positions={positions}
            pathOptions={getRoadStyle(road.type)}
          >
            <Tooltip>{road.name || road.type}</Tooltip>
          </Polyline>
        );
      })}
    </>
  );
}

interface CampusMapProps {
  buildings: Building[]
  selectedBuilding: Building | null
  onBuildingSelect: (building: Building) => void
}

const defaultCenter: [number, number] = [6.5195, 3.3775]

export default function CampusMap({ buildings, selectedBuilding, onBuildingSelect }: CampusMapProps) {
  const [mapCenter] = useState<[number, number]>(defaultCenter)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [boundaryEditMode, setBoundaryEditMode] = useState<'add' | 'edit' | null>(null)
  const [campusBoundaries, setCampusBoundaries] = useState<[number, number][]>(DEFAULT_BOUNDARIES)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [saveStatus, setSaveStatus] = useState<string>("")
  const [isAddingBuilding, setIsAddingBuilding] = useState<boolean>(false)
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [localBuildings, setLocalBuildings] = useState<Building[]>(buildings)
  
  // Load boundaries from API on initial mount
  useEffect(() => {
    const fetchBoundaries = async () => {
      try {
        const boundaries = await loadBoundaries();
        if (boundaries && boundaries.length >= 3) {
          setCampusBoundaries(boundaries);
          console.log('Loaded boundaries from API:', boundaries);
        } else {
          console.log('No valid boundaries found in API, using defaults');
        }
      } catch (error) {
        console.error("Error loading boundaries:", error);
      }
    };
    
    fetchBoundaries();
  }, []);
    
  // Add secret keyword check
  useEffect(() => {
    const checkForSecretKeyword = (text: string) => {
      if (text.toLowerCase().includes("editboundry123")) {
        setIsEditing(true);
      }
    };

    // Listen for input changes
    const inputHandler = (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input && input.value) {
        checkForSecretKeyword(input.value);
      }
    };

    // Find and attach event listeners
    const searchInputs = document.querySelectorAll('input[type="search"], input[type="text"]');
    searchInputs.forEach(input => {
      input.addEventListener('input', inputHandler);
    });

    return () => {
      searchInputs.forEach(input => {
        input.removeEventListener('input', inputHandler);
      });
    };
  }, []);

  // Update local buildings when props change
  useEffect(() => {
    setLocalBuildings(buildings);
  }, [buildings]);

  const handleBoundaryChange = (newBoundaries: [number, number][]) => {
    if (newBoundaries.length >= 3) {
    setCampusBoundaries(newBoundaries);
    }
  }
  
  const saveBoundaryEdits = async () => {
    setIsSaving(true);
    setSaveStatus("Saving boundary changes...");
    
    try {
      if (campusBoundaries.length < 3) {
        setSaveStatus("Error: A boundary must have at least 3 points");
        return;
      }
      
      // Save to the API
      const message = await saveBoundaries(campusBoundaries);
      setSaveStatus(message);
      
        setIsEditing(false);
      setBoundaryEditMode(null);
    } catch (error) {
      console.error('Error saving boundary:', error);
      setSaveStatus("Failed to save boundary changes");
    } finally {
      setIsSaving(false);
      // Clear status after 5 seconds
      setTimeout(() => {
        setSaveStatus("");
      }, 5000);
    }
  }

  // Map click handler for building placement
  const handleMapClick = (latlng: L.LatLng) => {
    if (isAddingBuilding) {
      if (editingBuilding) {
        // Update existing building coordinates
        setEditingBuilding({
          ...editingBuilding,
          coordinates: { lat: latlng.lat, lng: latlng.lng }
        });
      } else {
        // Setup for new building
        setEditingBuilding({
          id: `building-${Date.now()}`,
          name: '',
          department: '',
          description: '',
          coordinates: { lat: latlng.lat, lng: latlng.lng }
        });
      }
    }
  };

  const handleSaveBuilding = (building: Building) => {
    // Update local state only
      const isNewBuilding = !localBuildings.some(b => b.id === building.id);
    const updatedBuildings = isNewBuilding 
      ? [...localBuildings, building]
      : localBuildings.map(b => b.id === building.id ? building : b);
    
      setLocalBuildings(updatedBuildings);
      setEditingBuilding(null);
      setIsAddingBuilding(false);
  };

  const handleDeleteBuilding = (buildingId: string) => {
    // Update local state only
      const updatedBuildings = localBuildings.filter(b => b.id !== buildingId);
      setLocalBuildings(updatedBuildings);
      setEditingBuilding(null);
      setIsAddingBuilding(false);
  };

  const startEditingBuilding = (building: Building) => {
    setEditingBuilding(building);
    setIsAddingBuilding(true);
  };

  const cancelBuildingEdit = () => {
    setEditingBuilding(null);
    setIsAddingBuilding(false);
  };

  // Add a useRef for the map instance and add a check for map initialization
  const mapRef = useRef<L.Map | null>(null);

  return (
    <div className="h-full w-full relative">
      {/* Admin Buttons - Only shown when specifically enabled */}
      {isEditing && (
        <div 
          className="fixed top-20 left-4 z-[9999] p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl"
          style={{ filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.3))' }}
        >
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => {
                if (!isEditing) {
                  const initialMode = campusBoundaries.length > 2 ? 'edit' : 'add';
                  setIsEditing(true);
                  setBoundaryEditMode(initialMode);
                } else {
                  setIsEditing(false);
                  setBoundaryEditMode(null);
                }
                if (isAddingBuilding) cancelBuildingEdit();
              }}
              className="bg-blue-600 text-white px-5 py-3 rounded-md shadow-lg hover:bg-blue-700 transition-colors font-bold text-base flex items-center gap-2"
              disabled={isAddingBuilding}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"/>
              </svg>
              {isEditing ? "Exit Boundary Mode" : "Edit Boundary"}
            </button>
            
            {/* Only show these controls when in boundary edit mode */}
            {isEditing && (
              <div className="flex flex-col gap-2 mt-2 border-t border-gray-300 pt-2">
                <p className="text-sm font-bold text-gray-800 mb-1 bg-gray-100 p-1 rounded text-center">Edit Options:</p>
                <button 
                  onClick={() => setBoundaryEditMode('add')}
                  className={`px-5 py-2 rounded-md shadow-lg transition-colors font-bold text-base flex items-center gap-2 ${
                    boundaryEditMode === 'add' 
                      ? 'bg-green-700 text-white ring-2 ring-green-300' 
                      : 'bg-green-500 text-white hover:bg-green-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                  Add Points
                </button>
                <button 
                  onClick={() => setBoundaryEditMode('edit')}
                  className={`px-5 py-2 rounded-md shadow-lg transition-colors font-bold text-base flex items-center gap-2 ${
                    boundaryEditMode === 'edit' 
                      ? 'bg-yellow-700 text-white ring-2 ring-yellow-300' 
                      : 'bg-yellow-500 text-white hover:bg-yellow-600'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                    <polyline points="15 3 21 3 21 9"/>
                    <line x1="10" y1="14" x2="21" y2="3"/>
                  </svg>
                  Move Points
                </button>
              </div>
            )}
            
            <button 
              onClick={() => {
                setIsAddingBuilding(!isAddingBuilding);
                if (!isAddingBuilding) {
                  setEditingBuilding(null);
                }
                if (isEditing) {
                  setIsEditing(false);
                  setBoundaryEditMode(null);
                }
              }}
              className="bg-purple-600 text-white px-5 py-3 rounded-md shadow-lg hover:bg-purple-700 transition-colors font-bold text-base flex items-center gap-2"
              disabled={isEditing}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
              {isAddingBuilding ? "Cancel" : "Add Building"}
            </button>
          </div>
        </div>
      )}
      
      {/* Building Editor - Only visible when adding/editing a building */}
      {isAddingBuilding && editingBuilding && (
        <BuildingEditor 
          building={editingBuilding}
          onSave={handleSaveBuilding}
          onCancel={cancelBuildingEdit}
          onDelete={handleDeleteBuilding}
        />
      )}
      
      {/* Save Changes Button - Only visible in boundary edit mode */}
      {isEditing && (
        <div 
          className="fixed top-20 right-4 z-[9999] p-2 bg-white/80 backdrop-blur-sm rounded-lg shadow-xl"
          style={{ filter: 'drop-shadow(0 0 10px rgba(0, 0, 0, 0.3))' }}
        >
          <button 
            id="map-save-changes"
            onClick={saveBoundaryEdits}
            className="bg-green-600 text-white px-5 py-3 rounded-md shadow-lg hover:bg-green-700 transition-colors font-bold text-base flex items-center gap-2"
            disabled={isSaving}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
      
      {/* Mode Banners */}
      {isEditing && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white py-2 text-center z-[9999] font-bold text-base shadow-md">
          {!boundaryEditMode 
            ? "Select an action: 'Add Points' or 'Move Points'" 
            : boundaryEditMode === 'add'
              ? "Add Points Mode: Click on the map or boundary lines to add new points"
              : "Move Points Mode: Drag existing points to reposition them"}
          <span className="text-xs block mt-1 bg-yellow-600 mx-auto w-fit px-2 py-1 rounded">
            Current mode: Edit={isEditing.toString()}, SubMode={boundaryEditMode || 'none'}
          </span>
        </div>
      )}
      
      {isAddingBuilding && !editingBuilding && (
        <div className="fixed top-0 left-0 right-0 bg-purple-500 text-white py-2 text-center z-[9999] font-bold text-base shadow-md">
          Building Placement Mode: Click on the map to place a building
        </div>
      )}
      
      {/* Save Status Message */}
      {saveStatus && (
        <div className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[9999] py-2 px-4 rounded-md shadow-lg text-white ${
          saveStatus.includes("Error") || saveStatus.includes("Failed") ? "bg-red-500" : 
          saveStatus.includes("browser storage") ? "bg-yellow-500" : "bg-green-500"
        }`}>
          {saveStatus}
        </div>
      )}

      <MapContainer
        center={mapCenter}
        zoom={15.5}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        whenCreated={(map) => {
          mapRef.current = map;
          return map;
        }}
        className="z-0"
      >
        <ZoomControl position="bottomright" />
        <ScaleControl position="bottomleft" imperial={false} />
        
        {/* Base Satellite Layer */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          maxZoom={22}
          tileSize={256}
          className="google-map-tiles"
        />
        
        {/* Hybrid Layer for Labels */}
        <TileLayer
          attribution='&copy; Google Maps'
          url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
          maxZoom={22}
          tileSize={256}
          className="reference-layer"
        />
        
        {/* OSM Roads Layer */}
        <OSMRoadsController />

        <MapController 
          center={mapCenter} 
          isEditing={isEditing}
          isAddingBuilding={isAddingBuilding}
          boundaryEditMode={boundaryEditMode}
          onBoundaryChange={handleBoundaryChange}
          onSaveRequest={saveBoundaryEdits}
          onMapClick={handleMapClick}
          initialBoundaries={campusBoundaries}
        />

        {/* Render the boundary polygon */}
        {campusBoundaries.length > 2 && (
        <Polygon
          positions={campusBoundaries}
          pathOptions={{
              fillColor: isEditing ? "#f39c12" : "#2C3E50",
              fillOpacity: isEditing ? 0.3 : 0.2,
              weight: isEditing ? 5 : 4,
              color: isEditing ? "#e67e22" : "#e74c3c", 
              opacity: isEditing ? 1 : 0.9,
              dashArray: isEditing ? "5, 10" : undefined
            }}
            eventHandlers={{
              click: (e) => {
                if (!isEditing) {
                  e.originalEvent.stopPropagation();
                }
              }
            }}
          />
        )}

        {/* Show all buildings */}
        {!isEditing && localBuildings.map(
          (building, index) =>
            building.coordinates && (
              <Marker
                key={`building-${building.id || `idx-${index}`}`}
                position={[building.coordinates.lat, building.coordinates.lng]}
                icon={createBuildingIcon(selectedBuilding?.id === building.id)}
                eventHandlers={{
                  click: () => {
                    if (isAddingBuilding) {
                      startEditingBuilding(building);
                    } else {
                      onBuildingSelect(building);
                    }
                  },
                }}
              >
                <Tooltip direction="top" offset={[0, -15]} opacity={0.9} permanent={false}>
                  <div className="p-1">
                    <h4 className="font-bold text-base">{building.name}</h4>
                    <p className="text-sm text-gray-700 mt-1">{building.department}</p>
                    {building.description && (
                      <p className="text-xs text-gray-600 mt-1 max-w-[200px] truncate">{building.description}</p>
                    )}
                  </div>
                </Tooltip>
                
                <Popup>
                  <div className="min-w-[200px]">
                    <h3 className="font-medium">{building.name}</h3>
                    <p className="text-sm text-gray-600">{building.department}</p>
                    {isEditing && (
                      <button 
                        onClick={() => startEditingBuilding(building)}
                        className="mt-2 bg-blue-500 hover:bg-blue-700 text-white text-xs font-bold py-1 px-2 rounded"
                      >
                        Edit Building
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            ),
        )}
      </MapContainer>
    </div>
  )
}

