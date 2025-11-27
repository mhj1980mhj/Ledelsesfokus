# Overview

This is a modern full-stack web application built for property management (al2bolig). It features a React frontend with TypeScript, an Express.js backend, and a PostgreSQL database with Drizzle ORM. The application provides two main sections:

1. **Ledelsesfokus (Management Focus)** - Main landing page featuring a database-backed project timeline management system with quarter-based Gantt chart visualization. Supports project creation, time-based segments, drag-and-drop, search/filtering, and Danish interface with al2bolig's brown/beige color theme. Timeline displays quarters (Q1-Q4) for better overview while storing data at month-level precision.
2. **Power BI Rapporter** - Advanced analytics and reporting dashboards with search functionality, category filtering, and management dashboard cards. Layout matches Ledelsesfokus structure for consistent user experience.

The application uses a consistent PageHeader component across all pages and a shared Navigation component for seamless navigation between sections. The application is designed to provide leadership with a clear overview of organizational projects while maintaining access to analytical tools and administrative functions.

## Recent Changes (October 2025)
- Built complete project timeline system with Gantt chart visualization
- Implemented PostgreSQL-backed storage with projects and segments tables
- Added drag-and-drop segment movement and resize functionality
- Removed outdated "Områder" (Areas) tab - now shows simple "Projekter" heading
- All CRUD operations use optimistic updates for responsive UX
- Added "Ansvarlig" (responsible person) field to projects with 1-3 character validation, filtering, and display
- Standardized layout between Ledelsesfokus and Power BI Rapporter pages for consistent UX
- Power BI Rapporter: Added search functionality (name/category/description) and category filter dropdown
- Power BI Rapporter: Layout now matches Ledelsesfokus with white control block structure
- **Timeline now displays in quarters (Q1-Q4)** instead of months for better overview while maintaining month-level data precision
- **Timeline width is now fully responsive** - Dynamically adjusts number of visible quarters based on available container width using ResizeObserver, with minimum of 4 quarters
- **Two-tier authentication system implemented:**
  - Regular user (AL2bolig/AL2bedst): View-only access to Data page
  - Admin user (admin/AL2bedst): Full CRUD access (create, edit, delete resources)

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript and Vite for development
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Framework**: Express.js with TypeScript
- **Build System**: ESBuild for production builds, TSX for development
- **API Design**: RESTful API with `/api` prefix
- **Error Handling**: Centralized error handling middleware
- **Logging**: Custom logging system with request/response tracking

## Database Architecture
- **Database**: PostgreSQL with Neon serverless hosting
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: @neondatabase/serverless for serverless PostgreSQL connections

## Data Models
- **Users**: Authentication and user management
- **Dashboard Stats**: Key performance indicators and metrics
- **Projects**: Project management with color coding and area categorization
- **Segments**: Time-based project segments with month indices for Gantt visualization
- **Type Safety**: Zod schemas for runtime validation and TypeScript inference

### Project Timeline Schema
- Projects table: id (varchar), name, color, area, ansvarlig
- Segments table: id (varchar), project_id (FK), label, start_month (int), end_month (int), description
- Month indexing: year * 12 + month (0-indexed) for precise timeline calculations
- Quarter display: Frontend converts months to quarters (Q1-Q4) for better overview
- Quarter indexing: year * 4 + Math.floor(month / 3) for display calculations
- Cell width: 80px per quarter (representing 3 months)

## Authentication & Storage
- **Session Management**: connect-pg-simple for PostgreSQL-backed sessions
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **Production Storage**: Designed to use PostgreSQL for persistent data storage

## Development Architecture
- **Monorepo Structure**: Client, server, and shared code in organized directories
- **Path Aliases**: TypeScript path mapping for clean imports (@/, @shared/)
- **Hot Reload**: Vite HMR for fast development cycles
- **Type Checking**: Strict TypeScript configuration across all packages

## UI/UX Design
- **Design System**: New York variant of shadcn/ui with neutral base colors
- **Component Library**: Comprehensive set of accessible components (buttons, forms, cards, etc.)
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Dashboard Layout**: Sidebar navigation with multi-page dashboard views

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Build Tools**: Vite (frontend), ESBuild (backend), TypeScript compiler
- **Package Manager**: npm with lockfile for dependency management

## UI and Styling
- **Component Library**: Radix UI primitives for accessible components
- **Styling Framework**: Tailwind CSS with PostCSS processing
- **Icon Library**: Lucide React for consistent iconography
- **Fonts**: Google Fonts integration (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter)

## Data and Forms
- **Data Fetching**: TanStack Query for server state management
- **Form Validation**: React Hook Form with Hookform Resolvers
- **Schema Validation**: Zod for runtime type checking
- **Date Handling**: date-fns for date manipulation

## Development Tools
- **Replit Integration**: Custom Vite plugins for Replit development environment
- **Session Storage**: connect-pg-simple for PostgreSQL session management
- **Carousel**: Embla Carousel for image/content sliders
- **Utilities**: clsx and class-variance-authority for conditional styling

## Business Intelligence
- **Analytics Platform**: Power BI integration for advanced reporting and dashboards
- **Data Visualization**: Custom dashboard components with placeholder for Power BI embeds
- **Metrics Display**: Real-time KPI cards and statistical components