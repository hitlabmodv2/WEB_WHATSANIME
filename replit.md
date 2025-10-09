# WhatAnime Finder

## Overview

WhatAnime Finder is a web application that helps users identify anime from screenshots. The application uses the Trace.moe API to perform reverse image searches on anime screenshots. Users can upload images directly or provide image URLs to find matching anime scenes with detailed information including title, episode, timestamp, and similarity score.

## Recent Updates (October 2025)

### Mobile Responsiveness Improvements
- Fixed header layout to prevent menu button overlap with title on mobile devices
- Added responsive padding and spacing for optimal mobile viewing
- Implemented mobile-specific styling for all modals and components

### Enhanced Image Upload
- Expanded supported format display: JPG, PNG, GIF, WebP, BMP, SVG
- Improved scraper selection dropdown with clear descriptions (V1 - Trace.moe, V2 - SauceNAO)
- Better dropdown visibility with optimized option styling

### Developer Modal Features
- Custom anime 2D coder avatar image (generated)
- Skills section with visual progress bars (Node.js 90%, JavaScript 85%, Express.js 88%, HTML/CSS 92%)
- Achievement badges system (Code Master, Bug Hunter, Coffee Lover, Night Owl)
- Coding streak counter with animated flame icon (365 days)
- Motivational phrase rotation system (60-second intervals, lightweight performance)

### Server Info Enhancements
- Temperature monitoring display
- Total requests counter
- Detailed server information section (Platform, Runtime, Status)
- Clear RAM usage indicator with total capacity display

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

## Project Structure

### Key Files
- `public/index.html` - Main application HTML with modals for developer info and server info
- `public/style.css` - Complete styling including responsive design for mobile devices
- `public/script.js` - Core application logic, API integration, and UI interactions
- `public/coding-words.js` - Phrase rotation data for developer modal motivational messages
- `public/dev-avatar.png` - Custom anime 2D coder avatar for developer profile
- `public/backgrounds/` - Dynamic background images for different times of day
- `server.js` - Express server configuration for static file serving

### Design Decisions

**Performance Optimization**
- Replaced heavy character-by-character typing animation with lightweight 60-second phrase rotation
- Optimized mobile layouts to reduce unnecessary rendering
- Minimal JavaScript footprint with no external framework dependencies

**User Experience**
- Achievement badges provide gamification element
- Skills visualization helps users understand developer expertise
- Server info transparency builds trust with clear metrics display
- Mobile-first responsive design ensures accessibility across all devices