import { useState, useEffect } from 'react';
import { loadBuildings, loadBuildingBySlug } from '@/lib/api';
import type { Building } from '@/lib/types';

// Helper function to generate slug from building name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .trim();
}

// Timestamp for this session to ensure unique IDs across page refreshes
const sessionTimestamp = Date.now();

// Helper to ensure building has slug
function normalizeBuilding(building: any, index: number): Building {
  return {
    ...building,
    // Always generate a new ID that is guaranteed to be unique
    id: `bld-${sessionTimestamp}-${index}`,
    // Generate slug if it doesn't exist
    slug: building.slug || generateSlug(building.name)
  };
}

export function useBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBuildings() {
      try {
        setLoading(true);
        const data = await loadBuildings();
        
        if (data) {
          // Handle different API response structures
          const buildingsArray = Array.isArray(data) ? data : 
                                data.buildings ? data.buildings : 
                                data.items ? data.items : [];
          
          // Normalize buildings to ensure they have id and slug
          const normalizedBuildings = buildingsArray.map((building, index) => 
            normalizeBuilding(building, index)
          );
          
          console.log('Processed buildings data:', normalizedBuildings);
          setBuildings(normalizedBuildings);
          setError(null);
        } else {
          setError('Failed to load buildings data');
        }
      } catch (err) {
        setError('An error occurred while fetching buildings');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBuildings();
  }, []);

  return { buildings, loading, error };
}

export function useBuildingBySlug(slug: string) {
  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBuilding() {
      try {
        setLoading(true);
        if (!slug) {
          setError('Building slug is required');
          return;
        }
        
        const data = await loadBuildingBySlug(slug);
        if (data) {
          // Check if we have a direct building object or need to extract it
          const buildingData = data.building ? data.building : data;
          
          // Normalize building to ensure it has id and slug
          // For single buildings, use a random index
          const normalizedBuilding = normalizeBuilding(buildingData, Math.floor(Math.random() * 10000));
          
          console.log('Processed building data:', normalizedBuilding);
          setBuilding(normalizedBuilding);
          setError(null);
        } else {
          setError('Failed to load building data');
        }
      } catch (err) {
        setError('An error occurred while fetching building');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBuilding();
  }, [slug]);

  return { building, loading, error };
} 