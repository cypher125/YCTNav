import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_NAVIGATION_API_URL || 'https://navigationbackend.onrender.com';
    const response = await fetch(`${API_URL}/buildings/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch buildings: ${response.statusText}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return NextResponse.json(
      { error: "Failed to fetch buildings from navigation backend" },
      { status: 500 }
    );
  }
} 