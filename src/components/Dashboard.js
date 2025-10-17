import { NavLink, Outlet, useNavigate } from "react-router-dom";
import '../styles/Dashboard.css';
import { useState, useEffect, useRef } from 'react';
import { STORAGE_KEYS } from '../constants/config';
import { API_CONFIG } from '../constants/config';
import { startConnection, stopConnection, subscribeToNotifications } from "../services/notification";
import api from "../services/api";
import ThemeSwitcher from "../theme/ThemeSwitcher";
import '../styles/DashboardAnimation.css'

export default function Dashboard() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    useEffect(() => {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN) || localStorage.getItem('token');
        console.log("Starting SignalR connection with token:", token);
        if (!token) {
            console.error("No token found for SignalR connection");
            return;
        }
        startConnection(token)
            .then(() => {
                console.log("SignalR connected.");
                subscribeToNotifications((notification) => {
                    setNotifications((prev) => {
                        const merged = [notification, ...prev];


                        console.log("New notification received:", notification);
                        return dedupeNotifications(merged)

                    });
                });
            })
            .catch(err => console.error("Connection failed:", err));

        return () => stopConnection();
    }, []);

    useEffect(() => {
        if (open) {
            const fetchHistory = async () => {
                try {
                    const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/recent-notifications`, {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("token")}`,
                        },
                    });
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    const data = await res.json();
                    setNotifications((prev) => dedupeNotifications([...data, ...prev]).slice(0, 20));

                } catch (err) {
                    console.error("Failed to load notifications:", err);
                }
            };

            fetchHistory();
        }
    }, [open]);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
        navigate('/login');
    };

    const dedupeNotifications = (list) => {
        const seen = new Set();
        return list.filter((n) => {
            const key = n.id || `${n.title}-${n.body}-${n.createdAt}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });
    };

    const markNotificationRead = async (id, isRead) => {
        try {
            const res = await api.patch(`/api/admin/my-notifications/${id}/status`, isRead, {
                headers: {
                    "Content-Type": "application/json",
                },
            });

            console.log("mark as read:", res.data);
            return res.data;
        } catch (err) {
            console.error("Failed to mark notification:", err);
            return null;
        }
    };


    const handleNotificationClick = (notification) => {
        console.log("notification: ƒ", notification)
        switch (notification.model) {
            case "provider":
                navigate(`/admin/providers`);
                // navigate("/admin/providers", {
                //     view: "details",
                //     providerId: notification.model === "provider" ? notification.userId : null,
                //     tripId: notification.model === "trip" ? notification.modelId : null,
                // })
                break;
            case "user":
                navigate(`/admin/customers`);
                break;
            case "trip":
                navigate(`/admin/trips`);
                // navigate("/admin/trips", {
                //     view: "details",
                //     providerId: notification.model === "trip" ? notification.modelId : null,
                //     tripId: notification.model === "trip" ? notification.modelId : null,
                // })
                break;
            case "booking":
                navigate(`/admin/bookings`);
                break;
            case "package":
                navigate(`/admin/deleted-package`);
                break;
            default:
                navigate("/admin/notifications");
        }
    };

    useEffect(() => {
        const fetchInitialNotifications = async () => {
            try {
                const res = await fetch(`${API_CONFIG.BASE_URL}/api/admin/recent-notifications`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();

                setNotifications((prev) => dedupeNotifications([...data, ...prev]).slice(0, 20));
            } catch (err) {
                console.error("Failed to load initial notifications:", err);
            }
        };

        fetchInitialNotifications();
    }, []); // ✅ inside Dashboard



    return (
        <div className="dashboard-container">
            {/* Sidebar */}
            <aside className={`dashboard-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>

                <div className="sidebar-header">
                    <img src="/assets/images/logo.png" alt="طلعات" className="logo" />
                    <h2>طلعات</h2>
                    <ThemeSwitcher />
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
                        <NavLink to="/admin/banners" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-image"></span>البانرات
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
                        <NavLink to="/admin/notifications-history" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-history"></span>سجل الإشعارات
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/transactions" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-money-check-alt"></span>المعاملات المالية
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to="/admin/deleted-package" className={({ isActive }) => isActive ? 'active' : ''}>
                            <span className="fa fa-trash"></span> الحزمة المحذوفة
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
                    <button className="menu-toggle-btn" onClick={toggleMobileMenu}>
                        <i className="fa fa-bars"></i>
                    </button>
                    <div className="header-title">
                        طلعات لوحة التحكم والادارة
                    </div>
                    <div className="header-actions">

                        <div className="notifications" ref={dropdownRef}
                        >
                            <button className="notification-btn"
                                onClick={() => setOpen((prev) => !prev)}
                            >
                                <i className="fas fa-bell"></i>
                                <span className="notification-badge">
                                    {notifications.filter(n => !n.isRead).length}
                                </span>

                            </button>

                            {open && (
                                <div className="notification-dropdown">
                                    <div className="notification-dropdown-header">
                                        <h3>Notifications</h3>
                                        <button onClick={() => setNotifications([])}>Clear all</button>
                                    </div>
                                    <div className="notification-list">
                                        {notifications.length === 0 ? (
                                            <p className="p-4 text-center text-sm text-gray-500">No notifications</p>
                                        ) : (
                                            notifications.map((n) => (
                                                <div key={n.id} className={`notification-item ${n.isRead ? "read" : "unread"}`}
                                                    onClick={async () => {
                                                        const result = await markNotificationRead(n.id, true);
                                                        if (result) {
                                                            setNotifications((prev) =>
                                                                prev.map((notif) =>
                                                                    notif.id === n.id ? { ...notif, isRead: true } : notif
                                                                )
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <div className="notification-avatar">
                                                        {n.image ? <img src={n.image} alt="" /> : <i className="fas fa-bell"></i>}
                                                    </div>
                                                    <div className="notification-content">
                                                        <p className="notification-title">{n.title}</p>
                                                        <p className="notification-body">{n.body}</p>
                                                        <p className="notification-time">{new Date(n.createdAt).toLocaleString()}</p>
                                                        <button
                                                            className="view-btn"
                                                            onClick={() => {
                                                                handleNotificationClick(n);
                                                                setOpen(false); // ✅ close the dropdown after click
                                                            }}
                                                        >
                                                            View
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* </span></button> */}
                        {/* <button className="header-icon-btn" title="المحادثات"><span className="fa fa-comments"></span></button> */}
                        <div className="header-avatar">
                            <img src="/assets/images/logo.png" alt="Avatar" />
                            <span className="header-username">احسن</span>
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