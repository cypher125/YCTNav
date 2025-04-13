import L from 'leaflet';

export interface OSMRoad {
  id: number;
  type: string;
  name?: string;
  coordinates: [number, number][];
}

export const roadStyles = {
  motorway: { color: '#e74c3c', weight: 8, opacity: 0.8 },
  trunk: { color: '#e67e22', weight: 7, opacity: 0.8 },
  primary: { color: '#f1c40f', weight: 6, opacity: 0.8 },
  secondary: { color: '#2ecc71', weight: 5, opacity: 0.8 },
  tertiary: { color: '#3498db', weight: 4, opacity: 0.8 },
  residential: { color: '#95a5a6', weight: 3, opacity: 0.8 },
  service: { color: '#95a5a6', weight: 2, opacity: 0.7 },
  footway: { color: '#34495e', weight: 2, opacity: 0.6, dashArray: '5,5' },
  path: { color: '#34495e', weight: 2, opacity: 0.6, dashArray: '5,5' },
  track: { color: '#8e44ad', weight: 2, opacity: 0.6, dashArray: '10,5' },
  unclassified: { color: '#95a5a6', weight: 3, opacity: 0.7 }
};

export const fetchOSMRoads = async (bounds: L.LatLngBounds): Promise<OSMRoad[]> => {
  const bbox = `${bounds.getSouth()},${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()}`;
  const query = `
    [out:json][timeout:25];
    (
      way["highway"](${bbox});
      way["footway"](${bbox});
      way["path"](${bbox});
      way["service"](${bbox});
      way["track"](${bbox});
    );
    out body;
    >;
    out skel qt;
  `;

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: query
    });

    if (!response.ok) {
      throw new Error('Failed to fetch OSM data');
    }

    const data = await response.json();
    const nodes = new Map();
    const roads: OSMRoad[] = [];

    // First, collect all nodes
    data.elements.forEach((element: any) => {
      if (element.type === 'node') {
        // Ensure both lat and lon are defined
        if (typeof element.lat === 'number' && typeof element.lon === 'number') {
          nodes.set(element.id, [element.lat, element.lon]);
        }
      }
    });

    // Then process ways (roads)
    data.elements.forEach((element: any) => {
      if (element.type === 'way' && element.tags) {
        // Check for any type of path/road
        const roadType = element.tags.highway || element.tags.footway || element.tags.path || element.tags.service || element.tags.track;
        if (roadType) {
          const coordinates = element.nodes
            .map((nodeId: number) => nodes.get(nodeId))
            .filter((coord: [number, number] | undefined): coord is [number, number] => {
              return Array.isArray(coord) && coord.length === 2 && 
                     typeof coord[0] === 'number' && typeof coord[1] === 'number' &&
                     !isNaN(coord[0]) && !isNaN(coord[1]);
            });

          if (coordinates.length > 1) { // Ensure we have at least 2 points for a valid line
            roads.push({
              id: element.id,
              type: roadType,
              name: element.tags.name || element.tags.ref || '',
              coordinates
            });
          }
        }
      }
    });

    return roads;
  } catch (error) {
    console.error('Error fetching OSM data:', error);
    return [];
  }
};

export const getRoadStyle = (roadType: string) => {
  return roadStyles[roadType as keyof typeof roadStyles] || roadStyles.unclassified;
}; 