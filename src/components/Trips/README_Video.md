# Trip Video Management System

This document describes the video management functionality for trips in the Tall3at Admin Panel.

## Overview

The video management system consists of three main components:

1. **VideoUpload** - Handles video upload, update, and deletion
2. **VideoPlayer** - Custom video player with controls
3. **VideoManager** - Combines upload and player functionality with tabs

## Components

### VideoUpload Component

**File:** `src/components/Trips/VideoUpload.js`

**Features:**
- Upload video files for trips
- Update existing videos
- Delete videos
- File validation (MP4, AVI, MOV, WMV, FLV, WEBM)
- File size validation (max 100MB)
- Video preview before upload
- Progress indicators and loading states
- Error handling

**Props:**
- `tripId` (number) - The ID of the trip
- `onVideoUploaded` (function) - Callback when video is uploaded/updated
- `onVideoDeleted` (function) - Callback when video is deleted

**Usage:**
```jsx
<VideoUpload 
  tripId={1}
  onVideoUploaded={(video) => console.log('Video uploaded:', video)}
  onVideoDeleted={() => console.log('Video deleted')}
/>
```

### VideoPlayer Component

**File:** `src/components/Trips/VideoPlayer.js`

**Features:**
- Custom video player with controls
- Play/pause functionality
- Progress bar with seeking
- Volume control and mute
- Fullscreen support
- Time display
- Keyboard shortcuts (spacebar for play/pause)
- Responsive design

**Props:**
- `videoUrl` (string) - URL of the video to play
- `title` (string) - Title displayed in the player
- `showControls` (boolean) - Whether to show custom controls
- `autoPlay` (boolean) - Whether to autoplay the video

**Usage:**
```jsx
<VideoPlayer 
  videoUrl="/uploads/videos/sample.mp4"
  title="Trip Video"
  showControls={true}
  autoPlay={false}
/>
```

### VideoManager Component

**File:** `src/components/Trips/VideoManager.js`

**Features:**
- Combines upload and player functionality
- Tabbed interface for switching between view and manage modes
- Automatic loading of existing videos
- Video metadata display
- Responsive design

**Props:**
- `tripId` (number) - The ID of the trip
- `tripTitle` (string) - Title of the trip for display
- `showUpload` (boolean) - Whether to show upload functionality
- `showPlayer` (boolean) - Whether to show player functionality

**Usage:**
```jsx
<VideoManager 
  tripId={1}
  tripTitle="Amazing Trip"
  showUpload={true}
  showPlayer={true}
/>
```

## API Integration

### Video API Service

**File:** `src/services/videoApi.js`

**Endpoints:**
- `GET /api/videos/trip/{tripId}` - Get video by trip ID
- `GET /api/videos/{id}` - Get video by ID
- `POST /api/videos/upload` - Upload video for a trip
- `PUT /api/videos/{id}` - Update video
- `DELETE /api/videos/{id}` - Delete video by ID
- `DELETE /api/videos/trip/{tripId}` - Delete video by trip ID

### Configuration

**File:** `src/constants/config.js`

Added video endpoints:
```javascript
export const ENDPOINTS = {
  // ... existing endpoints
  VIDEOS: '/videos',
  VIDEOS_BY_TRIP: '/videos/trip',
  VIDEOS_UPLOAD: '/videos/upload',
};
```

## Integration with TripDetails

The VideoManager component has been integrated into the TripDetails component:

**File:** `src/components/Trips/TripDetails.js`

Added after the trip description section:
```jsx
{/* Trip Video */}
<div className="trip-details-video">
  <VideoManager 
    tripId={tripId} 
    tripTitle={trip.title || trip.titleEn || 'Trip'}
    showUpload={true}
    showPlayer={true}
  />
</div>
```

## Demo Component

**File:** `src/components/Trips/VideoDemo.js`

A demo component for testing the video functionality with different modes:
- Video Manager (Full functionality)
- Video Upload Only
- Video Player Only

## File Structure

```
src/components/Trips/
├── VideoUpload.js          # Video upload component
├── VideoUpload.css         # Upload component styles
├── VideoPlayer.js          # Video player component
├── VideoPlayer.css         # Player component styles
├── VideoManager.js         # Combined manager component
├── VideoManager.css        # Manager component styles
├── VideoDemo.js           # Demo component
├── VideoDemo.css          # Demo component styles
└── README_Video.md        # This documentation
```

## Features

### ✅ Implemented Features

1. **Video Upload**
   - File type validation (MP4, AVI, MOV, WMV, FLV, WEBM)
   - File size validation (max 100MB)
   - Video preview before upload
   - Progress indicators
   - Error handling

2. **Video Player**
   - Custom controls
   - Play/pause functionality
   - Progress bar with seeking
   - Volume control and mute
   - Fullscreen support
   - Time display
   - Keyboard shortcuts

3. **Video Management**
   - Update existing videos
   - Delete videos
   - Video metadata display
   - Tabbed interface

4. **UI/UX**
   - Responsive design
   - Loading states
   - Error messages
   - Success feedback
   - Modern styling

5. **Integration**
   - Seamless integration with TripDetails
   - API service layer
   - Proper error handling
   - Callback support

## Usage Examples

### Basic Video Upload
```jsx
import VideoUpload from './components/Trips/VideoUpload';

<VideoUpload 
  tripId={123}
  onVideoUploaded={(video) => {
    console.log('Video uploaded successfully:', video);
  }}
  onVideoDeleted={() => {
    console.log('Video deleted successfully');
  }}
/>
```

### Custom Video Player
```jsx
import VideoPlayer from './components/Trips/VideoPlayer';

<VideoPlayer 
  videoUrl="https://example.com/video.mp4"
  title="My Trip Video"
  showControls={true}
  autoPlay={false}
/>
```

### Full Video Management
```jsx
import VideoManager from './components/Trips/VideoManager';

<VideoManager 
  tripId={123}
  tripTitle="Amazing Desert Safari"
  showUpload={true}
  showPlayer={true}
/>
```

## Browser Support

The video components support modern browsers with HTML5 video support:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## File Size Limits

- Maximum file size: 100MB
- Supported formats: MP4, AVI, MOV, WMV, FLV, WEBM
- Recommended format: MP4 (H.264 codec)

## Security Considerations

- File type validation on both client and server
- File size validation
- Proper error handling
- User authorization checks (handled by API)
- Secure file upload handling

## Future Enhancements

Potential improvements for future versions:
- Video compression/optimization
- Thumbnail generation
- Video editing capabilities
- Multiple video support per trip
- Video analytics
- Streaming support
- Mobile-optimized upload 