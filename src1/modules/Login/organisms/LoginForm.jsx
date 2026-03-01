import { useState } from "react";
import Input from "../atoms/Input";
import Button from "../atoms/Button";

const LoginForm = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        rememberMe: false
    });
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username Input */}
            <div>
                <Input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleChange}
                    placeholder="اسم المستخدم"
                    icon="fas fa-user"
                    required
                />
            </div>

            {/* Password Input */}
            <div>
                <Input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="كلمة المرور"
                    icon="fas fa-lock"
                    required
                />
                <button
                    type="button"
                    className="text-cyan-500 hover:text-cyan-600 text-right mt-2 flex items-center gap-2 cursor-pointer transition-colors"
                    aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => setShowPassword((s) => !s)}
                >
                    <i className={showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'}></i>
                    <span className="text-xs font-medium whitespace-nowrap">
                        {showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    </span>
                </button>
            </div>

            {/* Form Options */}
            <div className="flex justify-between items-center flex-wrap gap-2">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-cyan-500 select-none">
                    <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="w-4 h-4 accent-cyan-500 cursor-pointer"
                    />
                    <span>تذكرني</span>
                </label>
            </div>

            {/* Submit Button */}
            <Button loading={loading} />
        </form>
    );
};

export default LoginForm;
