import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ENDPOINTS,
    STORAGE_KEYS,
    ROLES,
} from '../../../app/config';

export const useLogin = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        userName: "",
        password: "",
        rememberMe: false,
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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


                testSignalRConnection();

                // Redirect based on user role
                switch (response.data.user.role) {
                    case ROLES.ADMIN:
                        navigate("/admin/home");
                        break;
                    case ROLES.STORE:
                        navigate("/store/home");
                        break;
                    case ROLES.CUSTOMER:
                        navigate("/customer/home");
                        break;
                    case ROLES.DRIVER:
                        navigate("/driver/home");
                        break;
                    default:
                        navigate("/");
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
    }

    return {
        formData,
        error,
        loading,
        showPassword,
        handleChange,
        handleSubmit,
        setShowPassword,
    };
}