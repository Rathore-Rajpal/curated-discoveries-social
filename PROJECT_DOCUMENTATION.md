# Curated Discoveries Social - Project Documentation

## Project Overview
Curated Discoveries Social is a modern web application built with React, TypeScript, Vite, Tailwind CSS, and Supabase. The platform allows users to create profiles, share discoveries, and interact with other users' content.

## Table of Contents
1. [Authentication System](#authentication-system)
2. [User Profile Management](#user-profile-management)
3. [Navigation and Layout](#navigation-and-layout)
4. [UI Components](#ui-components)
5. [Database Schema](#database-schema)
6. [Storage Configuration](#storage-configuration)
7. [Routing](#routing)
8. [State Management](#state-management)
9. [Styling](#styling)
10. [Error Handling](#error-handling)
11. [Security](#security)
12. [Performance Optimizations](#performance-optimizations)

## Authentication System
The application uses Supabase Auth for user authentication with the following features:
- User signup with email/password
- User login
- User logout
- Session persistence
- Protected routes
- Loading states for auth operations

### Implementation Details
- Uses Supabase Auth client
- Session management through context
- Protected route wrapper component
- Loading states for better UX

## User Profile Management
Comprehensive profile management system with:
- Profile picture upload (avatar)
- Cover photo upload
- Username management
- Full name management
- Bio management
- Profile editing interface
- Profile viewing interface

### Profile Features
- Image upload to Supabase storage
- Real-time profile updates
- Profile viewing for all users
- Edit profile functionality
- Avatar and cover photo management

## Navigation and Layout
Responsive navigation system with:
- Logo and brand name
- Search functionality
- Authentication state-based menu
- User avatar dropdown
- Notifications icon
- Create post button
- Login/Signup buttons

### Layout Components
- Sticky header
- Responsive design
- Mobile-friendly navigation
- User state-based UI elements

## UI Components
Custom-built components for consistent design:

### Core Components
- `Button` - Reusable button component
- `Input` - Form input component
- `Avatar` - User avatar display
- `DropdownMenu` - Navigation dropdowns
- `EditProfileDialog` - Profile editing modal
- `UserProfileHeader` - Profile display header
- `ProfilePage` - Complete profile page

## Database Schema
Supabase database structure:

### Profiles Table
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    bio TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

## Storage Configuration
Supabase storage setup for media files:

### Storage Bucket
- Name: `profile-images`
- Policies:
  1. Public access to images
  2. Authenticated user uploads
  3. User-specific image updates
  4. User-specific image deletion

## Routing
Implemented routes for navigation:

### Available Routes
- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/profile/:username` - Profile viewing
- `/profile/me` - Own profile
- `/create` - Post creation

## State Management
Context-based state management system:

### State Management Features
- `AuthContext` for authentication
- User profile state
- Loading states
- Error handling
- Real-time updates

## Styling
Modern UI implementation:

### Styling Features
- Tailwind CSS framework
- Custom color scheme
- Responsive design
- Modern UI components
- Consistent spacing and layout

## Error Handling
Comprehensive error management:

### Error Handling Features
- Authentication failures
- Profile updates
- Image uploads
- Database operations
- User feedback

## Security
Implemented security measures:

### Security Features
- Protected routes
- User-specific data access
- Secure image uploads
- Storage policies
- Authentication checks

## Performance Optimizations
Performance-focused implementations:

### Optimization Features
- Lazy loading for images
- Loading states
- Efficient state updates
- Conditional rendering
- Optimized database queries

## Technical Stack
- Frontend: React + TypeScript
- Build Tool: Vite
- Styling: Tailwind CSS
- Backend: Supabase
- Authentication: Supabase Auth
- Storage: Supabase Storage
- Database: Supabase PostgreSQL

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start development server: `npm run dev`

## Environment Variables
Required environment variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
[Your License Here] 