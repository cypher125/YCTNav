import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Define paths for boundary data storage
const primaryBoundariesFilePath = path.join(process.cwd(), 'boundaries.json');
const fallbackBoundariesFilePath = path.join(process.cwd(), 'public', 'boundaries.json');
const tmpBoundariesFilePath = path.join(process.cwd(), 'public', 'data', 'boundaries.json'); 

// Debug info to help troubleshoot
console.log('API: Current working directory:', process.cwd());
console.log('API: Boundaries primary path:', primaryBoundariesFilePath);
console.log('API: Boundaries fallback path:', fallbackBoundariesFilePath);
console.log('API: Boundaries tmp path:', tmpBoundariesFilePath);

// Default boundaries (coordinates for Yaba College of Technology)
const defaultBoundaries: [number, number][] = [
  [6.5185, 3.3768],
  [6.5216, 3.3758],
  [6.5210, 3.3796],
  [6.5180, 3.3785]
];

const BOUNDARIES_FILE = path.join(process.cwd(), 'data', 'boundaries.json');

// Ensure the data directory exists
const ensureDirectoryExists = () => {
  const dir = path.dirname(BOUNDARIES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

/**
 * Determine the best place to store the boundaries file
 * @returns The path to use for the boundaries file
 */
function getBoundariesFilePath(): string {
  // Try each path in order until we find one we can write to
  const potentialPaths = [
    primaryBoundariesFilePath,
    fallbackBoundariesFilePath,
    tmpBoundariesFilePath
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
  return tmpBoundariesFilePath;
}

/**
 * Check if the boundaries file exists, create it with default data if not
 * @param filePath The path to the boundaries file
 */
function ensureFileExists(filePath: string): void {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`API: Creating boundaries file at ${filePath}`);
      const dirPath = path.dirname(filePath);
      
      // Ensure directory exists
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`API: Created directory: ${dirPath}`);
      }
      
      fs.writeFileSync(
        filePath,
        JSON.stringify(defaultBoundaries, null, 2),
        'utf8'
      );
      console.log(`API: Created default boundaries file at ${filePath}`);
    } else {
      console.log(`API: Boundaries file already exists at ${filePath}`);
    }
  } catch (error) {
    console.error(`API: Error ensuring file exists at ${filePath}:`, error);
    // Let the caller handle this error
    throw error;
  }
}

// GET /api/boundaries - Load boundaries from file
export async function GET() {
  try {
    ensureDirectoryExists();
    
    if (!fs.existsSync(BOUNDARIES_FILE)) {
      // Return default boundaries if file doesn't exist yet
      return NextResponse.json({ 
        boundaries: [
          [6.5244, 3.3752],
          [6.5244, 3.3792],
          [6.5215, 3.3792],
          [6.5215, 3.3752]
        ] 
      });
    }
    
    const fileContent = fs.readFileSync(BOUNDARIES_FILE, 'utf-8');
    const data = JSON.parse(fileContent);
    
    return NextResponse.json({ boundaries: data.boundaries });
  } catch (error) {
    console.error('Error loading boundaries:', error);
    return NextResponse.json(
      { error: 'Failed to load boundaries' },
      { status: 500 }
    );
  }
}

// POST /api/boundaries - Save boundaries to file
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.boundaries || !Array.isArray(data.boundaries) || data.boundaries.length < 3) {
      return NextResponse.json(
        { error: 'Invalid boundary data' },
        { status: 400 }
      );
    }
    
    ensureDirectoryExists();
    
    fs.writeFileSync(
      BOUNDARIES_FILE,
      JSON.stringify({ boundaries: data.boundaries }, null, 2),
      'utf-8'
    );
    
    return NextResponse.json({ message: 'Boundaries saved successfully' });
  } catch (error) {
    console.error('Error saving boundaries:', error);
    return NextResponse.json(
      { error: 'Failed to save boundaries' },
      { status: 500 }
    );
  }
}

// Handler for OPTIONS requests (CORS preflight)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
    },
  });
} 