import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './components/SplashScreen';
import './App.css';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import Home from './components/Home';
import ProvidersDashboard from './components/Providers/ProvidersDashboard';
import CustomersDashboard from './components/Customers/CustomersDashboard';
import CategoriesDashboard from './components/Categories/CategoriesDashboard';
import TripsDashboard from './components/Trips/TripsDashboard';
import VideosDashboard from './components/Videos/VideosDashboard';
import VideoUploadPage from './components/Videos/VideoUploadPage';
import AddVideoPage from './components/Videos/AddVideoPage';
import BookingsDashboard from './components/Bookings/BookingsDashboard';
import ChatPage from './components/Conversations/ChatPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="admin" element={<Dashboard />}>
          <Route path="home" element={<Home />} />
          <Route path="providers" element={<ProvidersDashboard />} />
          <Route path="customers" element={<CustomersDashboard />} />
          <Route path="categories" element={<CategoriesDashboard />} />
          <Route path="trips" element={<TripsDashboard />} />
          <Route path="videos" element={<VideosDashboard />} />
          <Route path="videos/upload/:tripId" element={<VideoUploadPage />} />
          <Route path="videos/add" element={<AddVideoPage />} />
          <Route path="bookings" element={<BookingsDashboard />} />
          <Route path="chats" element={<ChatPage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
