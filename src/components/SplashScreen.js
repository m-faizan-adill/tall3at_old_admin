import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SplashScreen.css';

const SplashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Navigate to login screen after animation completes
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000); // 3 seconds to match animation duration

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <img 
          src="../assets/images/logo.png" 
          alt="Legend Techo Logo" 
          className="splash-logo"
        />
        <h1 className="splash-title animated-text">Legend Techo</h1>
        <p className="splash-tagline">Healthcare Information System</p>
        <div className="splash-loader">
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen; 