import React, { useState, useEffect } from 'react';
import { videoApi } from '../../services/videoApi';
import './VideoUpload.css';

const VideoUpload = ({ tripId, onVideoUploaded, onVideoDeleted }) => {
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

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

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        setError('Invalid video format. Please select MP4, AVI, MOV, WMV, FLV, or WEBM file.');
        return;
      }

      // Validate file size (100MB)
      if (file.size > 100 * 1024 * 1024) {
        setError('Video file size must be less than 100MB.');
        return;
      }

      setSelectedFile(file);
      setError('');
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a video file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const videoData = await videoApi.uploadVideo(tripId, selectedFile);
      setVideo(videoData);
      setSelectedFile(null);
      setPreviewUrl('');
      
      if (onVideoUploaded) {
        onVideoUploaded(videoData);
      }
    } catch (error) {
      setError(error.response?.data || 'Failed to upload video');
      console.error('Error uploading video:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedFile) {
      setError('Please select a new video file');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const videoData = await videoApi.updateVideo(video.id, selectedFile);
      setVideo(videoData);
      setSelectedFile(null);
      setPreviewUrl('');
      
      if (onVideoUploaded) {
        onVideoUploaded(videoData);
      }
    } catch (error) {
      setError(error.response?.data || 'Failed to update video');
      console.error('Error updating video:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!video) return;

    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await videoApi.deleteVideoByTripId(tripId);
      setVideo(null);
      
      if (onVideoDeleted) {
        onVideoDeleted();
      }
    } catch (error) {
      setError(error.response?.data || 'Failed to delete video');
      console.error('Error deleting video:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="video-upload-container">
        <div className="video-upload-loading">
          <div className="spinner"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-upload-container">
      <h3 className="video-upload-title">Trip Video</h3>
      
      {error && (
        <div className="video-upload-error">
          <p>{error}</p>
        </div>
      )}

      {video ? (
        <div className="video-display">
          <div className="video-player">
            <video controls width="100%">
              <source src={video.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="video-info">
            <p><strong>Uploaded:</strong> {new Date(video.createdAt).toLocaleDateString()}</p>
            {video.updatedAt && (
              <p><strong>Updated:</strong> {new Date(video.updatedAt).toLocaleDateString()}</p>
            )}
          </div>

          <div className="video-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => document.getElementById('video-file-input').click()}
              disabled={uploading}
            >
              Replace Video
            </button>
            <button 
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={uploading}
            >
              Delete Video
            </button>
          </div>
        </div>
      ) : (
        <div className="video-upload-area">
          <div className="upload-placeholder">
            <i className="upload-icon">📹</i>
            <p>No video uploaded for this trip</p>
            <p className="upload-hint">Click below to upload a video</p>
          </div>
        </div>
      )}

      <input
        id="video-file-input"
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {selectedFile && (
        <div className="file-preview">
          <h4>Selected File:</h4>
          <div className="file-info">
            <p><strong>Name:</strong> {selectedFile.name}</p>
            <p><strong>Size:</strong> {formatFileSize(selectedFile.size)}</p>
            <p><strong>Type:</strong> {selectedFile.type}</p>
          </div>
          
          {previewUrl && (
            <div className="video-preview">
              <video controls width="100%" style={{ maxHeight: '200px' }}>
                <source src={previewUrl} type={selectedFile.type} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          <div className="upload-actions">
            {video ? (
              <button 
                className="btn btn-primary"
                onClick={handleUpdate}
                disabled={uploading}
              >
                {uploading ? 'Updating...' : 'Update Video'}
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={handleUpload}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Upload Video'}
              </button>
            )}
            <button 
              className="btn btn-secondary"
              onClick={() => {
                setSelectedFile(null);
                setPreviewUrl('');
              }}
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!video && !selectedFile && (
        <div className="upload-trigger">
          <button 
            className="btn btn-primary"
            onClick={() => document.getElementById('video-file-input').click()}
          >
            Upload Video
          </button>
        </div>
      )}
    </div>
  );
};

export default VideoUpload; 