# Banners Management System

This directory contains the complete banners management system for the Tall3at admin panel.

## Components

### 1. BannersDashboard.js
The main dashboard component that manages the different views:
- **List View**: Shows all banners with search, pagination, and sorting
- **Details View**: Shows comprehensive information about a specific banner
- **Form View**: For creating and editing banners

### 2. BannersList.js
Displays a paginated list of banners with:
- Search functionality
- Sorting by title and creation date
- Pagination controls
- Action buttons (view, edit, delete)
- Image previews
- Trip count display

### 3. BannerDetails.js
Shows detailed information about a banner including:
- Banner image
- Basic information (title, subtitle, link)
- Associated trips with details
- Creation date and statistics
- Quick action buttons

### 4. BannerForm.js
Form component for creating and editing banners with:
- Image upload with preview
- Form validation
- File type and size validation
- Trip IDs input
- Success/error handling

## API Integration

### bannersApi.js
Service file containing all API endpoints:
- `getBanners()` - Get all banners
- `getBannersList(params)` - Get paginated list with search/sort
- `getBanner(id)` - Get specific banner
- `createBanner(formData)` - Create new banner
- `updateBanner(id, formData)` - Update existing banner
- `deleteBanner(id)` - Delete banner
- `getActiveBanners()` - Get active banners
- `uploadBannerImage(imageFile)` - Upload banner image
- `getBannerTrips(id, params)` - Get trips associated with banner

## Features

### Banner Management
- ✅ Create new banners
- ✅ Edit existing banners
- ✅ Delete banners
- ✅ View banner details
- ✅ Image upload and management
- ✅ Link banners to trips

### Search & Filtering
- ✅ Search by title, subtitle, or trip IDs
- ✅ Sort by title or creation date
- ✅ Pagination with configurable page sizes
- ✅ Real-time search results

### Image Handling
- ✅ Drag & drop image upload
- ✅ Image preview
- ✅ File type validation (JPG, PNG, GIF, WEBP)
- ✅ File size validation (max 5MB)
- ✅ Image removal functionality

### Trip Association
- ✅ Link banners to multiple trips
- ✅ View associated trips in details
- ✅ Trip information display (price, location, etc.)

### Responsive Design
- ✅ Mobile-friendly interface
- ✅ Responsive tables and forms
- ✅ Touch-friendly controls
- ✅ Adaptive layouts

## Usage

### Navigation
Access the banners management through:
```
/admin/banners
```

### Creating a Banner
1. Click "إضافة بانر جديد" (Add New Banner)
2. Fill in the form fields
3. Upload an image
4. Optionally add trip IDs
5. Click "إنشاء البانر" (Create Banner)

### Editing a Banner
1. Click the edit button (pencil icon) on any banner
2. Modify the desired fields
3. Upload a new image if needed
4. Click "تحديث البانر" (Update Banner)

### Viewing Banner Details
1. Click the view button (eye icon) on any banner
2. See comprehensive information
3. View associated trips if any

### Deleting a Banner
1. Click the delete button (trash icon) on any banner
2. Confirm the deletion in the modal
3. Banner will be permanently removed

## API Endpoints

The system integrates with the following backend endpoints:

- `GET /api/banners` - Get all banners
- `GET /api/banners/list` - Get paginated list
- `GET /api/banners/{id}` - Get specific banner
- `POST /api/banners` - Create banner
- `PUT /api/banners/{id}` - Update banner
- `DELETE /api/banners/{id}` - Delete banner
- `GET /api/banners/active` - Get active banners
- `POST /api/banners/upload-image` - Upload image
- `GET /api/banners/{id}/trips` - Get banner trips

## Styling

All components use modern CSS with:
- Flexbox and Grid layouts
- CSS custom properties
- Responsive breakpoints
- Smooth transitions and animations
- Consistent color scheme
- Arabic RTL support

## Dependencies

- React Router for navigation
- Axios for API calls
- Font Awesome for icons
- Custom CSS for styling

## Error Handling

The system includes comprehensive error handling:
- API error responses
- Network connectivity issues
- File upload errors
- Form validation errors
- User-friendly error messages

## Performance

- Lazy loading of components
- Optimized image handling
- Efficient pagination
- Debounced search
- Minimal re-renders 