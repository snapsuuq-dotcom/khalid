# China-Somaliland Shipment Tracking System

## Overview
A comprehensive shipment tracking application for managing sourcing business from China to Somaliland. Features automatic tracking number generation, status management, and real-time shipment monitoring.

## Project Purpose
Enable efficient tracking and management of international shipments with:
- Automatic tracking number generation (CN-SL prefix format)
- 5-stage shipment lifecycle tracking
- Real-time status updates with timeline visualization
- Search and filter capabilities
- Dark mode support

## Tech Stack
- **Frontend**: React, Wouter (routing), TanStack Query, Shadcn UI, Tailwind CSS
- **Backend**: Express.js, In-memory storage
- **Build**: Vite
- **Styling**: Material Design approach with ocean blue primary color (204 80% 45%)

## Recent Changes (October 16, 2025)
- Initial project setup with complete MVP implementation
- Implemented shipment creation, listing, and detail views
- Added 5-stage status tracking: Pending → Order Placed → Departed China → In Transit → Customs Clearance → Delivered
- Built responsive dashboard with stats cards and search functionality
- Created visual timeline component for shipment journey tracking
- Implemented dark mode with theme toggle
- Added click-to-copy tracking numbers with toast notifications

## Project Architecture

### Data Model
**Shipments:**
- id, trackingNumber (auto-generated), productName, quantity, supplierInfo
- originCity (China), destination (Somaliland)
- currentStatus, notes, estimatedDelivery
- createdAt, updatedAt

**Status Updates:**
- id, shipmentId, status, timestamp, notes
- Tracks all status changes for audit trail

### Routes
- `/` - Dashboard with all shipments, stats, and search
- `/create` - Create new shipment form
- `/shipment/:id` - Shipment detail with timeline and status updates

### API Endpoints
- `GET /api/shipments` - List all shipments
- `GET /api/shipments/:id` - Get shipment details
- `POST /api/shipments` - Create new shipment
- `GET /api/shipments/:id/status-updates` - Get status history
- `POST /api/shipments/:id/status` - Update shipment status

### Key Features
1. **Automatic Tracking**: Generates unique tracking numbers (CN-SL-TIMESTAMP-RANDOM)
2. **Status Timeline**: Visual representation of shipment journey
3. **Search**: Filter shipments by tracking number, product, or location
4. **Stats Dashboard**: Quick overview of total, in-transit, delivered, and pending shipments
5. **Dark Mode**: Full theme support with persistent preference

### Design System
- Primary Color: Ocean Blue (204 80% 45%) - trust and reliability
- Typography: Inter (primary), JetBrains Mono (tracking numbers)
- Spacing: Consistent 6-unit spacing (p-6, gap-6, mb-6)
- Components: Material Design approach with subtle elevations

## User Workflow
1. Create shipment with product details, supplier, route, and estimated delivery
2. System auto-generates unique tracking number
3. Track shipment through 5 stages with manual status updates
4. View detailed timeline with timestamps for each status change
5. Search/filter shipments on dashboard
6. Copy tracking numbers for sharing

## Storage
- In-memory storage (MemStorage) for fast development
- All data resets on server restart
- Ready for database migration if needed

## Development Notes
- All components use Shadcn UI primitives
- TanStack Query handles all API calls and caching
- Form validation with Zod schemas
- Responsive design: mobile-first approach
- Test IDs added for all interactive elements
