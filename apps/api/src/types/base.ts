/**
 * Base interface for all entities in the system
 * Provides common fields that all entities should have
 */
export interface BaseEntity {
  id: string;  // UUID string
  createdAt: Date;
  updatedAt?: Date;
} 