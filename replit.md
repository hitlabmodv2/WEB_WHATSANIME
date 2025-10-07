# WhatAnime Finder

## Overview

WhatAnime Finder is a web application that helps users identify anime from screenshots. The application uses the Trace.moe API to perform reverse image searches on anime screenshots. Users can upload images directly or provide image URLs to find matching anime scenes with detailed information including title, episode, timestamp, and similarity score.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Single Page Application (SPA)**
- Pure vanilla JavaScript implementation without frameworks
- Client-side image handling and preview functionality
- Tab-based interface for dual input methods (file upload vs URL)
- Real-time image preview before search execution

**Design Pattern**: The frontend uses an event-driven architecture where user interactions (file selection, URL input, tab switching) trigger corresponding handler functions that update the UI state.

**Rationale**: Vanilla JavaScript was chosen for simplicity and to avoid framework overhead for a lightweight application. This reduces bundle size and improves initial load performance.

### Backend Architecture

**Express.js Server**
- Static file server serving frontend assets from the `public` directory
- Simple routing configuration with a single root route handler
- JSON middleware for potential API endpoint expansion

**Design Pattern**: The server follows a minimal Express.js pattern focused on static file serving. The architecture allows for easy API endpoint addition in the future.

**Server Configuration**:
- Listens on port 5000 by default
- Binds to 0.0.0.0 for external accessibility
- Uses express.static middleware for efficient static file delivery

**Alternative Considered**: Using the `serve` package (included in dependencies) as a simpler static server. Express was chosen to allow future backend API development without architectural changes.

### Data Storage

**No Database Implementation**
- Application operates statelessly
- No user data persistence
- Image processing happens client-side before API submission

**Rationale**: The application's core functionality (anime identification) relies entirely on the external Trace.moe API. No user authentication or data storage requirements exist, making a database unnecessary and reducing infrastructure complexity.

### Authentication & Authorization

**No Authentication System**
- Public access application
- No user accounts or session management
- Stateless request handling

**Rationale**: The application provides a public utility service without personalized features, eliminating authentication requirements.

## External Dependencies

### Third-Party APIs

**Trace.moe API**
- Primary service for anime scene identification
- Accepts image uploads or URLs for reverse image search
- Returns anime metadata including title, episode, timestamp, and similarity score
- No API key required for basic usage

**Integration Method**: Client-side API calls directly from the browser (expected implementation based on UI structure)

### NPM Packages

**Production Dependencies**:
- `express` (v5.1.0): Web server framework
- `serve` (v14.2.1): Alternative static file server (currently unused but available)

**Development Tools**:
- `@zeit/schemas`: Configuration schemas
- `ajv`: JSON schema validation (transitive dependency)

### Runtime Requirements

**Node.js**: Version 18.0.0 or higher required for modern JavaScript features and Express 5.x compatibility

### Deployment Configuration

**Port Configuration**: Uses environment variable `$PORT` in start script for platform flexibility (Replit, Heroku, etc.)

**Static Asset Serving**: All frontend files (HTML, CSS, JavaScript) served from the `public` directory