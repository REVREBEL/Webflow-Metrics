# Total Rooms Feature

## Overview
Added a `total_rooms` field to hotel configurations to support occupancy calculations and other room-based metrics.

## Changes Made

### 1. Database Schema
- **Migration**: `migrations/0009_add_total_rooms.sql`
- Adds `total_rooms INTEGER DEFAULT NULL` column to the `hotels` table
- Migration is automatically run during database initialization

### 2. Admin Panel UI
- **Component**: `src/components/AdminPanel.tsx`
- Added "Total Rooms" input field in the hotel configuration form
- Field appears after Hotel Code field
- Type: Number input with minimum value of 1
- Optional field with helpful description text
- Displays in hotel list view (e.g., "Rooms: 250")
- Populated when editing existing hotels

### 3. API Endpoints

#### Admin Hotels API (`src/pages/api/admin/hotels.ts`)
- **POST**: Accepts `total_rooms` in request body and saves to database
- **GET**: Returns `total_rooms` in hotel list
- Verification query includes `total_rooms`

#### Client Hotels API (`src/pages/api/client/hotels.ts`)
- **GET**: Returns `total_rooms` so client dashboards can access this data

### 4. TypeScript Interfaces
- Updated `Hotel` interface to include `total_rooms?: number`
- Updated form data state to include `total_rooms`

## Usage

### Adding/Editing a Hotel
1. Go to Admin Panel
2. Fill in hotel details
3. Enter total number of rooms (optional)
4. Save configuration

### Accessing in Metrics
The `total_rooms` value is now available when querying hotels:
- Admin API: Full hotel details including `total_rooms`
- Client API: Hotel list includes `total_rooms`

### Example Use Cases
- **Occupancy Rate**: `(rooms_sold / total_rooms) * 100`
- **Available Rooms**: `total_rooms - rooms_sold`
- **Capacity Utilization**: Compare actual usage against total capacity
- **Revenue per Available Room (RevPAR)**: `total_revenue / total_rooms`

## Database Migration
To apply this change to an existing database:
1. Go to Admin Panel
2. Click "Initialize Database" button
3. The migration will automatically run and add the `total_rooms` column

## Notes
- Field is optional (can be NULL)
- Stored as INTEGER in database
- Defaults to NULL if not provided
- Minimum value enforced in UI: 1
- No maximum value enforced (can accommodate any hotel size)
