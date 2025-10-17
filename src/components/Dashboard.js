import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import '../styles/Dashboard.css';
import { useState, useEffect } from 'react';
import { STORAGE_KEYS } from '../constants/config';
import { API_CONFIG } from '../constants/config';
import { faPlane } from '@fortawesome/free-solid-svg-icons';

const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_CONFIG.BASE_URL}/images/${imagePath}`;
};

const MenuItem = ({ title, to, onClick, isSubItem = false }) => {
    return (
        <NavLink
            to={to}
            onClick={onClick}
            className={({ isActive }) => 
                `flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    isSubItem ? 'ml-6 text-sm' : 'text-base'
                } ${
                    isActive 
                        ? 'bg-white text-primary font-medium' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
            }
        >
            <span className="menu-icon">
                {isSubItem ? <i className={`fas fa-${title.toLowerCase()}`}></i> : null}
            </span>
            <span>{title}</span>
        </NavLink>
    );
};

const SubMenu = ({ title, icon, items, isOpen, onToggle }) => {
    return (
        <div className="mb-2">
            <button 
                onClick={onToggle}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors duration-200 ${
                    isOpen 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
            >
                <div className="flex items-center">
                    <i className={`${icon} w-5 h-5 mr-3`}></i>
                    <span>{title}</span>
                </div>
                <i className={`fas fa-chevron-${isOpen ? 'down' : 'right'} text-xs`}></i>
            </button>
            {isOpen && (
                <div className="mt-1">
                    {items.map((item, index) => (
                        <MenuItem 
                            key={index} 
                            title={item.title} 
                            to={item.path} 
                            isSubItem={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const Header = ({ onMenuClick, isMobileMenuOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [pageTitle, setPageTitle] = useState('');
    const [userData, setUserData] = useState(null);
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

    useEffect(() => {
        const userDataStr = localStorage.getItem(STORAGE_KEYS.USER);
        if (userDataStr) {
            setUserData(JSON.parse(userDataStr));
        }

        // Generate breadcrumb path
        const pathSegments = location.pathname.split('/').filter(Boolean);
        const title = pathSegments[pathSegments.length - 1];
        setPageTitle(title.charAt(0).toUpperCase() + title.slice(1));
    }, [location]);

    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        navigate('/login');
    };

    return (
        <div className="dashboard-header">
            <div className="header-left">
                <button 
                    onClick={onMenuClick}
                    className="menu-toggle-btn"
                >
                    <i className={`fas fa-${isMobileMenuOpen ? 'times' : 'bars'}`}></i>
                </button>
                
                <div className="breadcrumb">
                    <span className="text-gray-500">Admin</span>
                    <i className="fas fa-chevron-right text-gray-400 mx-2"></i>
                    <span className="font-medium text-gray-900">{pageTitle}</span>
                </div>
            </div>

            <div className="header-right">
                <div className="search-bar">
                    <i className="fas fa-search text-gray-400"></i>
                    <input
                        type="text"
                        placeholder="Search..."
                        className="search-input"
                    />
                </div>

                <div className="notifications">
                    <button className="notification-btn">
                        <i className="fas fa-bell"></i>
                        <span className="notification-badge">3</span>
                    </button>
                </div>

                <div className="profile-dropdown">
                    <button
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="profile-btn"
                    >
                        <div className="profile-avatar">
                            {userData?.userName?.charAt(0) || 'U'}
                        </div>
                        <div className="profile-info">
                            <p className="profile-name">{userData?.userName || 'User'}</p>
                            <p className="profile-role">{userData?.role || 'Admin'}</p>
                        </div>
                        <i className="fas fa-chevron-down text-gray-400"></i>
                    </button>

                    {isProfileDropdownOpen && (
                        <div className="profile-menu">
                            <button
                                onClick={() => navigate('/admin/profile')}
                                className="profile-menu-item"
                            >
                                <i className="fas fa-user mr-3"></i>
                                Profile
                            </button>
                            <button
                                onClick={() => navigate('/admin/settings')}
                                className="profile-menu-item"
                            >
                                <i className="fas fa-cog mr-3"></i>
                                Settings
                            </button>
                            <div className="profile-menu-divider"></div>
                            <button
                                onClick={handleLogout}
                                className="profile-menu-item text-red-600 hover:bg-red-50"
                            >
                                <i className="fas fa-sign-out-alt mr-3"></i>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default function Dashboard() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [openSubMenus, setOpenSubMenus] = useState({
        systemConfig: false,
        users: false,
        products: false,
        orders: false,
        reports: false
    });

    const toggleSubMenu = (menu) => {
        setOpenSubMenus(prev => ({
            ...prev,
            [menu]: !prev[menu]
        }));
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className="dashboard-sidebar">
                <div className="sidebar-header">
                    <img src="/assets/images/logo.png" alt="طلعات" className="logo" />
                    <h2>طلعات</h2>
                </div>
                <ul className="sidebar-links">
                    <li>
                        <NavLink to="/admin/home" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-home"></span>الرئيسية
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/providers" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-briefcase"></span>مزودي الخدمات
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/customers" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-user-friends"></span>العملاء
                        </NavLink>
                    </li>
                  
                    <li>
                        <NavLink to="/admin/trips" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-route"></span>الطلعات
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/videos" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-video"></span>فيديوهات الطلعات
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/categories" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-th-large"></span>الفئات
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/bookings" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-calendar-check"></span>الحجوزات
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/chats" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-comments"></span>المحادثات
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/notifications" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-bell"></span>الاشعارات
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/transactions" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-money-check-alt"></span>المعاملات المالية
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/reports" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-chart-bar"></span>التقارير
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/profile" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-user"></span>الملف الشخصي
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-cog"></span>الإعدادات
                        </NavLink>
                    </li>
                    <li>
                        <button className="logout-link" onClick={handleLogout}>
                            <span className="fa fa-sign-out-alt"></span>تسجيل الخروج
                    </button>
                    </li>
                </ul>
            </aside>
            {/* Main Content */}
            <div className="dashboard-main">
                <div className="dashboard-header minimal-header">
                    <div className="header-title">
                        طلعات لوحة التحكم والادارة
                    </div>
                    <div className="header-actions">
                        <button className="header-icon-btn"><span className="fa fa-bell"></span></button>
                        <button className="header-icon-btn"><span className="fa fa-comments"></span></button>
                        <div className="header-avatar">
                            <img src="/assets/images/logo.png" alt="Avatar" />
                            <span className="header-username">أحمد</span>
                        </div>
                    </div>
                </div>
                <div className="dashboard-content">
                    <Outlet />
                </div>
            </div>
            {/* Mobile menu overlay */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-menu-overlay"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}