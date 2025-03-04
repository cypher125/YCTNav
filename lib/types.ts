export interface Building {
  id: string
  name: string
  department: string
  description: string
  image?: string
  facilities?: string[]
  coordinates?: {
    lat: number
    lng: number
  }
}

