import { BaseEntity } from './base';

export interface Guest {
  id: string;
  name: string;
  seatNumber: number;
}

export interface BaseVenueFeature {
  type: string;
  position: {
    x: number;
    y: number;
  };
  dimensions: {
    width: number;
    height: number;
  };
  rotation?: number;
}

export interface TableFeature extends BaseVenueFeature {
  type: "table";
  numberOfSeats: number;
  shape: "round" | "rectangular" | "square";
  tableNumber: string;
  category?: string;
  guests?: Guest[];
}

export interface OtherFeature extends BaseVenueFeature {
  type: "stage" | "bar" | "entrance";
}

export type VenueFeature = TableFeature | OtherFeature;

export interface VenueMap {
  dimensions: {
    width: number;
    height: number;
  };
  features: VenueFeature[];
}

export interface Venue extends BaseEntity {
  name: string;
  address: string;
  capacity: number;
  description?: string;
  map?: VenueMap;
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
