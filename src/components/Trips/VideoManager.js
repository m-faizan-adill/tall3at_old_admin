import React, { useState, useEffect } from 'react';
import VideoUpload from './VideoUpload';
import VideoPlayer from './VideoPlayer';
import { videoApi } from '../../services/videoApi';
import './VideoManager.css';

const VideoManager = ({ tripId, tripTitle = 'Trip', showUpload = true, showPlayer = true }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('player'); // 'player' or 'upload'

  useEffect(() => {
    if (tripId) {
      loadVideo();
    }
  }, [tripId]);

  const loadVideo = async () => {
    try {
      setLoading(true);
      setError('');
      const videoData = await videoApi.getVideoByTripId(tripId);
      setVideo(videoData);
    } catch (error) {
      if (error.response?.status === 404) {
        setVideo(null);
      } else {
        setError('Failed to load video');
        console.error('Error loading video:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUploaded = (videoData) => {
    setVideo(videoData);
    setActiveTab('player');
  };

  const handleVideoDeleted = () => {
    setVideo(null);
    if (showUpload) {
      setActiveTab('upload');
    }
  };

  if (loading) {
    return (
      <div className="video-manager-container">
        <div className="video-manager-loading">
          <div className="spinner"></div>
          <p>Loading video manager...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-manager-container">
      <div className="video-manager-header">
        <h2 className="video-manager-title">Trip Video Manager</h2>
        {video && showUpload && showPlayer && (
          <div className="video-manager-tabs">
            <button
              className={`tab-btn ${activeTab === 'player' ? 'active' : ''}`}
              onClick={() => setActiveTab('player')}
            >
              📹 View Video
            </button>
            <button
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => setActiveTab('upload')}
            >
              ⬆️ Manage Video
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="video-manager-error">
          <p>{error}</p>
        </div>
      )}

      <div className="video-manager-content">
        {activeTab === 'player' && showPlayer && (
          <div className="video-player-section">
            <VideoPlayer
              videoUrl={video?.videoUrl}
              title={`${tripTitle} Video`}
              showControls={true}
              autoPlay={false}
            />
            {video && (
              <div className="video-metadata">
                <div className="metadata-item">
                  <strong>Uploaded:</strong> {new Date(video.createdAt).toLocaleDateString()}
                </div>
                {video.updatedAt && (
                  <div className="metadata-item">
                    <strong>Last Updated:</strong> {new Date(video.updatedAt).toLocaleDateString()}
                  </div>
                )}
                <div className="metadata-item">
                  <strong>Video ID:</strong> {video.id}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'upload' && showUpload && (
          <div className="video-upload-section">
            <VideoUpload
              tripId={tripId}
              onVideoUploaded={handleVideoUploaded}
              onVideoDeleted={handleVideoDeleted}
            />
          </div>
        )}

        {!video && !showUpload && (
          <div className="no-video-message">
            <div className="no-video-icon">📹</div>
            <h3>No Video Available</h3>
            <p>This trip doesn't have a video uploaded yet.</p>
          </div>
        )}

        {!video && !showPlayer && (
          <div className="no-video-message">
            <div className="no-video-icon">📹</div>
            <h3>No Video Available</h3>
            <p>This trip doesn't have a video uploaded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoManager; 