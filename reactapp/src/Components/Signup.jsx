import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAPI } from '../apiConfig';

// Material UI Icons
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneAndroidOutlinedIcon from '@mui/icons-material/PhoneAndroidOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const InputField = ({ icon: Icon, error, children, ...props }) => (
  <div className="relative">
    <div className="relative flex items-center">
      <span className="absolute left-3 z-10 text-emerald-600">
        <Icon style={{ fontSize: 20 }} />
      </span>
      {children || (
        <input
          {...props}
          className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200
            focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
            ${error ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`}
        />
      )}
    </div>
    {error && (
      <p className="mt-1 text-xs text-red-500 pl-1 flex items-center gap-1">
        <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
        {error}
      </p>
    )}
  </div>
);

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    role: '',
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/;
  const mobileRegex = /^[0-9]{10}$/;

  const validate = () => {
    const newErrors = {};
    if (!formData.userName.trim()) newErrors.userName = 'User Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!emailRegex.test(formData.email)) newErrors.email = 'Please enter a valid email';
    if (!formData.mobile) newErrors.mobile = 'Mobile Number is required';
    else if (!mobileRegex.test(formData.mobile)) newErrors.mobile = 'Mobile number must be 10 digits';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm Password is required';
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.role) newErrors.role = 'Role is required';
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
      const { confirmPassword, ...signupData } = formData;
      const response = await userAPI.signup(signupData);
      if (response.data) {
        setShowModal(true);
        toast.success('Signup successful!');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Signup failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 font-sans">

     
      <div className="w-full max-w-5xl flex rounded-3xl shadow-2xl overflow-hidden bg-white">

      
        <div
          className="hidden lg:flex flex-col justify-between w-2/5 p-10 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}
        >
         
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10 bg-emerald-300" />
          <div className="absolute bottom-10 -right-20 w-72 h-72 rounded-full opacity-10 bg-teal-300" />
          <div className="absolute top-1/2 -right-10 w-40 h-40 rounded-full opacity-10 bg-green-400" />

          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-11 h-11 rounded-2xl bg-emerald-400 flex items-center justify-center shadow-lg">
                <AgricultureOutlinedIcon style={{ fontSize: 24, color: '#fff' }} />
              </div>
              <span className="text-white font-bold text-xl tracking-wide">FarmConnect</span>
            </div>

            <h2 className="text-white text-4xl font-extrabold leading-tight mb-5">
              Nurture<br />Your<br />Network.
            </h2>
            <p className="text-emerald-200 text-sm leading-relaxed">
              The definitive trade ecosystem for modern feed suppliers and livestock owners.
            </p>
          </div>

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

    
        <div className="flex-1 flex flex-col justify-center px-8 py-10 lg:px-12 bg-gray-50">

         
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <AgricultureOutlinedIcon style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <span className="text-emerald-800 font-bold text-lg">FarmConnect</span>
          </div>

          <div className="mb-7">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h1>
            <p className="text-gray-500 text-sm mt-1">Scale your trade reach by joining today.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">

           
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">User Name</label>
                <InputField icon={PersonOutlineIcon} >
                  <input
                    type="text"
                    name="userName"
                    placeholder="Full Name"
                    value={formData.userName}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 ${errors.userName ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`}
                  />
                </InputField>
                {errors.userName && <p className="mt-1 text-xs text-red-500 pl-1">{errors.userName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <InputField icon={EmailOutlinedIcon} >
                  <input
                    type="text"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`}
                  />
                </InputField>
                {errors.email && <p className="mt-1 text-xs text-red-500 pl-1">{errors.email}</p>}
              </div>
            </div>

            {/* Row 2 — Mobile & Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Mobile Number</label>
                <InputField icon={PhoneAndroidOutlinedIcon} >
                  <input
                    type="text"
                    name="mobile"
                    placeholder="10-digit number"
                    value={formData.mobile}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 ${errors.mobile ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`}
                  />
                </InputField>
                {errors.mobile && <p className="mt-1 text-xs text-red-500 pl-1">{errors.mobile}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Role</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 z-10 text-emerald-600">
                    <BadgeOutlinedIcon style={{ fontSize: 20 }} />
                  </span>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-8 py-3 bg-white border rounded-xl text-sm outline-none appearance-none transition-all duration-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 cursor-pointer
                      ${formData.role ? 'text-gray-800' : 'text-gray-400'}
                      ${errors.role ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`}
                  >
                    <option value="">Select Role</option>
                    <option value="Owner">Owner</option>
                    <option value="Supplier">Supplier</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <KeyboardArrowDownIcon style={{ fontSize: 18 }} />
                  </span>
                </div>
                {errors.role && <p className="mt-1 text-xs text-red-500 pl-1">{errors.role}</p>}
              </div>
            </div>

            {/* Row 3 — Password & Confirm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Password</label>
                <InputField icon={LockOutlinedIcon}>
                  <input
                    type="password"
                    name="password"
                    placeholder="Min. 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`}
                  />
                </InputField>
                {errors.password && <p className="mt-1 text-xs text-red-500 pl-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <InputField icon={LockResetOutlinedIcon}>
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Re-enter password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all duration-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`}
                  />
                </InputField>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 pl-1">{errors.confirmPassword}</p>}
              </div>
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
                  Submitting...
                </span>
              ) : 'Create Account'}
            </button>

            {/* Login link */}
            <p className="text-center text-sm text-gray-500 pt-1">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-800 transition-colors">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* ── Success Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm"
          onClick={handleModalClose}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 text-center relative animate-[fadeInScale_0.25s_ease]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <CloseIcon style={{ fontSize: 20 }} />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircleOutlineIcon style={{ fontSize: 36, color: '#059669' }} />
            </div>
            <h3 className="text-xl font-extrabold text-gray-900 mb-2">Registration Successful!</h3>
            <p className="text-gray-500 text-sm mb-6">Your account has been created. You can now login to FarmConnect.</p>
            <button
              onClick={handleModalClose}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-500 text-white font-bold text-sm tracking-wide hover:opacity-90 transition-opacity shadow-lg"
            >
              Continue to Login
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Signup;