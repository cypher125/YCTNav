import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserLocationState {
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  lastUpdated: number | null;
  route: {
    coordinates: [number, number][] | null;
    distance: number | null;
    duration: number | null;
    textDirections: string[] | null;
    calculating: boolean;
  };
}

const initialState: UserLocationState = {
  lat: null,
  lng: null,
  accuracy: null,
  lastUpdated: null,
  route: {
    coordinates: null,
    distance: null,
    duration: null,
    textDirections: null,
    calculating: false
  }
};

export const userLocationSlice = createSlice({
  name: 'userLocation',
  initialState,
  reducers: {
    setUserLocation: (state, action: PayloadAction<{
      lat: number;
      lng: number;
      accuracy: number;
    }>) => {
      state.lat = action.payload.lat;
      state.lng = action.payload.lng;
      state.accuracy = action.payload.accuracy;
      state.lastUpdated = Date.now();
    },
    clearUserLocation: (state) => {
      state.lat = null;
      state.lng = null;
      state.accuracy = null;
      state.lastUpdated = null;
    },
    setRouteCalculating: (state, action: PayloadAction<boolean>) => {
      state.route.calculating = action.payload;
    },
    setRouteDetails: (state, action: PayloadAction<{
      route: [number, number][];
      distance: number;
      duration: number;
      textDirections?: string[];
    }>) => {
      state.route.coordinates = action.payload.route;
      state.route.distance = action.payload.distance;
      state.route.duration = action.payload.duration;
      state.route.calculating = false;
      if (action.payload.textDirections) {
        state.route.textDirections = action.payload.textDirections;
      }
    },
    clearRouteDetails: (state) => {
      state.route.coordinates = null;
      state.route.distance = null;
      state.route.duration = null;
      state.route.textDirections = null;
      state.route.calculating = false;
    }
  },
});

export const { 
  setUserLocation, 
  clearUserLocation,
  setRouteCalculating,
  setRouteDetails,
  clearRouteDetails
} = userLocationSlice.actions;

export default userLocationSlice.reducer; 