/**
 * API utilities for the campus map
 * Provides functions for loading and saving campus boundaries
 */

// Default boundary points as fallback if loading fails
export const defaultBoundaries: [number, number][] = [
];

// Local storage key for saving boundaries when API fails
const LOCAL_STORAGE_KEY = 'yabatech-campus-boundaries';

// API base URL - using env variable or fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_NAVIGATION_API_URL || 'https://navigationbackend.onrender.com';

/**
 * Saves boundaries to localStorage as a fallback
 * @param boundaries The boundary coordinates to save
 */
function saveToLocalStorage(boundaries: [number, number][]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(boundaries));
      console.log('Successfully saved boundaries to localStorage');
    }
  } catch (error) {
    console.warn('Failed to save boundaries to localStorage:', error);
  }
}

/**
 * Loads boundaries from localStorage if available
 * @returns Boundary coordinates or null if not found
 */
function loadFromLocalStorage(): [number, number][] | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData) && parsedData.length >= 3) {
          console.log('Successfully loaded boundaries from localStorage');
          return parsedData;
        }
      }
    }
    return null;
  } catch (error) {
    console.warn('Failed to load boundaries from localStorage:', error);
    return null;
  }
}

/**
 * Loads campus boundaries from the server
 * @returns Promise resolving to array of boundary coordinates
 */
export async function loadBoundaries(): Promise<[number, number][] | null> {
  try {
    const response = await fetch('/api/boundaries');
    
    if (!response.ok) {
      throw new Error(`Failed to load boundaries: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.boundaries;
  } catch (error) {
    console.error("Error loading boundaries:", error);
    return null;
  }
}

/**
 * Saves campus boundaries to the server
 * @param boundaries Array of boundary coordinates to save
 * @returns Promise resolving to success message
 */
export async function saveBoundaries(boundaries: [number, number][]): Promise<string> {
  try {
    const response = await fetch('/api/boundaries', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ boundaries }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save boundaries: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.message || "Boundaries saved successfully";
  } catch (error) {
    console.error("Error saving boundaries:", error);
    return `Error: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}

/**
 * Loads all buildings from the Navigation API
 * @returns Promise resolving to array of buildings
 */
export async function loadBuildings() {
  try {
    console.log('Fetching buildings from local API proxy');
    const response = await fetch('/api/buildings', {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-cache', // Skip cache to ensure fresh data
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      throw new Error(`Failed to load buildings: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Buildings data received:', data);
    return data;
  } catch (error) {
    console.error("Error loading buildings:", error);
    return null;
  }
}

/**
 * Loads a building by its slug
 * @param slug The building slug to load
 * @returns Promise resolving to building data
 */
export async function loadBuildingBySlug(slug: string) {
  try {
    console.log(`Fetching building with slug '${slug}' from local API proxy`);
    const response = await fetch(`/api/buildings/${slug}`, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-cache', // Skip cache to ensure fresh data
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load building: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Building data received:', data);
    return data;
  } catch (error) {
    console.error(`Error loading building with slug ${slug}:`, error);
    return null;
  }
}

/**
 * Creates a new building
 * @param buildingData The building data to create
 * @returns Promise resolving to the created building
 */
export async function createBuilding(buildingData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/buildings/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildingData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create building: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error creating building:", error);
    throw error;
  }
}

/**
 * Updates a building by its slug
 * @param slug The building slug to update
 * @param buildingData The building data to update
 * @returns Promise resolving to the updated building
 */
export async function updateBuilding(slug: string, buildingData: any) {
  try {
    const response = await fetch(`${API_BASE_URL}/buildings/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildingData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update building: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error updating building with slug ${slug}:`, error);
    throw error;
  }
}

/**
 * Uploads an image for a building
 * @param slug The building slug
 * @param imageFile The image file to upload
 * @returns Promise resolving to the updated building data
 */
export async function uploadBuildingImage(slug: string, imageFile: File) {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/buildings/${slug}/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error uploading image for building with slug ${slug}:`, error);
    throw error;
  }
}

/**
 * Gets the image URL for a building
 * @param slug The building slug or name
 * @returns The complete URL to the building image
 */
export function getBuildingImageUrl(slug: string): string {
  // Make sure slug is properly formatted (in case a name was passed instead of a slug)
  const formattedSlug = typeof slug === 'string' 
    ? slug.toLowerCase().replace(/\s+/g, "-")
    : slug;
  
  return `${API_BASE_URL}/images/buildings/${formattedSlug}.jpg`;
} 