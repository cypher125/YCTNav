export interface Building {
  name: string
  description?: string
  department: string
  image?: string
  facilities?: string[]
  coordinates: {
    lat: number
    lng: number
  }
}

export interface BuildingCreate {
  name: string
  description?: string
  department: string
  image?: string
  facilities?: string[]
  coordinates: {
    lat: number
    lng: number
  }
}

export interface BuildingUpdate {
  name: string
  description?: string
  department?: string
  image?: string
  facilities?: string[]
  coordinates?: {
    lat: number
    lng: number
  }
}

