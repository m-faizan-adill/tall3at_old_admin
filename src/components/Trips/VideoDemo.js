import React, { useState } from 'react';
import VideoManager from './VideoManager';
import VideoUpload from './VideoUpload';
import VideoPlayer from './VideoPlayer';
import './VideoDemo.css';

const VideoDemo = () => {
  const [selectedTripId, setSelectedTripId] = useState(1);
  const [demoMode, setDemoMode] = useState('manager'); // 'manager', 'upload', 'player'

  const demoVideoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';

  return (
    <div className="video-demo-container">
      <div className="demo-header">
        <h1>Video Management Demo</h1>
        <p>Test the video upload, player, and management functionality</p>
      </div>

      <div className="demo-controls">
        <div className="control-group">
          <label>Demo Mode:</label>
          <select 
            value={demoMode} 
            onChange={(e) => setDemoMode(e.target.value)}
            className="demo-select"
          >
            <option value="manager">Video Manager (Full)</option>
            <option value="upload">Video Upload Only</option>
            <option value="player">Video Player Only</option>
          </select>
        </div>

        <div className="control-group">
          <label>Trip ID:</label>
          <input
            type="number"
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(parseInt(e.target.value) || 1)}
            className="demo-input"
            min="1"
          />
        </div>
      </div>

      <div className="demo-content">
        {demoMode === 'manager' && (
          <div className="demo-section">
            <h2>Video Manager Component</h2>
            <p>This component combines upload and player functionality with tabs.</p>
            <VideoManager 
              tripId={selectedTripId}
              tripTitle="Demo Trip"
              showUpload={true}
              showPlayer={true}
            />
          </div>
        )}

        {demoMode === 'upload' && (
          <div className="demo-section">
            <h2>Video Upload Component</h2>
            <p>This component handles video upload, update, and deletion.</p>
            <VideoUpload 
              tripId={selectedTripId}
              onVideoUploaded={(video) => console.log('Video uploaded:', video)}
              onVideoDeleted={() => console.log('Video deleted')}
            />
          </div>
        )}

        {demoMode === 'player' && (
          <div className="demo-section">
            <h2>Video Player Component</h2>
            <p>This component provides a custom video player with controls.</p>
            <VideoPlayer 
              videoUrl={demoVideoUrl}
              title="Demo Video"
              showControls={true}
              autoPlay={false}
            />
          </div>
        )}
      </div>

      <div className="demo-info">
        <h3>API Endpoints Used:</h3>
        <ul>
          <li><strong>GET /api/videos/trip/{selectedTripId}</strong> - Get video by trip ID</li>
          <li><strong>GET /api/videos/{id}</strong> - Get video by ID</li>
          <li><strong>POST /api/videos/upload</strong> - Upload video for a trip</li>
          <li><strong>PUT /api/videos/{id}</strong> - Update video</li>
          <li><strong>DELETE /api/videos/{id}</strong> - Delete video by ID</li>
          <li><strong>DELETE /api/videos/trip/{tripId}</strong> - Delete video by trip ID</li>
        </ul>

        <h3>Features:</h3>
        <ul>
          <li>✅ Video upload with file validation (MP4, AVI, MOV, WMV, FLV, WEBM)</li>
          <li>✅ File size validation (max 100MB)</li>
          <li>✅ Video preview before upload</li>
          <li>✅ Custom video player with controls</li>
          <li>✅ Progress bar and time display</li>
          <li>✅ Volume control and mute</li>
          <li>✅ Fullscreen support</li>
          <li>✅ Responsive design</li>
          <li>✅ Error handling and loading states</li>
          <li>✅ Video metadata display</li>
        </ul>
      </div>
    </div>
  );
};

export default VideoDemo; 