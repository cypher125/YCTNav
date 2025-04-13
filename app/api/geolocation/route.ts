import { NextResponse } from 'next/server';
import { headers } from 'next/headers';

export async function GET() {
  try {
    // Get client IP address from headers
    const headersList = headers();
    const forwarded = await headersList.get('x-forwarded-for');
    const realIp = await headersList.get('x-real-ip');
    
    // Use either the forwarded IP or the real IP
    const ip = forwarded?.split(',')[0].trim() || realIp || '';
    console.log('IP address for geolocation:', ip);

    // Even without IP, we'll get a location based on the request origin
    // Try multiple free geolocation services
    try {
      // First try ipapi.co (no API key needed, 1000 requests/day limit)
      const response = await fetch(`https://ipapi.co/json/`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('IP geolocation data from ipapi.co:', data);
        
        return NextResponse.json({
          latitude: data.latitude || 6.5200,
          longitude: data.longitude || 3.3750,
          ip: data.ip || ip,
          city: data.city || 'Lagos',
          region: data.region || 'Lagos',
          country: data.country_name || 'Nigeria',
          message: 'Location found via ipapi.co'
        });
      }
    } catch (err) {
      console.error('Error with ipapi.co, trying alternative:', err);
    }
    
    try {
      // Second try ip-api.com (no API key needed, limited requests)
      const response = await fetch(`http://ip-api.com/json/${ip || ''}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('IP geolocation data from ip-api.com:', data);
        
        if (data.status === 'success') {
          return NextResponse.json({
            latitude: data.lat || 6.5200,
            longitude: data.lon || 3.3750,
            ip: ip,
            city: data.city || 'Lagos',
            region: data.regionName || 'Lagos',
            country: data.country || 'Nigeria',
            message: 'Location found via ip-api.com'
          });
        }
      }
    } catch (err) {
      console.error('Error with ip-api.com, using fallback:', err);
    }
    
    // If all services fail, fallback to Yaba Tech location
    return NextResponse.json({
      latitude: 6.5200, // Yaba Tech approximate latitude
      longitude: 3.3750, // Yaba Tech approximate longitude
      ip: ip || null,
      city: 'Lagos',
      region: 'Lagos',
      country: 'Nigeria',
      message: 'Using fallback location (Yaba Tech area)'
    });
    
  } catch (error) {
    console.error('Error in geolocation API:', error);
    
    // Return Yaba Tech fallback location
    return NextResponse.json({
      latitude: 6.5200,
      longitude: 3.3750,
      ip: null,
      city: 'Lagos',
      region: 'Lagos',
      country: 'Nigeria',
      message: 'Error in geolocation, using Yaba Tech fallback'
    });
  }
} 