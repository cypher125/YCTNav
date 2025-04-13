"use client"

import { useState, useEffect, useRef } from "react"
import { Building } from "@/lib/types"
import Link from "next/link"
import { ArrowLeft, Plus, Edit, Trash2, Save, X, Search, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import dynamic from "next/dynamic"
import { uploadBuildingImage, getBuildingImageUrl } from '@/lib/api'
import { createBuildingApi, updateBuildingApi } from '@/lib/buildingApi'
import Image from 'next/image'

// Dynamically import the MapSelector component with no SSR
// This is necessary because Leaflet requires the window object
const MapSelector = dynamic(
  () => import("@/components/admin/MapSelector"),
  { ssr: false }
)

export default function AdminBuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [loading, setLoading] = useState(true)
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null)
  const [isAddingBuilding, setIsAddingBuilding] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showMap, setShowMap] = useState(false)
  const [formData, setFormData] = useState<Partial<Building>>({
    name: "",
    department: "",
    description: "",
    coordinates: { lat: 6.51771, lng: 3.37534 }, // Default YabaTech coordinates
  })

  // Add a debug function to help diagnose API response issues
  const [debugMode, setDebugMode] = useState(false);
  const [rawApiData, setRawApiData] = useState<any>(null);

  const toggleDebug = () => setDebugMode(!debugMode);

  // Add image state inside the component
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Helper function to create a slug from a building name
  const createSlug = (name: string): string => {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  // Fetch buildings on component mount
  useEffect(() => {
    fetchBuildings()
  }, [])

  const fetchBuildings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/buildings")
      if (!response.ok) throw new Error("Failed to fetch buildings")
      const data = await response.json()
      
      // Store the raw API response for debugging
      setRawApiData(data);
      console.log("Raw API response:", data);
      
      // Handle various response formats from the external API
      // The response structure depends on the backend implementation
      let buildingsData: Building[] = [];
      
      if (Array.isArray(data)) {
        // API returned an array of buildings directly
        console.log("Response is an array with", data.length, "buildings");
        buildingsData = data;
      } else if (data && typeof data === 'object') {
        // The API might wrap buildings in an object
        if (Array.isArray(data.buildings)) {
          console.log("Found buildings array with", data.buildings.length, "buildings");
          buildingsData = data.buildings;
        } else if (Array.isArray(data.data)) {
          // Some APIs use data.data pattern
          console.log("Found data array with", data.data.length, "buildings");
          buildingsData = data.data;
        } else if (Array.isArray(data.results)) {
          // Some APIs use data.results pattern
          console.log("Found results array with", data.results.length, "buildings");
          buildingsData = data.results;
        } else {
          // Last resort: check if data itself looks like a building
          // (single building response)
          if (data.name && data.coordinates) {
            console.log("Response appears to be a single building");
            buildingsData = [data];
          } else {
            // Try to extract any array that contains buildings
            let foundBuildings = false;
            for (const key in data) {
              if (Array.isArray(data[key])) {
                const possibleBuildings = data[key];
                if (
                  possibleBuildings.length > 0 &&
                  possibleBuildings[0] &&
                  typeof possibleBuildings[0] === 'object' &&
                  ('name' in possibleBuildings[0] || 'id' in possibleBuildings[0])
                ) {
                  buildingsData = possibleBuildings;
                  console.log(`Found buildings in ${key} property with ${possibleBuildings.length} items`);
                  foundBuildings = true;
                  break;
                }
              }
            }
            
            if (!foundBuildings) {
              console.warn("Couldn't identify buildings in the response:", Object.keys(data));
            }
          }
        }
      }
      
      // Process buildings to ensure consistent format
      // IMPORTANT: Preserve original IDs from backend - these are the only IDs that will work with PUT/DELETE
      const processedBuildings = buildingsData.map((building, index) => ({
        ...building,
        // Keep the original ID if it exists, only generate a fallback for display in React
        // DO NOT modify the original ID if it exists - it must match what's in the backend
        _originalId: building.id || building._id, // Store original ID separately
        id: building.id || building._id || building.slug || `building-${Date.now()}-${index}`,
        // Ensure coordinates are in the expected format
        coordinates: {
          lat: typeof building.coordinates?.lat === 'number' 
            ? building.coordinates.lat 
            : typeof building.coordinates?.latitude === 'number'
              ? building.coordinates.latitude
              : typeof building.latitude === 'number'
                ? building.latitude
                : 6.51771, // Default if nothing found
          lng: typeof building.coordinates?.lng === 'number' 
            ? building.coordinates.lng 
            : typeof building.coordinates?.longitude === 'number'
              ? building.coordinates.longitude
              : typeof building.longitude === 'number'
                ? building.longitude
                : 3.37534, // Default if nothing found
        }
      }));
      
      console.log(`Final result: Found ${processedBuildings.length} buildings`);
      
      setBuildings(processedBuildings);
    } catch (error) {
      console.error("Error fetching buildings:", error)
      toast.error("Failed to load buildings")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target

    if (name.startsWith("coordinates.")) {
      const coord = name.split(".")[1] as "lat" | "lng"
      setFormData({
        ...formData,
        coordinates: {
          ...formData.coordinates!,
          [coord]: parseFloat(value),
        },
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleCoordinatesChange = (coordinates: {lat: number, lng: number}) => {
    setFormData({
      ...formData,
      coordinates
    })
  }

  const startEditing = (building: Building) => {
    // Ensure the building has an ID
    const buildingWithId = {
      ...building,
      id: building.id || building.slug || `building-${Date.now()}`
    };
    
    setEditingBuilding(buildingWithId)
    setFormData({
      name: building.name,
      department: building.department,
      description: building.description || "",
      coordinates: { ...building.coordinates },
    })
    setIsAddingBuilding(false)
    setShowMap(false)
    
    // Set image preview if there's an image
    if (building.image) {
      setImagePreview(getBuildingImageUrl(building.slug || building.id));
    } else {
      setImagePreview(null);
    }
    setImageFile(null);
  }

  const startAddingBuilding = () => {
    setIsAddingBuilding(true)
    setEditingBuilding(null)
    setFormData({
      name: "",
      department: "",
      description: "",
      coordinates: { lat: 6.51771, lng: 3.37534 }, // Default YabaTech coordinates
    })
    setShowMap(false)
    setImagePreview(null);
    setImageFile(null);
  }

  const cancelEditing = () => {
    setEditingBuilding(null)
    setIsAddingBuilding(false)
    setShowMap(false)
  }

  const toggleMap = () => {
    setShowMap(!showMap)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSaveBuilding = async () => {
    if (!formData.name || !formData.department) {
      setError("Building name and department are required");
      return;
    }

    // Ensure coordinates are properly formatted
    if (!formData.coordinates || typeof formData.coordinates.lat !== 'number' || typeof formData.coordinates.lng !== 'number') {
      setError("Valid coordinates (latitude and longitude) are required");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      // Helper function to create a slug from a name
      const createSlug = (name: string) => {
        return name.toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");
      };
      
      // Ensure the building has a valid slug
      const slug = createSlug(formData.name);
      const buildingWithSlug = {
        ...formData,
        slug: slug,
        // Ensure coordinates are properly formatted
        coordinates: {
          lat: parseFloat(formData.coordinates.lat.toString()),
          lng: parseFloat(formData.coordinates.lng.toString())
        }
      };
      
      let savedBuilding;
      
      if (editingBuilding) {
        // Update existing building
        console.log(`Updating building with ID ${editingBuilding.id}:`, buildingWithSlug);
        
        const response = await fetch(`/api/buildings/${slug}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...buildingWithSlug,
            id: editingBuilding.id
          }),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to update building: ${response.statusText}`);
        }
        
        savedBuilding = await response.json();
        console.log("Building updated successfully:", savedBuilding);
        toast.success(`Building "${formData.name}" updated successfully`);
      } else {
        // Create new building
        console.log("Creating new building:", buildingWithSlug);
        
        const response = await fetch(`/api/buildings`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(buildingWithSlug),
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Error response:", errorText);
          throw new Error(`Failed to create building: ${response.statusText}`);
        }
        
        savedBuilding = await response.json();
        console.log("Building created successfully:", savedBuilding);
        toast.success(`Building "${formData.name}" created successfully`);
      }
      
      // If we have a new image and the building was saved successfully
      if (imageFile && savedBuilding && slug) {
        try {
          // Create a FormData object to upload the image
          const imageFormData = new FormData();
          imageFormData.append('file', imageFile);
          
          // Upload the image using direct API call
          const uploadResponse = await fetch(`/api/buildings/${slug}/upload`, {
            method: 'POST',
            body: imageFormData,
          });
          
          if (!uploadResponse.ok) {
            throw new Error(`Failed to upload image: ${uploadResponse.statusText}`);
          }
          
          console.log('Image uploaded successfully');
        } catch (error) {
          console.error('Error uploading image:', error);
          setError('Building saved but image upload failed');
        }
      }
      
      // Refresh buildings list
      fetchBuildings();
      
      // Clear form
      setFormData({
        name: "",
        department: "",
        description: "",
        coordinates: { lat: 0, lng: 0 },
      });
      setEditingBuilding(null);
      setIsAddingBuilding(false);
      setImageFile(null);
      setImagePreview(null);
      
    } catch (error) {
      console.error("Error saving building:", error);
      setError(error instanceof Error ? error.message : "Failed to save building");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteBuilding = async (building: Building) => {
    if (!window.confirm(`Are you sure you want to delete ${building.name}?`)) {
      return
    }

    try {
      // Use building name as the unique identifier
      const buildingName = building.name;
      
      if (!buildingName) {
        toast.error("Cannot delete building: Missing name");
        return;
      }
      
      console.log(`Deleting building with name: ${buildingName}`);
      
      // URL encode the building name for the API path
      const encodedName = encodeURIComponent(buildingName);
      
      const response = await fetch(`/api/buildings/${encodedName}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        let errorMessage = response.statusText || 'Unknown error';
        
        try {
          const errorText = await response.text();
          console.error("Delete Error Response:", errorText);
          
          // Try to parse as JSON if possible
          try {
            const jsonError = JSON.parse(errorText);
            if (jsonError.error) {
              errorMessage = jsonError.error;
            }
          } catch (e) {
            // If not valid JSON, use the raw text
            errorMessage = errorText || errorMessage;
          }
        } catch (e) {
          console.error("Couldn't read error response", e);
        }
        
        // Handle specific error codes
        if (response.status === 404) {
          toast.error("Building not found on the server. It may have been already deleted.");
          // Refresh the buildings list to get the current state
          fetchBuildings();
          return;
        } else if (response.status === 405) {
          // Method Not Allowed - likely an API compatibility issue
          toast.error(`API Error: Method Not Allowed. The backend may not support this operation.`);
          console.error("Method Not Allowed - The backend API may expect a different format");
          fetchBuildings();
          return;
        }
        
        throw new Error(`Failed to delete building: ${errorMessage}`);
      }

      const responseData = await response.json();
      console.log("Delete success response:", responseData);

      toast.success("Building deleted successfully")
      fetchBuildings() // Reload buildings
    } catch (error) {
      console.error("Error deleting building:", error)
      toast.error(`Failed to delete building: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Filter buildings based on search term
  const filteredBuildings = buildings.filter(
    (building) =>
      building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      building.department.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link 
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Home</span>
          </Link>
          <h1 className="text-3xl font-bold text-[var(--yabatech-dark-green)]">
            Building Management
          </h1>
          <p className="text-gray-600">Add, edit or delete campus buildings</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={toggleDebug}
            variant="outline"
            className="border-gray-300 text-gray-600"
          >
            {debugMode ? "Hide Debug" : "Debug API"}
          </Button>
          <Button 
            onClick={startAddingBuilding}
            className="bg-[var(--yabatech-green)] hover:bg-[var(--yabatech-dark-green)]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Building
          </Button>
        </div>
      </div>

      {/* Debug Panel - helps diagnose API issues */}
      {debugMode && rawApiData && (
        <div className="mb-6 p-4 bg-gray-100 rounded-lg overflow-auto max-h-[500px]">
          <h3 className="font-semibold mb-2">API Response Debug:</h3>
          <pre className="text-xs">{JSON.stringify(rawApiData, null, 2)}</pre>
        </div>
      )}

      {/* Search */}
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search buildings..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[var(--yabatech-green)]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Building Form */}
      {(isAddingBuilding || editingBuilding) && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {isAddingBuilding ? "Add New Building" : "Edit Building"}
            </h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={cancelEditing}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSaveBuilding}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--yabatech-green)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department/Category*
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--yabatech-green)]"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--yabatech-green)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude*
                </label>
                <input
                  type="number"
                  name="coordinates.lat"
                  value={formData.coordinates?.lat || ""}
                  onChange={handleInputChange}
                  step="0.000001"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--yabatech-green)]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude*
                </label>
                <input
                  type="number"
                  name="coordinates.lng"
                  value={formData.coordinates?.lng || ""}
                  onChange={handleInputChange}
                  step="0.000001"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--yabatech-green)]"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={toggleMap}
                  className="flex items-center gap-2 mb-4 border-[var(--yabatech-green)] text-[var(--yabatech-green)]"
                >
                  <MapPin className="h-4 w-4" />
                  {showMap ? 'Hide Map Selector' : 'Use Map to Select Location'}
                </Button>
                
                {showMap && (
                  <div className="mt-2">
                    <MapSelector 
                      value={formData.coordinates || { lat: 6.51771, lng: 3.37534 }}
                      onChange={handleCoordinatesChange}
                      buildings={buildings.filter(b => !editingBuilding || b.id !== editingBuilding.id)}
                    />
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Image
                </label>
                <div 
                  onClick={handleImageUploadClick}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50"
                >
                  {imagePreview ? (
                    <div className="relative h-40 w-full mb-2">
                      <Image 
                        src={imagePreview} 
                        alt="Building preview" 
                        fill
                        className="object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="py-8">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-500">
                        Click to upload an image
                      </p>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleImageChange} 
                    accept="image/*" 
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={cancelEditing}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[var(--yabatech-green)] hover:bg-[var(--yabatech-dark-green)]"
              >
                <Save className="h-4 w-4 mr-2" />
                {isAddingBuilding ? "Add Building" : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Buildings List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-600">Loading buildings...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Building
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coordinates
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBuildings.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                    {searchTerm ? "No buildings match your search" : "No buildings found"}
                  </td>
                </tr>
              ) : (
                filteredBuildings.map((building, index) => (
                  <tr key={building.id ? building.id : `building-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {building.name}
                      </div>
                      {building.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {building.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {building.department}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {building.coordinates.lat.toFixed(6)}, {building.coordinates.lng.toFixed(6)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(building)}
                        className="text-blue-600 hover:text-blue-900 mr-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBuilding(building)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
} 