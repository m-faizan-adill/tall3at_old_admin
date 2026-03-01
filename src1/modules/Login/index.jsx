import { FC } from 'react';
import LoginForm from './LoginForm';

const LoginScreen= () => {
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-400 to-cyan-500 relative overflow-hidden p-5">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-white rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900 rounded-full blur-3xl opacity-10"></div>
      </div>

      {/* Login Container */}
      <div className="w-full max-w-md relative z-10">
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-blue-900 border-opacity-10 animate-slideUp">
          {/* Card Header - Logo Section */}
          <div className="bg-white px-7 pt-10 pb-7 text-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='2' fill='%23ffffff'/%3E%3C/svg%3E")`,
              }}
            ></div>

            {/* Logo Section */}
            <div className="flex items-center justify-center gap-4 mb-4 relative z-10">
              <img
                src={process.env.PUBLIC_URL + '/assets/images/logo.png'}
                alt="طلعات"
                className="w-15 h-15 rounded-full object-cover"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-sm">
                طلعات
              </h1>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-7 py-10">
            {/* Form Header */}
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-cyan-500 mb-2">مرحباً بك</h2>
              <p className="text-gray-600 text-sm">يرجى تسجيل الدخول إلى حسابك</p>
            </div>

            {/* Login Form Component */}
            <LoginForm />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animate-spin-custom {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;