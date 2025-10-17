import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import { PrivateRoute, PublicRoute } from './utils/Routes';
import CustomerDetails from './components/Customers/CustomerDetails';
import ProviderDetails from './components/Providers/ProviderDetails';
import BannersDashboard from './components/Banners/BannersDashboard';
import NotificationsDashboard from './components/Notifications/NotificationsDashboard';
import NotificationHistoryDashboard from './components/Notifications/Notification-History/NotificationHistoryDashboard';
import SettingsDashboard from './components/Settings/SettingsDashboard';
import Transactions from './components/Transactions/Transactions';
import DeletedPackages from './components/DeletedPackage/DeletedPackage';
import "./services/notification";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <PublicRoute>
            <LoginScreen />
          </PublicRoute>
        } />
        <Route path="/login" element={
          <PublicRoute>
            <LoginScreen />
          </PublicRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="admin" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>

        }>
          <Route path="home" element={<Home />} />
          <Route path="providers" element={<ProvidersDashboard />} />
          <Route path="providers/:id" element={<ProviderDetails />} />
          <Route path="customers" element={<CustomersDashboard />} />
          <Route path="customers/:id" element={<CustomerDetails />} />
          <Route path="categories" element={<CategoriesDashboard />} />
          <Route path="banners" element={<BannersDashboard />} />
          <Route path="trips" element={<TripsDashboard />} />
          <Route path="videos" element={<VideosDashboard />} />
          <Route path="videos/upload/:tripId" element={<VideoUploadPage />} />
          <Route path="videos/add" element={<AddVideoPage />} />
          <Route path="bookings" element={<BookingsDashboard />} />
          <Route path="chats" element={<ChatPage />} />
          <Route path="notifications" element={<NotificationsDashboard />} />
          <Route path="notifications-history" element={<NotificationHistoryDashboard />} />
          <Route path="transactions" element={< Transactions />} />
          <Route path="deleted-package" element={<DeletedPackages />} />
          <Route path="settings" element={<SettingsDashboard />} />

        </Route>

      </Routes>
    </Router>
  );
}

export default App;
