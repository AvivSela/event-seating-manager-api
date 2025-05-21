# UUID Migration Plan

## Overview
This document outlines the plan to migrate all entity IDs from auto-incrementing integers to UUIDs across the event seating API. This change will provide better scalability, improved security, and easier data synchronization.

## Current State
The following entities currently use auto-incrementing integer IDs:
- Users (`id: number`)
- Events (`id: number`, `userId: number`, `venueId: number`)
- Venues (`id: number`)

## Migration Steps

### 1. Preparation Phase

#### 1.1 Install Dependencies
```bash
npm install uuid @types/uuid
```

#### 1.2 Create UUID Utility
Create `src/utils/uuid.ts`:
```typescript
import { v4 as uuidv4 } from 'uuid';

export const generateUUID = (): string => uuidv4();
```

#### 1.3 Update Type Definitions
Update type definitions in `src/types/`:
```typescript
// Base interface for all entities
interface BaseEntity {
  id: string; // Changed from number to string
  createdAt: Date;
  updatedAt?: Date;
}

// Update existing interfaces
interface User extends BaseEntity {
  name: string;
  email: string;
}

interface Event extends BaseEntity {
  userId: string; // Changed from number
  venueId: string; // Changed from number
  type: EventType;
  title: string;
  description: string;
  date: Date;
}

interface Venue extends BaseEntity {
  name: string;
  address: string;
  capacity: number;
  description?: string;
  map?: VenueMap;
}
```

### 2. Implementation Phase

#### 2.1 Update Controllers
Modify each controller to:
- Use UUID generation instead of auto-incrementing numbers
- Handle UUID string comparisons instead of numeric comparisons
- Update type annotations

Example updates:
```typescript
// Before
const newUser = {
  id: nextId++,
  name,
  email,
  createdAt: new Date()
};

// After
const newUser = {
  id: generateUUID(),
  name,
  email,
  createdAt: new Date()
};
```

#### 2.2 Update Route Parameters
Modify route parameter handling:
```typescript
// Before
const userId = parseInt(req.params.id);

// After
const userId = req.params.id;
```

#### 2.3 Update Tests
- Update test fixtures to use UUID strings
- Update test assertions to handle UUID strings
- Add UUID format validation tests
- Update test factories to use UUID generation

### 3. Database Considerations (Future)
When implementing a database:
- Use UUID type for ID columns
- Consider using UUID v4 for randomness
- Add appropriate indexes on UUID columns
- Consider using binary UUID storage for better performance

### 4. API Documentation Updates
Update all API documentation to reflect UUID usage:
- Update request/response examples
- Update parameter descriptions
- Add UUID format specifications
- Update error message examples

### 5. Testing Strategy

#### 5.1 Unit Tests
- Test UUID generation
- Test ID comparisons
- Test route parameter handling
- Test entity creation with UUIDs

#### 5.2 Integration Tests
- Test entity relationships with UUID references
- Test API endpoints with UUID parameters
- Test error handling for invalid UUIDs

#### 5.3 Performance Tests
- Measure impact of UUID comparison vs integer comparison
- Verify memory usage
- Test concurrent UUID generation

### 6. Implementation Order

1. Create UUID utility functions
2. Update type definitions
3. Update controllers in order:
   - Users (no dependencies)
   - Venues (no dependencies)
   - Events (depends on Users and Venues)
4. Update tests
5. Update documentation
6. Perform integration testing

### 7. Rollback Plan

#### 7.1 Code Rollback
- Maintain git tags at key migration points
- Keep backup of integer-based implementation
- Document rollback procedures

#### 7.2 Data Rollback (Future)
When implementing a database:
- Create backup before migration
- Maintain both ID formats during transition
- Plan for data recovery if needed

## Risks and Mitigation

### Risks
1. Performance impact of string comparison vs integer comparison
2. Memory usage increase
3. Potential bugs in ID comparison logic
4. Impact on future database implementation

### Mitigation
1. Implement efficient UUID comparison methods
2. Use appropriate UUID storage formats
3. Comprehensive testing suite
4. Follow database best practices for UUID storage

## Timeline Estimate

1. Preparation Phase: 1 day
   - Dependencies and utility setup
   - Type definition updates

2. Implementation Phase: 2-3 days
   - Controller updates
   - Route updates
   - Test updates

3. Testing Phase: 1-2 days
   - Unit testing
   - Integration testing
   - Performance testing

4. Documentation: 1 day
   - API documentation updates
   - Migration documentation

Total Estimated Time: 5-7 days

## Success Criteria

1. All entity IDs successfully using UUID format
2. All tests passing with UUID implementation
3. Documentation updated to reflect UUID usage
4. No performance degradation in API responses
5. Successful integration tests across all endpoints 