# Pencari Anime - WhatAnime Scraper

## Overview

This is a web-based anime search application that allows users to identify anime titles from images or screenshots. The application uses the trace.moe API to perform reverse image searches and the AniList GraphQL API to retrieve detailed anime information including titles in multiple languages. It's a client-side application built with vanilla HTML, CSS, and JavaScript, served using Python's built-in HTTP server.

## Recent Changes (October 1, 2025)

### Latest Update - Comprehensive Anime Information Display
- **Extended AniList API Query**: Expanded GraphQL query to fetch comprehensive anime details including:
  - Format (TV, Movie, OVA, ONA, Special, etc.)
  - Total episodes count
  - Status (Finished Airing, Currently Airing, Hiatus, etc.)
  - Air dates (start and end dates with proper formatting)
  - Season and year premiere
  - Main studio information
  - Source material (Light Novel, Manga, Original, etc.)
  - Genres list
  - Duration per episode
  - Average rating score
- **Anime Info Section**: Added dedicated information section in each result card displaying all anime details in a grid layout
- **Date Formatting**: Implemented smart date formatting that handles partial dates (year-only, month-year, or full date)
- **Status Localization**: Translated anime statuses to Indonesian (Selesai Tayang, Sedang Tayang, Hiatus, etc.)
- **Source Localization**: Translated source materials to Indonesian/English readable format
- **UI Improvements**: Enhanced footer spacing (margin-top: 60px) for better visual separation
- **Null Handling**: Fixed conditional checks to properly handle zero values for episodes, duration, and ratings

### Security Improvements
- **XSS Mitigation**: Replaced innerHTML with safe DOM construction using textContent for all external API data
- **Response Validation**: Added response.ok checks for all API calls before parsing JSON
- **Error Handling**: Improved error handling with proper GraphQL error detection

### Performance Optimizations
- **Parallel API Fetches**: Implemented Promise.all for AniList API calls to fetch anime titles in parallel
- **Reduced Latency**: Changed from sequential to parallel fetching for top 5 results

### Feature Enhancements
- **Accurate Anime Titles**: Integration with AniList GraphQL API to fetch complete anime information
- **Multi-Language Support**: Displays romaji, English, and native Japanese titles
- **Episode & Timestamp**: Shows accurate episode number and video timestamp (mm:ss format)
- **Video Preview**: Displays video preview from matched anime scenes
- **Real-Time Date/Time**: Footer shows current date and time in Indonesian language

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Technology Stack**: Vanilla HTML5, CSS3, and JavaScript (no frameworks)
- **Design Pattern**: Single-page application (SPA) with DOM manipulation
- **UI Components**:
  - File upload with drag-and-drop functionality
  - URL-based image search input
  - Image preview display
  - Loading state indicators
  - Results display section
  - Real-time date/time footer

### Styling Architecture
- **CSS Approach**: Custom CSS with modern features
  - Linear gradient background (purple theme: #667eea to #764ba2)
  - Flexbox layout for responsive design
  - Box shadow and border-radius for modern UI elements
  - Drag-and-drop visual feedback with state classes
- **Responsive Design**: Mobile-first approach with viewport meta tag

### Client-Side Logic
- **File Handling**: 
  - FileReader API for local file processing
  - FormData API for secure file uploads to trace.moe
  - Drag-and-drop event listeners for enhanced UX
  - Image type validation
- **State Management**: Safe DOM manipulation for UI state updates
  - Preview section toggle
  - Loading state display
  - Results rendering with XSS-safe construction
- **API Integration**:
  - trace.moe API for reverse image search
  - AniList GraphQL API for anime metadata
  - Parallel fetching with Promise.all for performance
  - Error handling with response validation

### Deployment Architecture
- **Server**: Python HTTP server (python -m http.server)
- **Port Configuration**: Fixed port 5000 for consistent access
- **Python Version**: Requires Python 3.11 or higher

## External Dependencies

### Third-Party APIs
1. **trace.moe API** (`https://api.trace.moe`)
   - Primary service for anime image recognition
   - Reverse image search functionality
   - Supports both file upload (FormData) and URL-based search
   - Returns anime match results with anilist IDs, episode, timestamp, and similarity scores
   - Free tier: 100 searches per day

2. **AniList GraphQL API** (`https://graphql.anilist.co`)
   - Fetches detailed anime information by ID
   - Returns titles in romaji, English, and native Japanese
   - GraphQL endpoint for efficient data queries
   - No authentication required for public data

### Browser APIs
- **FileReader API**: Client-side file reading for image preview
- **FormData API**: Secure file upload to trace.moe API
- **Drag and Drop API**: Enhanced file upload experience
- **Fetch API**: HTTP requests to external APIs with proper error handling