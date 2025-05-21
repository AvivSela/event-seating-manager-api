# Guest Management Feature Design Document

## 1. Overview
The guest management feature will allow users to manage guests for their events, including assigning them to specific tables in venues. This system will handle guest information, table assignments, and related operations. The system supports both individual guests and group bookings (e.g., families, couples) where one guest entry can represent multiple attendees.

## 2. Data Models

### 2.1 Guest Entity
```typescript
interface Guest extends BaseEntity {
  eventId: string;          // Reference to the event
  name: string;            // Full name of the primary guest
  email?: string;         // Optional email for communications
  phone?: string;        // Optional phone number
  status: GuestStatus;   // Status of the guest (confirmed, pending, declined)
  partySize: number;    // Total number of people in this guest entry (including primary guest)
  tableAssignment?: TableAssignment;
}

enum GuestStatus {
  INVITED = "INVITED",
  CONFIRMED = "CONFIRMED",
  DECLINED = "DECLINED",
  PENDING = "PENDING"
}

interface TableAssignment {
  tableId: string;        // ID of the table feature in the venue
  seatNumbers: number[];  // Array of seat numbers for the entire party
  assignedAt: Date;      // When the assignment was made
}
```

### 2.2 Extended VenueFeature Types
```typescript
interface TableFeature extends BaseVenueFeature {
  type: "table";
  numberOfSeats: number;
  shape: "round" | "rectangular" | "square";
  tableNumber: string;       // Human-readable table identifier (e.g., "Table 1")
  category?: string;        // Optional category (e.g., "VIP", "Family")
}
```

## 3. API Endpoints

### 3.1 Guest Management
```
POST /api/events/:eventId/guests
GET /api/events/:eventId/guests
GET /api/events/:eventId/guests/:guestId
PUT /api/events/:eventId/guests/:guestId
DELETE /api/events/:eventId/guests/:guestId

# Filtering guests by assignment status
GET /api/events/:eventId/guests?assigned=false  # Get unassigned guests
GET /api/events/:eventId/guests?assigned=true   # Get assigned guests
```

### 3.2 Table Assignment
```
POST /api/events/:eventId/tables/:tableId/assignments
GET /api/events/:eventId/tables/:tableId/assignments
DELETE /api/events/:eventId/tables/:tableId/assignments/:guestId
PUT /api/events/:eventId/tables/:tableId/assignments/:guestId
```

## 4. Feature Components

### 4.1 Guest Management
- Add individual guests with party size
- Edit guest information
- Track guest status
- Search and filter guests

### 4.2 Table Assignment
- Assign guests to specific tables and seats
- Validate seating capacity
- Prevent double-booking of seats

### 4.3 Validation Rules
1. Guest Assignment:
   - Total seats assigned must match the party size
   - Seat numbers must be within table capacity
   - Cannot exceed table capacity
   - Must belong to the correct event

2. Table Configuration:
   - Table capacity (numberOfSeats) must be positive
   - Table must exist in venue layout
   - Table numbers must be unique within a venue

3. Party Size Validation:
   - Party size must be a positive number
   - Party size must not exceed the maximum allowed per event
   - Sum of all party sizes must not exceed event capacity

## 5. Implementation Phases

### Phase 1: Core Guest Management
- Basic guest CRUD operations with party size
- Guest status management
- Simple table assignments

### Phase 2: Table Management
- Table capacity validation
- Seat number tracking
- Basic reporting

### Phase 3: UI Enhancements
- Interactive table view
- Simple drag-and-drop interface
- Basic dashboard

## 6. Technical Considerations

### 6.1 Database Indexes
- Guest name (for search)
- Event ID (for filtering)
- Table assignments (for quick lookup)
- Guest status (for filtering)
- TableAssignment existence (for filtering assigned/unassigned guests)

### 6.2 Performance Optimizations
- Batch processing for bulk operations
- Pagination for large guest lists
- Optimistic locking for concurrent updates
- Efficient seat assignment validation
- Index-based filtering for assignment status

### 6.3 Security
- Validate event ownership
- Rate limiting for guest operations
- Input sanitization

## 7. Error Handling

### 7.1 Common Error Scenarios
- Invalid party size
- Table capacity exceeded
- Double-booked seats
- Invalid seat numbers
- Concurrent modification conflicts

### 7.2 Error Responses
```typescript
interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
}
```

## 8. Future Considerations

1. Integration Features:
   - Export to catering service with total headcount
   - Basic invitation system integration
   - Simple check-in system

2. Advanced Features:
   - Bulk guest import/export
   - Table layout visualization
   - Basic seating optimization

3. Reporting:
   - Guest list with party sizes
   - Table assignments overview
   - Event capacity tracking 