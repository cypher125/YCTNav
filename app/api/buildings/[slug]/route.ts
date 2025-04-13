import { NextRequest, NextResponse } from "next/server";

// This is a dynamic route handler for /api/buildings/[slug]
// Where slug is now the building name

// API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_NAVIGATION_API_URL 
  ? `${process.env.NEXT_PUBLIC_NAVIGATION_API_URL}/buildings/`
  : 'https://navigationbackend.onrender.com/buildings/';

// Helper function to format building name to slug
function formatSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-");
}

// Handler for GET /api/buildings/[slug]
export async function GET(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    // Properly await params before accessing properties
    const params = await Promise.resolve(context.params);
    const encodedSlug = params.slug;
    
    // Decode URL encoding and then format as slug
    // First decode %20 and other URL encodings to spaces
    const decodedSlug = decodeURIComponent(encodedSlug);
    // Then format the decoded string to a proper slug
    const slug = formatSlug(decodedSlug);
    
    console.log(`Fetching building with slug: ${slug}`);
    
    // First, get all buildings
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Error fetching buildings: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch buildings: ${response.statusText}` },
        { status: response.status }
      );
    }

    const buildings = await response.json();
    
    // Find the specific building by matching slug (derived from name)
    const building = Array.isArray(buildings) 
      ? buildings.find(b => {
          // Create slug from building name to match against
          const buildingSlug = formatSlug(b.name);
          return buildingSlug === slug;
        })
      : null;
      
    if (!building) {
      console.error(`Building not found with slug: ${slug}`);
      return NextResponse.json(
        { error: `Building not found with slug: ${slug}` },
        { status: 404 }
      );
    }
    
    // Add the slug to the building object before returning
    const buildingWithSlug = {
      ...building,
      slug: formatSlug(building.name)
    };
    
    // Return the found building
    return NextResponse.json(buildingWithSlug);
  } catch (error) {
    console.error("Error in GET /api/buildings/[slug]:", error);
    return NextResponse.json(
      { error: `Failed to fetch building: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Handler for PUT /api/buildings/[slug]
export async function PUT(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    // Properly await params before accessing properties
    const params = await Promise.resolve(context.params);
    const encodedSlug = params.slug;
    
    // Decode URL encoding and then format as slug
    const decodedSlug = decodeURIComponent(encodedSlug);
    const slug = formatSlug(decodedSlug);
    
    console.log(`Updating building with slug: ${slug}`);
    
    // Get the updated building data from the request
    const updatedBuilding = await request.json();
    
    // First, get all buildings
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Error fetching buildings: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch buildings: ${response.statusText}` },
        { status: response.status }
      );
    }

    const buildings = await response.json();
    
    if (!Array.isArray(buildings)) {
      console.error("Invalid buildings data received from API");
      return NextResponse.json(
        { error: "Invalid buildings data received from API" },
        { status: 500 }
      );
    }
    
    // Find the building index by matching slug
    const buildingIndex = buildings.findIndex(b => formatSlug(b.name) === slug);
    
    if (buildingIndex === -1) {
      console.error(`Building not found with slug: ${slug}`);
      return NextResponse.json(
        { error: `Building not found with slug: ${slug}` },
        { status: 404 }
      );
    }
    
    // Replace the building with the updated version
    buildings[buildingIndex] = {
      ...updatedBuilding,
      // Keep the original name if a new one isn't provided
      name: updatedBuilding.name || buildings[buildingIndex].name,
    };
    
    // Send the entire updated list back to the API
    const updateResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildings),
    });

    if (!updateResponse.ok) {
      console.error(`Error updating buildings: ${updateResponse.status} ${updateResponse.statusText}`);
      const errorText = await updateResponse.text();
      console.error("Error response body:", errorText);
      return NextResponse.json(
        { error: `Failed to update building: ${updateResponse.statusText}` },
        { status: updateResponse.status }
      );
    }
    
    // Add slug to the response
    const updatedBuildingWithSlug = {
      ...buildings[buildingIndex],
      slug: formatSlug(buildings[buildingIndex].name)
    };
    
    // Return the updated building
    return NextResponse.json(updatedBuildingWithSlug);
  } catch (error) {
    console.error("Error in PUT /api/buildings/[slug]:", error);
    return NextResponse.json(
      { error: `Failed to update building: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}

// Handler for DELETE /api/buildings/[slug]
export async function DELETE(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    // Properly await params before accessing properties
    const params = await Promise.resolve(context.params);
    const encodedSlug = params.slug;
    
    // Decode URL encoding and then format as slug
    const decodedSlug = decodeURIComponent(encodedSlug);
    const slug = formatSlug(decodedSlug);
    
    console.log(`Deleting building with slug: ${slug}`);
    
    // First, get all buildings
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`Error fetching buildings: ${response.status} ${response.statusText}`);
      return NextResponse.json(
        { error: `Failed to fetch buildings: ${response.statusText}` },
        { status: response.status }
      );
    }

    const buildings = await response.json();
    
    if (!Array.isArray(buildings)) {
      console.error("Invalid buildings data received from API");
      return NextResponse.json(
        { error: "Invalid buildings data received from API" },
        { status: 500 }
      );
    }
    
    // Find the building index by matching slug
    const buildingIndex = buildings.findIndex(b => formatSlug(b.name) === slug);
    
    if (buildingIndex === -1) {
      console.error(`Building not found with slug: ${slug}`);
      return NextResponse.json(
        { error: `Building not found with slug: ${slug}` },
        { status: 404 }
      );
    }
    
    // Get the building before removing it
    const deletedBuilding = buildings[buildingIndex];
    
    // Remove the building from the array
    const updatedBuildings = [
      ...buildings.slice(0, buildingIndex),
      ...buildings.slice(buildingIndex + 1)
    ];
    
    // Send the updated list back to the API
    // NOTE: The external API only supports POST to /buildings for updates, including deletions
    const deleteResponse = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedBuildings),
    });

    if (!deleteResponse.ok) {
      console.error(`Error updating buildings after deletion: ${deleteResponse.status} ${deleteResponse.statusText}`);
      const errorText = await deleteResponse.text();
      console.error("Error response body:", errorText);
      return NextResponse.json(
        { error: `Failed to delete building: ${deleteResponse.statusText}` },
        { status: deleteResponse.status }
      );
    }
    
    // Return a success response
    return NextResponse.json({ success: true, message: `Building ${deletedBuilding.name} deleted successfully` });
  } catch (error) {
    console.error("Error in DELETE /api/buildings/[slug]:", error);
    return NextResponse.json(
      { error: `Failed to delete building: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 