import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginScreen.css';
import api from '../services/api';
import { ENDPOINTS, STORAGE_KEYS, ROLES } from '../constants/config';

const LoginScreen = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    password: '',
    rememberMe: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create form data object
      const formDataObj = new FormData();
      formDataObj.append('userName', formData.userName);
      formDataObj.append('password', formData.password);

      // Log the form data for debugging
      console.log('Sending form data:', {
        userName: formData.userName,
        password: formData.password
      });

      // Make the API call
      const response = await api.post(ENDPOINTS.ADMIN_LOGIN, formDataObj, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      console.log('API Response:', response.data);

      if (response.data && response.data.status !== false) {
        // Store user data and token
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.data.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.data.user));
        localStorage.setItem(STORAGE_KEYS.USER_ROLE, response.data.user.role);

        // Redirect based on user role
        if (response.data.user.role === ROLES.ADMIN) {
          navigate('/admin/home');
        } else if (response.data.user.role === ROLES.STORE) {
          navigate('/store/home');
        } else if (response.data.user.role === ROLES.CUSTOMER) {
          navigate('/customer/home');
        } else if (response.data.user.role === ROLES.DRIVER) {
          navigate('/driver/home');
        }
      } else {
        setError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.status === 401 
        ? 'اسم المستخدم أو كلمة المرور غير صحيحة' 
        : 'حدث خطأ. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="background-pattern"></div>
      <div className="login-container">
        <div className="login-card">
        <div className="logo-section">
              <div className="logo-icon">
                <img src={process.env.PUBLIC_URL + '/assets/images/logo.png'} alt="طلعات" className="logo-avatar" />
              </div>
              <h1 className="brand-name">طلعات</h1>
            </div>
          
          <div className="card-body">
            <div className="form-header">
              <h2>مرحباً بك</h2>
              <p>يرجى تسجيل الدخول إلى حسابك</p>
            </div>
            
            {error && (
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <div className="input-wrapper">
                  <i className="input-icon fas fa-user"></i>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="اسم المستخدم"
                    required
                    className="form-input"
                    dir="rtl"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <div className="input-wrapper">
                  <i className="input-icon fas fa-lock"></i>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="كلمة المرور"
                    required
                    className="form-input"
                    dir="rtl"
                  />
                </div>
              </div>
              
              <div className="form-options">
                <label className="remember-me">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                  />
                  <span>تذكرني</span>
                </label>
              </div>
              
              <button 
                type="submit" 
                className={`login-button ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>جاري تسجيل الدخول...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <i className="fas fa-sign-in-alt"></i>
                  </>
                )}
              </button>
            </form>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen; 