import { NextRequest, NextResponse } from 'next/server';

// API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_NAVIGATION_API_URL 
  ? `${process.env.NEXT_PUBLIC_NAVIGATION_API_URL}/buildings/`
  : 'https://navigationbackend.onrender.com/buildings/';

/**
 * Helper function to format building name to slug
 * @param name Building name
 * @returns Formatted slug
 */
function formatSlug(name: string): string {
  return name.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Handler for POST requests to upload building images
 */
export async function POST(
  request: NextRequest,
  context: { params: { slug: string } }
) {
  try {
    // Get the slug from the URL
    const params = await Promise.resolve(context.params);
    const encodedSlug = params.slug;
    
    // Decode URL encoding
    const decodedSlug = decodeURIComponent(encodedSlug);
    const slug = formatSlug(decodedSlug);
    
    console.log(`Uploading image for building with slug: ${slug}`);
    
    // Get the form data (file)
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    // Create a new FormData object to send to the backend
    const backendFormData = new FormData();
    backendFormData.append('file', file);
    
    // Forward the request to the backend API
    const response = await fetch(`${API_URL}${slug}/upload-image`, {
      method: 'POST',
      body: backendFormData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Error uploading image: ${response.status} ${response.statusText}`);
      console.error('Error response:', errorText);
      
      return NextResponse.json(
        { error: `Failed to upload image: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('Image uploaded successfully:', data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in POST /api/buildings/[slug]/upload:', error);
    
    return NextResponse.json(
      { error: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
} 