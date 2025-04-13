/**
 * Building API functions
 * Contains helper functions for creating, updating, and managing buildings
 */
import { Building } from "@/lib/types";

// API base URL - using env variable or fallback to localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_NAVIGATION_API_URL || 'https://navigationbackend.onrender.com';

/**
 * Helper function to create a proper slug from a building name
 * @param name The building name
 * @returns A URL-friendly slug
 */
export function createSlug(name: string): string {
  return name.toLowerCase()
    .replace(/\s+/g, "-")          // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "")    // Remove special characters
    .replace(/-+/g, "-")           // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, "");        // Remove leading/trailing hyphens
}

/**
 * Creates a new building
 * @param buildingData Building data to create
 * @returns Promise with created building data
 */
export async function createBuildingApi(buildingData: Partial<Building>) {
  console.log("Creating new building:", buildingData);
  
  if (!buildingData.name || !buildingData.department) {
    throw new Error("Building name and department are required");
  }

  // Generate a slug based on the name
  const slug = createSlug(buildingData.name);
  
  try {
    // First ensure the building has a valid slug
    const buildingWithSlug = {
      ...buildingData,
      slug: slug
    };

    // Use the direct API endpoint for better compatibility
    const response = await fetch(`${API_BASE_URL}/buildings`, {
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

    const data = await response.json();
    console.log("Building created successfully:", data);
    return {
      ...data,
      slug: slug // Ensure slug is returned
    };
  } catch (error) {
    console.error("Error creating building:", error);
    throw error;
  }
}

/**
 * Updates an existing building
 * @param buildingId ID of the building to update
 * @param buildingData Updated building data
 * @returns Promise with updated building data
 */
export async function updateBuildingApi(buildingId: string, buildingData: Partial<Building>) {
  console.log(`Updating building with ID ${buildingId}:`, buildingData);
  
  try {
    // Generate slug from the new name if provided
    const slug = buildingData.name ? createSlug(buildingData.name) : "";
    
    const buildingWithSlug = {
      ...buildingData,
      id: buildingId,
      slug: slug
    };

    // Try direct API endpoint first for better compatibility
    const response = await fetch(`${API_BASE_URL}/buildings/${slug}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildingWithSlug),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Failed to update building: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Building updated successfully:", data);
    return {
      ...data,
      slug: slug // Ensure slug is returned
    };
  } catch (error) {
    console.error(`Error updating building ${buildingId}:`, error);
    throw error;
  }
} 