"use client"

import { useEffect, useState, useRef, useCallback } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Polygon, useMapEvents, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Building } from "@/lib/types"
import { useDispatch, useSelector } from "react-redux"
import { setUserLocation, setRouteDetails, setRouteCalculating } from "@/store/userLocationSlice"
import { toast } from "react-hot-toast"
import { RootState } from "@/store/store"
import { debounce } from 'lodash'
import polyUtil from 'polyline-encoded'

// Fix Leaflet marker icon issue in Next.js
if (typeof window !== "undefined" && typeof L !== "undefined") {
  // @ts-ignore
  delete L.Icon.Default.prototype._getIconUrl
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  })
}

// Create a user location icon with red color
const userLocationIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", // Using CDN URL
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png", // Using CDN URL
  shadowSize: [41, 41],
})

// Create a destination icon (blue)
const destinationIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", // Using CDN URL
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png", // Using CDN URL
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png", // Using CDN URL
  shadowSize: [41, 41],
})

// Create a default icon
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", // Using CDN URL
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png", // Using CDN URL
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png", // Using CDN URL
  shadowSize: [41, 41],
})

// Only modify prototype in browser environment
if (typeof window !== "undefined" && typeof L !== "undefined") {
L.Marker.prototype.options.icon = defaultIcon
}

const campusBoundaries: [number, number][] = [
  [6.523, 3.378], // Southwest corner
  [6.523, 3.381], // Southeast corner
  [6.526, 3.381], // Northeast corner
  [6.526, 3.378], // Northwest corner
]

const LocationMarker = ({ map }: { map: L.Map | null }) => {
  // Only proceed if map is available
  if (!map) return null;

  const [position, setPosition] = useState<L.LatLng | null>(null);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [locating, setLocating] = useState<boolean>(false);
  const [locationMethod, setLocationMethod] = useState<'ip' | 'browser'>('browser'); // Default to browser for better accuracy
  const [watchId, setWatchId] = useState<number | null>(null);
  const [circle, setCircle] = useState<L.Circle | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const [locationAttempts, setLocationAttempts] = useState<number>(0);
  const [locationEnabled, setLocationEnabled] = useState<boolean>(true);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const dispatch = useDispatch();
  
  // Update marker and circle on the map
  const updateMarkerAndCircle = (newPosition: L.LatLng, accuracy: number) => {
    // Update marker and circle if they exist
    if (markerRef.current) {
      markerRef.current.setLatLng(newPosition);
    } else {
      const newMarker = L.marker(newPosition, {
        icon: L.divIcon({
          className: 'current-location-marker',
          html: '<div class="current-location-icon"></div>',
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(map);
      
      setMarker(newMarker);
      markerRef.current = newMarker;
    }
    
    if (circleRef.current) {
      circleRef.current.setLatLng(newPosition);
      circleRef.current.setRadius(accuracy);
    } else {
      const newCircle = L.circle(newPosition, {
        radius: accuracy,
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(map);
      
      setCircle(newCircle);
      circleRef.current = newCircle;
    }
  };
  
  // Get IP-based location as a fallback
  const getLocationByIP = async () => {
    try {
      // Don't start another request if we're already locating
      if (locating) return false;
      
      setLocating(true);
      const toastId = toast.loading('Getting approximate location...', {
        id: 'ip-location-loading'
      });
      
      const response = await fetch('/api/geolocation');
      
      if (!response.ok) {
        throw new Error('Failed to get IP location');
      }
      
      const data = await response.json();
      
      toast.dismiss(toastId);
      
      if (data.latitude && data.longitude) {
        const newPosition = L.latLng(data.latitude, data.longitude);
        setPosition(newPosition);
        setAccuracy(500); // IP geolocation typically has lower accuracy (approx 500m)
        
        updateMarkerAndCircle(newPosition, 500);
        
        // Pan map to the new position
        map.flyTo(newPosition, 15);
        
        // Update the user's location in the Redux store
        dispatch(setUserLocation({
          lat: newPosition.lat,
          lng: newPosition.lng,
          accuracy: 500
        }));
        
        toast.success(`Location found (${data.city || 'unknown city'})`, { 
          duration: 3000,
          icon: '📍'
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error getting location by IP:', error);
      toast.error('Could not determine your location from IP', { duration: 3000 });
      return false;
    } finally {
      setLocating(false);
    }
  };
  
  // Get high-accuracy browser location (Google Maps style)
  const getBrowserLocation = () => {
    // If we've already tried too many times and failed, use IP location instead
    if (locationAttempts >= 3 && !position) {
      console.warn('Too many failed location attempts, switching to IP-based location');
      setLocationMethod('ip');
      getLocationByIP();
      return;
    }
    
    // Don't start another request if we're already locating
    if (locating) return;
    
    setLocating(true);
    
    // Clear any existing watch
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      setLocating(false);
      // Fall back to IP-based location
      getLocationByIP();
      return;
    }
    
    // Increment location attempts
    setLocationAttempts(prev => prev + 1);
    
    const toastId = toast.loading('Getting your precise location...', {
      id: 'browser-location-loading'
    });
    
    try {
      // First, try to get a single high-accuracy position with a shorter timeout
      navigator.geolocation.getCurrentPosition(
        (location) => {
          const newPosition = L.latLng(location.coords.latitude, location.coords.longitude);
          setPosition(newPosition);
          setAccuracy(location.coords.accuracy);
          
          updateMarkerAndCircle(newPosition, location.coords.accuracy);
          
          // Pan map to the new position and zoom based on accuracy
          const zoomLevel = location.coords.accuracy < 100 ? 18 : 
                          location.coords.accuracy < 500 ? 16 : 15;
          map.flyTo(newPosition, zoomLevel);
          
          // Update the user's location in the Redux store
          dispatch(setUserLocation({
            lat: newPosition.lat,
            lng: newPosition.lng,
            accuracy: location.coords.accuracy
          }));
          
          setLocating(false);
          // Successful location - reset attempts counter
          setLocationAttempts(0);
          
          toast.dismiss(toastId);
          toast.success(`Location found (accuracy: ${Math.round(location.coords.accuracy)}m)`, { 
            duration: 3000,
            icon: '📍'
          });
        },
        (error) => {
          console.error('Error getting browser location:', error);
          
          const errorMessage = error.code === 1 
            ? 'Location permission denied'
            : error.code === 2 
              ? 'Location unavailable'
              : error.code === 3 
                ? 'Location request timed out'
                : 'Unknown location error';
          
          toast.error(`Couldn't get your location: ${errorMessage}`, {
            duration: 3000
          });
          
          setLocating(false);
          toast.dismiss(toastId);
          
          // If permission denied, switch to IP location permanently
          if (error.code === 1) {
            setLocationEnabled(false);
            setLocationMethod('ip');
            toast('Using IP-based location instead', {
              icon: '🌐',
              duration: 3000
            });
            getLocationByIP();
          } else if (locationAttempts < 3) {
            // For other errors, try IP location after multiple failures
            toast('Falling back to approximate location...', {
              icon: '🌐',
              duration: 3000
            });
            getLocationByIP();
          }
        },
        {
          enableHighAccuracy: true, // Request maximum precision (like Google Maps)
          timeout: 5000,            // Shorter timeout to fail faster
          maximumAge: 30000         // Allow cached positions up to 30 seconds old
        }
      );
    } catch (unexpectedError) {
      console.error('Unexpected error while getting location:', unexpectedError);
      toast.error('Location detection failed');
      setLocating(false);
      toast.dismiss(toastId);
      
      // Fall back to IP location
      getLocationByIP();
    }
  };
  
  const getCurrentLocation = async () => {
    // If location has been disabled (e.g., permission denied), use IP method
    if (!locationEnabled) {
      setLocationMethod('ip');
      await getLocationByIP();
      return;
    }
    
    // Use the current selected method
    if (locationMethod === 'ip') {
      const success = await getLocationByIP();
      if (!success && locationEnabled) {
        // If IP geolocation fails, try browser geolocation
        setLocationMethod('browser');
        getBrowserLocation();
      }
    } else {
      getBrowserLocation();
    }
  };
  
  const toggleLocationMethod = () => {
    // If location isn't enabled, don't allow switching to browser method
    if (!locationEnabled && locationMethod === 'ip') {
      toast.error('Location permission denied - cannot use browser location', {
        duration: 3000
      });
      return;
    }
    
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    
    setLocationMethod(prev => prev === 'ip' ? 'browser' : 'ip');
    
    // Clear existing position data when switching methods
    if (marker) {
      map.removeLayer(marker);
      markerRef.current = null;
      setMarker(null);
    }
    
    if (circle) {
      map.removeLayer(circle);
      circleRef.current = null;
      setCircle(null);
    }
    
    // Reset position data
    setPosition(null);
    setAccuracy(0);
  };
  
  // Get location on component mount
  useEffect(() => {
    // Inform user about Google-style location
    toast('To use your current location:\n1. Allow location permission when prompted\n2. Click 📍 to refresh your location', {
      duration: 6000,
      icon: '🌍'
    });
    
    // Short delay before attempting to get location
    setTimeout(() => {
      getCurrentLocation();
    }, 1000);
    
    // Cleanup on unmount
    return () => {
      if (marker) map.removeLayer(marker);
      if (circle) map.removeLayer(circle);
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);
  
  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button
          className="location-control"
          onClick={getCurrentLocation}
          disabled={locating}
          title="Find my precise location (like Google Maps)"
        >
          {locating ? (
            <span className="location-spinner">⟳</span>
          ) : (
            <span>📍</span>
          )}
        </button>
        <button
          className="location-method-control"
          onClick={toggleLocationMethod}
          title={`Using ${locationMethod === 'ip' ? 'IP-based' : 'GPS/Browser'} location (click to switch)`}
        >
          {locationMethod === 'ip' ? '🌐' : '📱'}
        </button>
      </div>
    </div>
  );
};

// Component to handle map bounds and fetch route
function MapController({ 
  startPoint, 
  endPoint, 
  waypoints,
  transportMode,
  setTransportMode 
}: {
  startPoint: [number, number] | null;
  endPoint: [number, number] | null;
  waypoints?: [number, number][];
  transportMode: 'walking' | 'driving';
  setTransportMode: (mode: 'walking' | 'driving') => void;
}) {
  const map = useMap();
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasCalculatedRoute, setHasCalculatedRoute] = useState<boolean>(false);
  const [lastStartPoint, setLastStartPoint] = useState<[number, number] | null>(null);
  const [lastEndPoint, setLastEndPoint] = useState<[number, number] | null>(null);
  const [lastTransportMode, setLastTransportMode] = useState<'walking' | 'driving'>(transportMode);
  const dispatch = useDispatch();
  const routeState = useSelector((state: RootState) => state.userLocation.route);
  const [isThrottled, setIsThrottled] = useState(false);
  const [routeToastShown, setRouteToastShown] = useState(false);

  // Debug logging
  console.log('MapController rendering with:', { startPoint, endPoint, waypoints });

  // Sync route data from Redux to local state
  useEffect(() => {
    if (routeState.coordinates && routeState.coordinates.length > 0) {
      console.log('Updating route from Redux store:', routeState.coordinates);
      setRoute(routeState.coordinates);
      setDistance(routeState.distance ? parseFloat(routeState.distance) : null);
      setDuration(routeState.duration ? routeState.duration : null);
      setHasCalculatedRoute(true);
    }
  }, [routeState]);

  // Add a function to clear all footer notifications
  const clearFooterNotifications = () => {
    if (typeof window !== 'undefined') {
      // Remove any messages with the notification class
      const notifications = document.querySelectorAll('.found-shortest-route, .calculating-shortest-route');
      notifications.forEach(n => n.remove());
    }
  };

  // Use this in the useEffect hook that triggers route calculation
  useEffect(() => {
    console.log('Points or transport mode changed, re-fetching directions');
    
    // Clear existing toasts if they exist
    toast.dismiss();
    
    // Clear any footer notifications
    clearFooterNotifications();
    
    // Check if we already calculated a route for these points
    const shouldRecalculate = () => {
      // If a calculation is already in progress, don't start another
      if (routeState.calculating) return false;
      
      // Always recalculate if transport mode changed
      if (transportMode !== lastTransportMode) return true;
      
      // If no route calculated yet, calculate it
      if (!hasCalculatedRoute || !lastStartPoint || !lastEndPoint) return true;
      
      // If startPoint or endPoint is null, don't calculate
      if (!startPoint || !endPoint) return false;
      
      // Check if points changed significantly (more than 1 meter)
      const hasMoved = (p1: [number, number], p2: [number, number]) => {
        // Convert lat/lng differences to approximate meters (very rough calculation)
        const latDiff = Math.abs(p1[0] - p2[0]) * 111000; // 1 degree lat = ~111km
        const lngDiff = Math.abs(p1[1] - p2[1]) * 111000 * Math.cos(p1[0] * Math.PI/180);
        const distanceDiff = Math.sqrt(latDiff*latDiff + lngDiff*lngDiff);
        return distanceDiff > 1; // Only recalculate if moved more than 1 meter
      };
      
      return hasMoved(startPoint, lastStartPoint) || hasMoved(endPoint, lastEndPoint);
    };
    
    const timer = setTimeout(() => {
      // Validate coordinates before fetching
      if (startPoint && endPoint && 
          startPoint[0] && startPoint[1] && 
          endPoint[0] && endPoint[1] &&
          !isNaN(startPoint[0]) && !isNaN(startPoint[1]) &&
          !isNaN(endPoint[0]) && !isNaN(endPoint[1]) &&
          shouldRecalculate()) {
        
        fetchDirections(startPoint, endPoint, { waypoints });
        // Save the current points we calculated for
        setLastStartPoint(startPoint);
        setLastEndPoint(endPoint);
        setLastTransportMode(transportMode);
      } else {
        console.warn('Skipping route calculation - invalid coordinates or no significant change');
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [startPoint, endPoint, waypoints, routeState.calculating, transportMode]);

  // Generate human-readable directions based on route data
  const generateTextDirections = (
    startPoint: [number, number], 
    endPoint: [number, number], 
    routeCoordinates: [number, number][], 
    distance: number, 
    duration: number,
    steps: any[] = []
  ) => {
    try {
      // Get bearing to determine initial direction
      const getHeading = (start: [number, number], end: [number, number]) => {
        if (!start || !end || start.length < 2 || end.length < 2) return 0;
        
        const startLat = start[0] * Math.PI / 180;
        const startLng = start[1] * Math.PI / 180;
        const endLat = end[0] * Math.PI / 180;
        const endLng = end[1] * Math.PI / 180;
        
        const dLng = endLng - startLng;
        const y = Math.sin(dLng) * Math.cos(endLat);
        const x = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(dLng);
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        bearing = (bearing + 360) % 360;
        return bearing;
      };

      const getCardinalDirection = (bearing: number) => {
        const directions = ['North', 'Northeast', 'East', 'Southeast', 'South', 'Southwest', 'West', 'Northwest', 'North'];
        return directions[Math.round(bearing / 45) % 8];
      };

      // Create text directions
      const directions: string[] = [];
      
      // Starting direction
      if (routeCoordinates && routeCoordinates.length > 1) {
        const initialBearing = getHeading(routeCoordinates[0], routeCoordinates[1]);
        const initialDirection = getCardinalDirection(initialBearing);
        directions.push(`Start by heading ${initialDirection} toward your destination.`);
      } else {
        directions.push("Start heading toward your destination.");
      }

      // If we have steps from the API, use them for more detailed instructions
      if (steps && steps.length > 0) {
        steps.forEach((step, index) => {
          if (step.maneuver && step.maneuver.type) {
            let instruction = '';
            
            switch(step.maneuver.type) {
              case 'turn':
                instruction = `Turn ${step.maneuver.modifier || ''} ${step.name ? 'onto ' + step.name : ''}`;
                break;
              case 'new name':
                instruction = `Continue onto ${step.name || 'the path'}`;
                break;
              case 'depart':
                instruction = `Depart from the starting point`;
                break;
              case 'arrive':
                instruction = `Arrive at your destination`;
                break;
              default:
                instruction = step.instruction || `Continue on your path`;
            }
            
            if (step.distance) {
              const stepDistance = step.distance < 1000 
                ? `${Math.round(step.distance)} meters` 
                : `${(step.distance/1000).toFixed(1)} km`;
              instruction += ` for ${stepDistance}`;
            }
            
            directions.push(instruction);
          }
        });
      }

      // Add distance and duration info
      const distanceKm = (distance / 1000).toFixed(1);
      const durationMin = Math.round(duration / 60);
      
      directions.push(`Total distance: ${distanceKm} km.`);
      directions.push(`Estimated walking time: ${durationMin} minutes.`);
      
      // Final instructions
      directions.push(`Follow the blue route line on the map to reach your destination.`);
      
      return directions;
    } catch (error) {
      console.error("Error generating directions:", error);
      // Return fallback directions
      return [
        "Head toward your destination.",
        `Total distance: ${(distance / 1000).toFixed(1)} km.`,
        `Estimated walking time: ${Math.round(duration / 60)} minutes.`,
        "Follow the blue route line on the map."
      ];
    }
  };

  const fetchDirections = async () => {
    try {
      setLoading(true);
      
      // Debug logging
      console.log('fetchDirections called with:', {
        startPoint,
        endPoint,
        waypoints,
        hasCalculatedRoute,
        lastStartPoint,
        lastEndPoint
      });
      
      if (!startPoint || !endPoint) {
        toast.error('Please select both starting and destination points');
        setLoading(false);
        return;
      }

      // Don't recalculate the same route
      const isSameStart = lastStartPoint && 
        startPoint[0] === lastStartPoint[0] && 
        startPoint[1] === lastStartPoint[1];
      
      const isSameEnd = lastEndPoint && 
        endPoint[0] === lastEndPoint[0] && 
        endPoint[1] === lastEndPoint[1];
      
      // If we've already calculated this exact route, don't do it again
      if (hasCalculatedRoute && isSameStart && isSameEnd) {
        console.log('Route already calculated - using cached route');
        setLoading(false);
        return;
      }

      // Format coordinates for OSRM API (lng,lat format)
      const startCoord = `${startPoint[1]},${startPoint[0]}`;
      const endCoord = `${endPoint[1]},${endPoint[0]}`;
      
      // Store current points as last points to avoid recalculation
      setLastStartPoint(startPoint);
      setLastEndPoint(endPoint);

      // Try primary API first (OSRM)
      try {
        // Build OSRM API URL using selected transport mode
        // Add more specific parameters for each mode
        let osrmUrl;
        if (transportMode === 'walking') {
          // Walking profile with pedestrian-friendly options
          osrmUrl = `https://router.project-osrm.org/route/v1/foot/${startCoord};${endCoord}?overview=full&alternatives=true&steps=true&geometries=geojson`;
          // Note: using 'foot' profile instead of 'walking' for better pedestrian routing
        } else {
          // Driving profile with road-specific options
          osrmUrl = `https://router.project-osrm.org/route/v1/driving/${startCoord};${endCoord}?overview=full&alternatives=true&steps=true&geometries=geojson`;
        }
        
        console.log(`Fetching ${transportMode} route from OSRM API:`, osrmUrl);
        
        const response = await fetch(osrmUrl);
        
        if (!response.ok) {
          throw new Error(`OSRM API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
          throw new Error(data.message || 'No route found');
        }

        // Sort routes by distance to ensure we get the shortest
        const sortedRoutes = [...data.routes].sort((a, b) => a.distance - b.distance);
        const route = sortedRoutes[0]; // Get the shortest route
        
        // Extract route geometry (now in GeoJSON format)
        let routeCoordinates;
        if (route.geometry.coordinates) {
          // If we have GeoJSON coordinates
          routeCoordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        } else if (route.geometry) {
          // Fallback to polyline if we didn't get GeoJSON
          routeCoordinates = polyUtil.decode(route.geometry).map(point => [point[0], point[1]]);
        } else {
          throw new Error('No valid route geometry found');
        }
        
        // Calculate distance
        const distanceInKm = (route.distance / 1000).toFixed(2);
        
        // Calculate duration
        const durationInMinutes = Math.ceil(route.duration / 60);
        
        // Extract step-by-step directions
        const legs = route.legs || [];
        const directions = [];
        
        if (legs.length > 0 && legs[0].steps) {
          for (const step of legs[0].steps) {
            if (step.maneuver && step.maneuver.instruction) {
              directions.push(step.maneuver.instruction);
            }
          }
        }
        
        // Dispatch route to Redux store
        dispatch(setRouteDetails({
          route: routeCoordinates,
          distance: distanceInKm,
          duration: durationInMinutes,
          textDirections: directions
        }));
        
        // Also update local state directly to ensure rendering
        setRoute(routeCoordinates);
        setDistance(parseFloat(distanceInKm));
        setDuration(durationInMinutes);
        
        // Show appropriate toast based on whether we've calculated before
        if (!hasCalculatedRoute) {
          toast.success(`Route found! Distance: ${distanceInKm}km (${durationInMinutes} min)`, {
            duration: 3000
          });
        } else {
          toast.success(`Updated route: ${distanceInKm}km (${durationInMinutes} min)`, {
            duration: 3000
          });
        }
        
        // Update flag to show we've calculated at least one route
        setHasCalculatedRoute(true);
        setLoading(false);
        return;
      } catch (osrmError) {
        console.error('OSRM API error:', osrmError);
        // Continue to fallback method
      }
      
      // Fallback: Calculate a straight line route if API fails
      console.log('Using fallback route calculation');
      
      // Create a simple straight line between the points
      const routeCoordinates = [
        [startPoint[0], startPoint[1]],
        [endPoint[0], endPoint[1]]
      ];
      
      // Calculate approximate distance (haversine formula)
      const R = 6371; // Earth radius in km
      const lat1 = startPoint[0] * Math.PI/180;
      const lat2 = endPoint[0] * Math.PI/180;
      const dLat = (endPoint[0] - startPoint[0]) * Math.PI/180;
      const dLon = (endPoint[1] - startPoint[1]) * Math.PI/180;
      
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
                
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Mode-specific duration estimation
      let durationInMinutes;
      if (transportMode === 'walking') {
        // Estimate walking duration (average 5 km/h or 12 minutes per km)
        durationInMinutes = Math.ceil(distance * 12);
      } else {
        // Estimate driving duration (average 30 km/h in campus/city areas - or 2 minutes per km)
        durationInMinutes = Math.ceil(distance * 2);
      }
      
      // Generate simple directions
      const directions = generateTextDirections(
        [startPoint[0], startPoint[1]], 
        [endPoint[0], endPoint[1]], 
        routeCoordinates, 
        distance * 1000, 
        durationInMinutes * 60
      );
      
      // Dispatch route to Redux store
      dispatch(setRouteDetails({
        route: routeCoordinates,
        distance: distance.toFixed(2),
        duration: durationInMinutes,
        textDirections: directions
      }));
      
      // Also update local state directly to ensure rendering
      setRoute(routeCoordinates);
      setDistance(parseFloat(distance.toFixed(2)));
      setDuration(durationInMinutes);
      
      toast.success(`Route found! Distance: ${distance.toFixed(2)}km (${durationInMinutes} min)`, {
        duration: 3000
      });
      
      // Update flag to show we've calculated at least one route
      setHasCalculatedRoute(true);
      
    } catch (error) {
      console.error('Error fetching directions:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch directions');
    } finally {
      setLoading(false);
    }
  };

  // Reset the toast tracking when route points change
  useEffect(() => {
    setRouteToastShown(false);
  }, [startPoint, endPoint]);

  // Render the route
  return (
    <>
      {route && route.length > 0 ? (
        <Polyline
          positions={route}
          pathOptions={{
            color: transportMode === 'walking' ? '#3388ff' : '#ff5722', // Blue for walking, orange for driving
            weight: transportMode === 'walking' ? 5 : 6,
            opacity: 0.8,
            lineJoin: 'round',
            lineCap: 'round',
            dashArray: transportMode === 'walking' ? null : '10, 10' // Dashed line for driving routes
          }}
        />
      ) : (
        console.log('No route data available to render Polyline')
      )}
      
      {loading && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-md shadow-md z-[1000] text-sm">
          Calculating route...
        </div>
      )}
      
      {error && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-red-50 p-2 rounded-md shadow-md z-[1000] text-sm text-red-700">
          {error}
        </div>
      )}
      
      {distance !== null && duration !== null && !loading && !error && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white p-2 rounded-md shadow-md z-[1000] text-sm">
          <p className="font-medium">Distance: {typeof distance === 'number' ? distance.toFixed(1) : distance} km</p>
          <p>{transportMode === 'walking' ? 'Walking' : 'Driving'} time: ~{Math.round(duration)} minutes</p>
        </div>
      )}

      <TransportModeSelector
        currentMode={transportMode}
        onChange={(mode) => {
          setTransportMode(mode);
          setLastTransportMode(mode);
          // Force recalculation immediately when transport mode changes
          if (startPoint && endPoint) {
            fetchDirections(startPoint, endPoint, { waypoints });
          }
        }}
      />
    </>
  );
}

interface DirectionsMapProps {
  fromBuilding: Building
  toBuilding: Building
  onDirectionsUpdate?: (points: [number, number][], directions: string[]) => void
}

export default function DirectionsMap({ fromBuilding, toBuilding }: DirectionsMapProps) {
  const [mapRef, setMapRef] = useState<L.Map | null>(null);
  const [transportMode, setTransportMode] = useState<'walking' | 'driving'>('walking'); // Add transportMode state
  
  // Debug logs
  console.log('DirectionsMap rendering with:', {
    from: fromBuilding,
    to: toBuilding
  });
  
  // Extract coordinates
  const startLat = fromBuilding.lat || (fromBuilding.coordinates?.lat);
  const startLng = fromBuilding.lng || (fromBuilding.coordinates?.lng);
  const endLat = toBuilding.lat || (toBuilding.coordinates?.lat);
  const endLng = toBuilding.lng || (toBuilding.coordinates?.lng);

  // Add this CSS class for error logs
  useEffect(() => {
    // Safe initialization of Leaflet icons in browser
    if (typeof window !== 'undefined' && typeof L !== 'undefined') {
      // Initialize styles and icons for Leaflet
      const styles = `
        .current-location-icon {
          background-color: #f03;
          border-radius: 50%;
          width: 12px;
          height: 12px;
          border: 2px solid white;
          box-shadow: 0 0 0 2px rgba(255, 0, 50, 0.4), 0 0 8px rgba(0, 0, 0, 0.3);
        }
        
        .current-location-marker {
          background: transparent;
          border: none;
        }
        
        .location-control {
          padding: 5px 10px;
          font-size: 18px;
          cursor: pointer;
        }
        
        .location-method-control {
          padding: 5px 10px;
          font-size: 16px;
          cursor: pointer;
        }
        
        .location-spinner {
          animation: spin 1s linear infinite;
          display: inline-block;
        }
        
        /* Transport mode selector styles */
        .transport-mode-selector {
          display: flex;
          background: white;
          border-radius: 4px;
          box-shadow: 0 1px 5px rgba(0,0,0,0.2);
          overflow: hidden;
        }
        
        .transport-mode-btn {
          padding: 8px 12px;
          font-size: 16px;
          border: none;
          background: white;
          cursor: pointer;
          border-right: 1px solid #eee;
        }
        
        .transport-mode-btn:last-child {
          border-right: none;
        }
        
        .transport-mode-btn.active {
          background: var(--yabatech-green, #00703c);
          color: white;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Log container for error messages */
        .log-container {
          position: fixed;
          bottom: 10px;
          right: 10px;
          max-width: 300px;
          max-height: 150px;
          overflow-y: auto;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          border-radius: 4px;
          padding: 8px;
          font-size: 11px;
          z-index: 1000;
          display: none;
        }

        .log-entry {
          margin-bottom: 4px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
          padding-bottom: 4px;
        }

        /* Show log container when it has the visible class */
        .log-container.visible {
          display: block;
        }
      `;
      
      // Add styles to head
      const styleElement = document.createElement('style');
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);

      // Create log container element for errors
      const logContainer = document.createElement('div');
      logContainer.className = 'log-container';
      logContainer.innerHTML = '<div class="log-header">Location Logs</div><div class="log-body"></div>';
      document.body.appendChild(logContainer);
      
      // Create toggle button
      const toggleButton = document.createElement('button');
      toggleButton.textContent = 'Toggle Logs';
      toggleButton.style.position = 'fixed';
      toggleButton.style.bottom = '10px';
      toggleButton.style.right = '320px';
      toggleButton.style.padding = '5px 10px';
      toggleButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
      toggleButton.style.color = 'white';
      toggleButton.style.border = 'none';
      toggleButton.style.borderRadius = '4px';
      toggleButton.style.cursor = 'pointer';
      toggleButton.style.fontSize = '12px';
      toggleButton.style.zIndex = '1000';
      toggleButton.style.display = 'none'; // Hide by default
      toggleButton.onclick = () => {
        logContainer.classList.toggle('visible');
      };
      document.body.appendChild(toggleButton);

      // Override console error/warn to add to log container
      const originalConsoleError = console.error;
      const originalConsoleWarn = console.warn;
      
      console.error = function() {
        // Add to log container
        const logBody = document.querySelector('.log-body');
        if (logBody) {
          const logEntry = document.createElement('div');
          logEntry.className = 'log-entry';
          logEntry.textContent = Array.from(arguments).join(' ');
          logBody.appendChild(logEntry);
          
          // Show toggle button when we have logs
          toggleButton.style.display = 'block';
          
          // Limit entries
          if (logBody.children.length > 20) {
            logBody.removeChild(logBody.firstChild);
          }
        }
        
        // Call original console error
        originalConsoleError.apply(console, arguments);
      };
      
      console.warn = function() {
        // Add to log container
        const logBody = document.querySelector('.log-body');
        if (logBody) {
          const logEntry = document.createElement('div');
          logEntry.className = 'log-entry';
          logEntry.textContent = Array.from(arguments).join(' ');
          logBody.appendChild(logEntry);
          
          // Show toggle button when we have logs
          toggleButton.style.display = 'block';
          
          // Limit entries
          if (logBody.children.length > 20) {
            logBody.removeChild(logBody.firstChild);
          }
        }
        
        // Call original console warn
        originalConsoleWarn.apply(console, arguments);
      };
      
      // Clean up function to remove styles on unmount
      return () => {
        // Restore original console methods
        console.error = originalConsoleError;
        console.warn = originalConsoleWarn;
        
        if (styleElement && document.head.contains(styleElement)) {
          document.head.removeChild(styleElement);
        }
        
        if (logContainer && document.body.contains(logContainer)) {
          document.body.removeChild(logContainer);
        }
        
        if (toggleButton && document.body.contains(toggleButton)) {
          document.body.removeChild(toggleButton);
        }
      };
    }
  }, []); // Empty dependency array means this runs once on mount

  // Add this to the DirectionsMap component
  useEffect(() => {
    // Clear up any toast containers when component unmounts
    return () => {
      // Clear toasts
      toast.dismiss();
      
      // Remove notification elements from the DOM
      if (typeof window !== 'undefined') {
        document.querySelectorAll('.Toaster, [id^="react-hot-toast"]').forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
        
        // Also remove any footer messages
        document.querySelectorAll('.found-shortest-route, .calculating-shortest-route').forEach(el => {
          if (el.parentNode) {
            el.parentNode.removeChild(el);
          }
        });
      }
    };
  }, []);

  return (
    <MapContainer
      center={[
        endLat || 6.518,
        endLng || 3.373,
      ]}
      zoom={16}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
      whenCreated={(map) => {
        setMapRef(map);
        return map;
      }}
    >
      <TileLayer
        attribution='&copy; Google Maps'
        url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
        maxZoom={22}
        tileSize={256}
        className="google-map-tiles"
      />

      {/* Hybrid Layer for Labels */}
      <TileLayer
        attribution='&copy; Google Maps'
        url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
        maxZoom={22}
        tileSize={256}
        className="reference-layer"
      />

      <ZoomControl position="bottomleft" />

      {/* Markers for from and to buildings */}
      {startLat && startLng && (
      <Marker
          position={[startLat, startLng]}
          icon={destinationIcon}
      >
        <Popup>
            <div className="font-medium">Start: {fromBuilding.name}</div>
            <div className="text-sm text-gray-500">{fromBuilding.department}</div>
        </Popup>
      </Marker>
      )}

      {endLat && endLng && (
      <Marker
          position={[endLat, endLng]}
          icon={destinationIcon}
      >
        <Popup>
            <div className="font-medium">Destination: {toBuilding.name}</div>
            <div className="text-sm text-gray-500">{toBuilding.department}</div>
        </Popup>
      </Marker>
      )}

      {/* Controller for setting map bounds and fetching route */}
      <MapController 
        startPoint={fromBuilding && (fromBuilding.lat || fromBuilding.coordinates?.lat) ? 
          [
            fromBuilding.lat || fromBuilding.coordinates?.lat || 0, 
            fromBuilding.lng || fromBuilding.coordinates?.lng || 0
          ] as [number, number] : 
          null
        } 
        endPoint={toBuilding && (toBuilding.lat || toBuilding.coordinates?.lat) ? 
          [
            toBuilding.lat || toBuilding.coordinates?.lat || 0, 
            toBuilding.lng || toBuilding.coordinates?.lng || 0
          ] as [number, number] : 
          null
        } 
        waypoints={[]} 
        transportMode={transportMode}
        setTransportMode={setTransportMode}
      />

      {/* Only show LocationMarker when using current location */}
      {fromBuilding && fromBuilding.id === 'my-location' && <LocationControl />}
    </MapContainer>
  )
}

// Create a wrapper component to safely pass the map to LocationMarker
const LocationControl = () => {
  const map = useMap();
  return <LocationMarker map={map} />;
}

// Add transport mode selector
const TransportModeSelector = ({ 
  currentMode, 
  onChange 
}: { 
  currentMode: 'walking' | 'driving', 
  onChange: (mode: 'walking' | 'driving') => void 
}) => {
  return (
    <div className="leaflet-bottom leaflet-left" style={{ marginBottom: '40px' }}>
      <div className="leaflet-control leaflet-bar transport-mode-selector">
        <button
          className={`transport-mode-btn ${currentMode === 'walking' ? 'active' : ''}`}
          onClick={() => onChange('walking')}
          title="Walking mode"
        >
          🚶‍♂️
        </button>
        <button
          className={`transport-mode-btn ${currentMode === 'driving' ? 'active' : ''}`}
          onClick={() => onChange('driving')}
          title="Driving mode"
        >
          🚗
        </button>
      </div>
    </div>
  );
};

