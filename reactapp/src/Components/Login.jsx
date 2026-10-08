import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { userAPI } from '../apiConfig';
import { setUserInfo } from '../userSlice';

// Material UI Icons
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      console.log('Attempting login...');
      const response = await userAPI.login(formData);
      console.log('Login response:', response);
      console.log('Response data:', response.data);

      if (response.data) {
        const { userId, userName, role, message, token } = response.data;
        console.log('Extracted values:', { userId, userName, role, message, token });

        if (message === 'Invalid credentials' || message === 'User not found') {
          console.log('Login failed:', message);
          toast.error(message);
          setLoading(false);
          return;
        }

        if (!userId || !userName || !role) {
          console.log('Missing required data:', { userId, userName, role });
          toast.error('Login failed. Please try again.');
          setLoading(false);
          return;
        }

        console.log('Login successful, dispatching to Redux...');
        dispatch(setUserInfo({ userId, userName, userRole: role }));
        console.log('Redux dispatched');
        console.log('Checking cookies...');
        console.log('Token cookie:', document.cookie.includes('token='));
        console.log('UserId cookie:', document.cookie.includes('userId='));
        console.log('UserRole cookie:', document.cookie.includes('userRole='));
        console.log('All cookies:', document.cookie);

        toast.success('Login successful!');
        console.log('Navigating to /home for role:', role);
        setTimeout(() => {
          console.log('Executing navigation...');
          navigate('/home', { replace: true });
        }, 100);
      } else {
        console.log('No response data received');
        toast.error('Login failed. No data received from server.');
      }
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 font-sans">

      {/* Card */}
      <div className="w-full max-w-4xl flex rounded-3xl shadow-2xl overflow-hidden bg-white">

        {/* ── Left Panel ── */}
        <div
          className="hidden lg:flex flex-col justify-between w-2/5 p-10 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10 bg-emerald-300" />
          <div className="absolute bottom-10 -right-20 w-72 h-72 rounded-full opacity-10 bg-teal-300" />
          <div className="absolute top-1/2 -right-10 w-40 h-40 rounded-full opacity-10 bg-green-400" />

          {/* Logo */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-11 h-11 rounded-2xl bg-emerald-400 flex items-center justify-center shadow-lg">
                <AgricultureOutlinedIcon style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <span className="text-white font-bold text-xl tracking-wide">FarmConnect</span>
            </div>

            <h2 className="text-white text-4xl font-extrabold leading-tight mb-5">
              Welcome<br />Back.
            </h2>
            <p className="text-emerald-200 text-sm leading-relaxed">
              Sign in to manage your livestock feed network and connect with trusted suppliers.
            </p>
          </div>

          {/* Bottom cards */}
          <div className="relative z-10 space-y-3">
            <div className="rounded-2xl border border-emerald-600 bg-emerald-900 bg-opacity-40 p-5 backdrop-blur-sm">
              <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-1">Institutional Grade</p>
              <p className="text-white text-sm">Trusted by global agricultural cooperatives.</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-1 rounded-2xl border border-emerald-700 bg-emerald-900 bg-opacity-30 p-4 text-center">
                <p className="text-white font-bold text-xl">12K+</p>
                <p className="text-emerald-300 text-xs mt-1">Active Users</p>
              </div>
              <div className="flex-1 rounded-2xl border border-emerald-700 bg-emerald-900 bg-opacity-30 p-4 text-center">
                <p className="text-white font-bold text-xl">98%</p>
                <p className="text-emerald-300 text-xs mt-1">Satisfaction</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right Panel ── */}
        <div className="flex-1 flex flex-col justify-center px-8 py-14 lg:px-14 bg-gray-50">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <AgricultureOutlinedIcon style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <span className="text-emerald-800 font-bold text-lg">FarmConnect</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Login</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                  <EmailOutlinedIcon style={{ fontSize: 20 }} />
                </span>
                <input
                  type="text"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200
                    focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                    ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-500 pl-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                  <LockOutlinedIcon style={{ fontSize: 20 }} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`w-full pl-10 pr-11 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200
                    focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                    ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                  {showPassword
                    ? <VisibilityOffOutlinedIcon style={{ fontSize: 20 }} />
                    : <VisibilityOutlinedIcon style={{ fontSize: 20 }} />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500 pl-1">{errors.password}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-lg
                bg-gradient-to-r from-emerald-700 to-emerald-500
                hover:from-emerald-600 hover:to-emerald-400 hover:shadow-emerald-200 hover:shadow-xl
                active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Logging in...
                </span>
              ) : 'Login'}
            </button>

            {/* Signup link */}
            <p className="text-center text-sm text-gray-500 pt-1">
              Don't have an account?{' '}
              <Link to="/signup" className="text-emerald-600 font-semibold hover:text-emerald-800 transition-colors">
                Signup
              </Link>
            </p>
            <p className="text-center text-sm text-gray-500">
              <Link to="/forgot-password" className="text-emerald-600 font-semibold hover:text-emerald-800 transition-colors">
                Forgot Password?
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;