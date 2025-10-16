# Design Guidelines: China-Somaliland Shipment Tracking System

## Design Approach
**Selected Framework:** Material Design with logistics industry adaptations
**Rationale:** This utility-focused application requires clear data hierarchy, efficient workflows, and professional credibility. Material Design provides robust patterns for data-dense interfaces while maintaining visual clarity.

**Key Design Principles:**
- Information clarity over decoration
- Efficient task completion
- Professional trustworthiness
- Clear visual hierarchy for tracking data

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Primary: 204 80% 45% (Ocean blue - trust and reliability)
- Surface: 0 0% 98% (Clean background)
- Container: 0 0% 100% (Card backgrounds)
- Text Primary: 220 15% 20%
- Text Secondary: 220 10% 45%
- Success: 142 71% 45% (Delivered status)
- Warning: 38 92% 50% (In transit)
- Error: 0 72% 51% (Delayed)
- Border: 220 13% 91%

**Dark Mode:**
- Primary: 204 80% 55%
- Surface: 220 18% 12%
- Container: 220 15% 16%
- Text Primary: 220 15% 95%
- Text Secondary: 220 10% 65%
- Borders: 220 15% 25%

### B. Typography
- **Primary Font:** Inter (via Google Fonts)
- **Mono Font:** JetBrains Mono (for tracking numbers)
- **Hierarchy:**
  - Page titles: text-3xl font-bold (30px)
  - Section headers: text-xl font-semibold (20px)
  - Card titles: text-lg font-medium (18px)
  - Body text: text-base (16px)
  - Metadata: text-sm text-secondary (14px)
  - Tracking numbers: font-mono text-sm tracking-wider

### C. Layout System
**Spacing Primitives:** Tailwind units of 4, 6, 8, 12, 16, 24
- Component padding: p-6
- Card spacing: gap-6
- Section margins: mb-8
- Dashboard grid gaps: gap-4
- Form spacing: space-y-6

**Container Structure:**
- Max width: max-w-7xl mx-auto
- Side padding: px-4 md:px-6
- Top navigation height: h-16

### D. Component Library

**Dashboard Layout:**
- Top navigation bar with logo, search, and user menu
- Stats overview cards (4 columns on desktop: Total Shipments, In Transit, Delivered, Pending)
- Main shipment table/grid with sortable columns
- Sidebar filters (status, date range, origin/destination)

**Shipment Cards:**
- Prominent tracking number in mono font at top
- Product name and quantity as title
- Origin (China city) → Destination (Somaliland city) with arrow icon
- Current status badge with color coding
- Timeline progress bar (5 stages)
- Estimated delivery date
- Action buttons: View Details, Update Status

**Status Timeline:**
- Vertical timeline with checkpoints
- 5 key milestones: Order Placed → Departed China → In Transit → Customs Clearance → Arrived Somaliland
- Each step shows date/time stamp
- Visual indicator for current step (filled circle) vs completed (checkmark) vs pending (outlined)
- Use connecting lines between steps

**Data Table:**
- Sticky header row
- Alternating row backgrounds (subtle)
- Column headers: Tracking #, Product, Origin, Destination, Status, Last Update, Actions
- Hover state on rows
- Quick action buttons inline

**Forms (Create Shipment):**
- Two-column layout on desktop
- Input fields: Product Name, Quantity, Supplier Info, Origin City (China), Destination (Somaliland), Notes
- Auto-generated tracking number displayed after creation
- Primary CTA button: "Create Shipment"

**Search & Filters:**
- Prominent search bar in header (w-96)
- Filter chips for quick status filtering
- Date range picker for shipment filtering
- Clear filters action

**Status Badges:**
- Rounded-full px-3 py-1 text-sm font-medium
- Color coded: Success green (Delivered), Warning amber (In Transit), Blue (Departed), Gray (Pending), Red (Delayed)

### E. UI Patterns

**Navigation:**
- Fixed top navbar with shadow-sm
- Logo left, search center, user menu right
- Mobile: Hamburger menu with slide-out drawer

**Empty States:**
- Centered with illustration placeholder
- Clear messaging: "No shipments yet"
- Primary CTA: "Create First Shipment"

**Loading States:**
- Skeleton loaders for cards and table rows
- Spinner for actions/updates

**Interactions:**
- Subtle hover effects (background color shift)
- Status updates via dropdown menu (not modal)
- Toast notifications for success/error states
- Smooth transitions (transition-all duration-200)

### F. Images
**No hero image needed** - this is a utility application focused on data and functionality.

**Icon Strategy:**
- Use Heroicons throughout
- Package/truck icons for shipments
- Location markers for origin/destination  
- Clock for timestamps
- Check/x for status indicators
- Arrow icons for directional flow

### G. Responsive Behavior
- Desktop: Multi-column dashboard, side-by-side forms
- Tablet: Stack some columns, maintain table
- Mobile: Card-based layout, hamburger navigation, full-width forms, stacked stats

**Critical Design Notes:**
- Tracking numbers must be easily copyable (click-to-copy functionality)
- Status colors must be consistent across all views
- Timeline should be the focal point of detail views
- Maintain consistent 6-unit spacing throughout
- Dark mode must extend to all form inputs and tables