import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userAPI } from '../apiConfig';

import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';

// step: 'email' | 'otp' | 'password'
const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep]               = useState('email');
  const [email, setEmail]             = useState('');
  const [otp, setOtp]                 = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [errors, setErrors]           = useState({});
  const [loading, setLoading]         = useState(false);

  const emailRegex = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;

  /* ── Step 1: Send OTP ── */
  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!email) { setErrors({ email: 'Email is required' }); return; }
    if (!emailRegex.test(email)) { setErrors({ email: 'Enter a valid email' }); return; }
    setErrors({});
    setLoading(true);
    try {
      await userAPI.forgotPassword(email);
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: Verify OTP ── */
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) { setErrors({ otp: 'Enter the 6-digit OTP' }); return; }
    setErrors({});
    setStep('password');
  };

  /* ── Step 3: Reset Password ── */
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!newPassword) errs.newPassword = 'Password is required';
    else if (newPassword.length < 6) errs.newPassword = 'Minimum 6 characters';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      await userAPI.resetPassword(email, otp, newPassword);
      toast.success('Password reset successful!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Try again.');
      // OTP may have been consumed — go back to OTP step
      setStep('otp');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const stepMeta = {
    email:    { title: 'Forgot Password',  subtitle: 'Enter your registered email to receive an OTP.' },
    otp:      { title: 'Verify OTP',       subtitle: `A 6-digit OTP was sent to ${email}.` },
    password: { title: 'Reset Password',   subtitle: 'Enter your new password below.' },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4 font-sans">
      <div className="w-full max-w-4xl flex rounded-3xl shadow-2xl overflow-hidden bg-white">

        {/* Left Panel */}
        <div className="hidden lg:flex flex-col justify-between w-2/5 p-10 relative overflow-hidden"
          style={{ background: 'linear-gradient(145deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}>
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
              Recover<br />Your<br />Account.
            </h2>
            <p className="text-emerald-200 text-sm leading-relaxed">
              We'll send a one-time password to your registered email to verify your identity.
            </p>
          </div>

          {/* Step indicators */}
          <div className="relative z-10 space-y-3">
            {[
              { key: 'email',    label: 'Enter Email',     icon: <EmailOutlinedIcon style={{ fontSize: 16 }} /> },
              { key: 'otp',      label: 'Verify OTP',      icon: <MarkEmailReadOutlinedIcon style={{ fontSize: 16 }} /> },
              { key: 'password', label: 'Reset Password',  icon: <LockResetOutlinedIcon style={{ fontSize: 16 }} /> },
            ].map(({ key, label, icon }, i) => {
              const steps = ['email', 'otp', 'password'];
              const done    = steps.indexOf(step) > i;
              const active  = step === key;
              return (
                <div key={key} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all
                  ${active ? 'bg-emerald-400 bg-opacity-20 border-emerald-400' : done ? 'border-emerald-700' : 'border-emerald-800 opacity-50'}`}>
                  <span className={`${active ? 'text-white' : done ? 'text-emerald-400' : 'text-emerald-600'}`}>{icon}</span>
                  <span className={`text-sm font-semibold ${active ? 'text-white' : done ? 'text-emerald-300' : 'text-emerald-600'}`}>{label}</span>
                  {done && <CheckCircleOutlineIcon style={{ fontSize: 16, color: '#34d399', marginLeft: 'auto' }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1 flex flex-col justify-center px-8 py-14 lg:px-14 bg-gray-50">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center">
              <AgricultureOutlinedIcon style={{ fontSize: 20, color: '#fff' }} />
            </div>
            <span className="text-emerald-800 font-bold text-lg">FarmConnect</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{stepMeta[step].title}</h1>
            <p className="text-gray-500 text-sm mt-1">{stepMeta[step].subtitle}</p>
          </div>

          {/* ── Step 1: Email ── */}
          {step === 'email' && (
            <form onSubmit={handleSendOTP} noValidate className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                    <EmailOutlinedIcon style={{ fontSize: 20 }} />
                  </span>
                  <input type="text" placeholder="Registered email address" value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors({}); }} disabled={loading}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all
                      focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                      ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`} />
                </div>
                {errors.email && <p className="mt-1 text-xs text-red-500 pl-1">{errors.email}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-lg
                  bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-600 hover:to-emerald-400
                  active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Sending...</> : 'Send OTP'}
              </button>

              <p className="text-center text-sm text-gray-500">
                Remember your password?{' '}
                <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-800 transition-colors">Login</Link>
              </p>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOTP} noValidate className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">OTP</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                    <MarkEmailReadOutlinedIcon style={{ fontSize: 20 }} />
                  </span>
                  <input type="text" placeholder="Enter 6-digit OTP" maxLength={6} value={otp}
                    onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setErrors({}); }}
                    className={`w-full pl-10 pr-4 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all tracking-widest font-bold
                      focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                      ${errors.otp ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`} />
                </div>
                {errors.otp && <p className="mt-1 text-xs text-red-500 pl-1">{errors.otp}</p>}
              </div>

              <button type="submit"
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-lg
                  bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-600 hover:to-emerald-400 active:scale-95">
                Verify OTP
              </button>

              <p className="text-center text-sm text-gray-500">
                Didn't receive it?{' '}
                <button type="button" onClick={() => { setStep('email'); setOtp(''); }}
                  className="text-emerald-600 font-semibold hover:text-emerald-800 transition-colors">
                  Resend OTP
                </button>
              </p>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === 'password' && (
            <form onSubmit={handleResetPassword} noValidate className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">New Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                    <LockOutlinedIcon style={{ fontSize: 20 }} />
                  </span>
                  <input type={showPassword ? 'text' : 'password'} placeholder="Min. 6 characters" value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setErrors({ ...errors, newPassword: '' }); }} disabled={loading}
                    className={`w-full pl-10 pr-11 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all
                      focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                      ${errors.newPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors">
                    {showPassword ? <VisibilityOffOutlinedIcon style={{ fontSize: 20 }} /> : <VisibilityOutlinedIcon style={{ fontSize: 20 }} />}
                  </button>
                </div>
                {errors.newPassword && <p className="mt-1 text-xs text-red-500 pl-1">{errors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600">
                    <LockResetOutlinedIcon style={{ fontSize: 20 }} />
                  </span>
                  <input type={showConfirm ? 'text' : 'password'} placeholder="Re-enter new password" value={confirmPassword}
                    onChange={(e) => { setConfirmPassword(e.target.value); setErrors({ ...errors, confirmPassword: '' }); }} disabled={loading}
                    className={`w-full pl-10 pr-11 py-3 bg-white border rounded-xl text-sm text-gray-800 placeholder-gray-400 outline-none transition-all
                      focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400
                      ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-200 hover:border-emerald-300'}`} />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-600 transition-colors">
                    {showConfirm ? <VisibilityOffOutlinedIcon style={{ fontSize: 20 }} /> : <VisibilityOutlinedIcon style={{ fontSize: 20 }} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="mt-1 text-xs text-red-500 pl-1">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide transition-all duration-300 shadow-lg
                  bg-gradient-to-r from-emerald-700 to-emerald-500 hover:from-emerald-600 hover:to-emerald-400
                  active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {loading ? <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Resetting...</> : 'Reset Password'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
