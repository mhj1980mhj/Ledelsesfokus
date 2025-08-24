# Overview

This is a modern full-stack web application built for property management (al2bolig). It features a React frontend with TypeScript, an Express.js backend, and a PostgreSQL database with Drizzle ORM. The application provides a comprehensive dashboard for managing properties, tenants, finances, and maintenance operations with support for Power BI integration for advanced analytics.

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
- **Type Safety**: Zod schemas for runtime validation and TypeScript inference

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