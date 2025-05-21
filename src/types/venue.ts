export interface VenueFeature {
  type: 'stage' | 'bar' | 'entrance' | 'restroom' | 'emergency_exit';
  position: {
    x: number;
    y: number;
  };
  dimensions?: {
    width: number;
    height: number;
  };
  rotation?: number; // in degrees
}

export interface VenueMap {
  dimensions: {
    width: number;  // in meters
    height: number; // in meters
  };
  features: VenueFeature[];
}

export interface Venue {
  id: number;
  name: string;
  address: string;
  capacity: number;
  description?: string;
  map?: VenueMap;      // Making it optional for backward compatibility
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateVenueDto {
  name: string;
  address: string;
  capacity: number;
  description?: string;
  map?: VenueMap;
}

export interface UpdateVenueDto {
  name?: string;
  address?: string;
  capacity?: number;
  description?: string;
  map?: VenueMap;
} 