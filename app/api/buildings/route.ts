import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { Building } from '@/lib/types';

// Define paths for building data storage
const primaryBuildingsFilePath = path.join(process.cwd(), 'buildings.json');
const fallbackBuildingsFilePath = path.join(process.cwd(), 'public', 'buildings.json');
const tmpBuildingsFilePath = path.join(process.cwd(), 'public', 'data', 'buildings.json'); 

// Debug info to help troubleshoot
console.log('API: Current working directory:', process.cwd());
console.log('API: Buildings primary path:', primaryBuildingsFilePath);
console.log('API: Buildings fallback path:', fallbackBuildingsFilePath);
console.log('API: Buildings tmp path:', tmpBuildingsFilePath);

// Default empty buildings array
const defaultBuildings: Building[] = [];

/**
 * Determine the best place to store the buildings file
 * @returns The path to use for the buildings file
 */
function getBuildingsFilePath(): string {
  // Try each path in order until we find one we can write to
  const potentialPaths = [
    primaryBuildingsFilePath,
    fallbackBuildingsFilePath,
    tmpBuildingsFilePath
  ];
  
  for (const filePath of potentialPaths) {
    try {
      // Ensure directory exists
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`API: Created directory: ${dirPath}`);
      }
      
      // Test if we can write to this path
      try {
        // Use access to check write permission
        fs.accessSync(dirPath, fs.constants.W_OK);
        console.log(`API: Can write to ${dirPath}`);
        
        // If we can access it for writing, try to actually write a test file
        const testFile = path.join(dirPath, '.write-test');
        fs.writeFileSync(testFile, 'test', 'utf8');
        fs.unlinkSync(testFile); // Clean up
        console.log(`API: Successfully wrote test file to ${dirPath}`);
        
        return filePath;
      } catch (error) {
        console.log(`API: Cannot write to ${dirPath}:`, error);
      }
    } catch (err) {
      console.log(`API: Error with path ${filePath}:`, err);
    }
  }
  
  // If all paths fail, return the last one and let the caller handle the error
  console.log('API: All paths failed, using tmp path as last resort');
  return tmpBuildingsFilePath;
}

/**
 * Check if the buildings file exists, create it with default data if not
 * @param filePath The path to the buildings file
 */
function ensureFileExists(filePath: string): void {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`API: Creating buildings file at ${filePath}`);
      const dirPath = path.dirname(filePath);
      
      // Ensure directory exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`API: Created directory: ${dirPath}`);
      }
      
      fs.writeFileSync(
        filePath,
        JSON.stringify({ buildings: defaultBuildings }, null, 2),
        'utf8'
      );
      console.log(`API: Created default buildings file at ${filePath}`);
    } else {
      console.log(`API: Buildings file already exists at ${filePath}`);
    }
  } catch (error) {
    console.error(`API: Error ensuring file exists at ${filePath}:`, error);
    // Let the caller handle this error
    throw error;
  }
}

// Handler for GET requests
export async function GET() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_NAVIGATION_API_URL || 'https://navigationbackend.onrender.com';
    console.log(`Proxying GET request to: ${API_URL}/buildings/`);
    
    const response = await fetch(`${API_URL}/buildings/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch buildings: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Buildings data received:', data.length || (typeof data === 'object' ? Object.keys(data).length : 0), 'items');
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return NextResponse.json(
      { error: "Failed to fetch buildings from navigation backend" },
      { status: 500 }
    );
  }
}

// Handler for POST requests - create a new building or update all buildings
export async function POST(request: NextRequest) {
  console.log(`API: Handling POST request to /api/buildings`);
  
  try {
    // Get the request JSON data
    const body = await request.json();
    console.log('API: POST request body type:', Array.isArray(body) ? 'Array' : typeof body);
    
    // The API expects different formats based on whether we're
    // 1. Adding a single building (via the form)
    // 2. Updating the entire list (via PUT/DELETE operations that modify the whole list)
    
    let dataToSend;
    const API_URL = process.env.NEXT_PUBLIC_NAVIGATION_API_URL || 'https://navigationbackend.onrender.com';
    
    if (Array.isArray(body)) {
      // This is a full list update (coming from PUT/DELETE operations)
      console.log(`API: Updating entire buildings list with ${body.length} buildings`);
      dataToSend = body;
    } else if (body && typeof body === 'object') {
      // Single building object - either from form or as JSON object
      console.log('API: Adding a new building:', body.name);
      
      // Validate building data
      if (!body.name || !body.coordinates) {
        return NextResponse.json(
          { 
            error: 'Invalid building data',
            message: 'Building must have a name and coordinates'
          },
          { status: 400 }
        );
      }
      
      if (typeof body.coordinates.lat !== 'number' || 
          typeof body.coordinates.lng !== 'number') {
        return NextResponse.json(
          { 
            error: 'Invalid coordinates',
            message: 'Coordinates must contain lat and lng numeric values'
          },
          { status: 400 }
        );
      }
      
      // For single building creation, just send the building directly
      // Don't merge with existing buildings - that's not how the API works
      dataToSend = {
        ...body,
        coordinates: {
          lat: body.coordinates.lat,
          lng: body.coordinates.lng
        }
      };
    } else {
      return NextResponse.json(
        { 
          error: 'Invalid request format',
          message: 'Request must include building data or an array of buildings'
        },
        { status: 400 }
      );
    }
    
    // Forward the request to the backend API
    console.log(`Sending ${Array.isArray(dataToSend) ? dataToSend.length : 0} buildings to: ${API_URL}/buildings/`);
    console.log('Detailed data being sent:', JSON.stringify(dataToSend, null, 2));
    
    // Use correct method based on operation:
    // - POST for single building creation
    // - PUT for updating/replacing the building list
    const method = Array.isArray(dataToSend) ? 'PUT' : 'POST';
    console.log(`Using ${method} method for this operation`);
    
    const response = await fetch(`${API_URL}/buildings/`, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dataToSend),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error from backend:`, errorText);
      console.error(`Status code: ${response.status}, Status text: ${response.statusText}`);
      
      // Try to parse error as JSON if possible
      try {
        const errorJson = JSON.parse(errorText);
        console.error('Parsed error details:', errorJson);
      } catch (e) {
        // Not JSON, continue with text
      }
      
      throw new Error(`Failed to update buildings: ${response.statusText}`);
    }
    
    const responseData = await response.json();
    console.log('API: Buildings updated successfully');
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('API: Error updating buildings:', error);
    return NextResponse.json(
      { 
        error: 'Server error',
        message: `Failed to update buildings: ${error instanceof Error ? error.message : 'Unknown error'}`
      },
      { status: 500 }
    );
  }
}

// Handler for OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
} 