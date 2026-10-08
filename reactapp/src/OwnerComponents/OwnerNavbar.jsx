import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUserInfo } from '../userSlice';
import { toast } from 'react-toastify';
import { userAPI } from '../apiConfig';

// Material UI Icons
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PetsIcon from '@mui/icons-material/Pets';
import GrassIcon from '@mui/icons-material/Grass';
import MedicationIcon from '@mui/icons-material/Medication';
import AssignmentIcon from '@mui/icons-material/Assignment';
import FeedbackIcon from '@mui/icons-material/Feedback';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

const OwnerNavbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { userName } = useSelector((state) => state.user);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showLivestockDropdown, setShowLivestockDropdown] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const livestockDropdownRef = useRef(null);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const displayName = userName || getCookie('userName') || 'User';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (livestockDropdownRef.current && !livestockDropdownRef.current.contains(event.target)) {
        setShowLivestockDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await userAPI.logout();
      dispatch(clearUserInfo());
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      dispatch(clearUserInfo());
      toast.success('Logged out successfully');
      navigate('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinks = [
    { to: '/home', label: 'Home', icon: <HomeIcon fontSize="small" /> },
    { to: '/owner/view-feeds', label: 'Feed', icon: <GrassIcon fontSize="small" /> },
    { to: '/owner/view-medicines', label: 'Medicine', icon: <MedicationIcon fontSize="small" /> },
    { to: '/owner/my-requests', label: 'My Request', icon: <AssignmentIcon fontSize="small" /> },
    { to: '/owner/feedback', label: 'Feedback', icon: <FeedbackIcon fontSize="small" /> },
  ];

  return (
    <>
      {/* ── Navbar ── */}
      <nav
        className="w-full sticky top-0 z-50 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #0d4a2e 0%, #1a6b40 40%, #0f5233 70%, #0a3d26 100%)',
        }}
      >
        {/* subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.03) 10px, rgba(255,255,255,0.03) 20px)',
          }}
        />

        <div className="relative w-full px-3 sm:px-4 lg:px-5">
          <div className="flex items-center justify-between h-16">

            {/* ── Brand ── */}
            <Link to="/home" className="flex items-center gap-2 group no-underline mr-6">

              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #34d970, #1a9e4a)' }}
              >
                <AgricultureIcon style={{ color: '#fff', fontSize: 20 }} />
              </div>
              <span
                className="text-white font-bold text-lg tracking-wide"
                style={{ fontFamily: "'Nunito', sans-serif", letterSpacing: '0.03em' }}
              >
                FarmConnect
              </span>
            </Link>

            {/* ── Desktop Menu ── */}
            <div className="hidden md:flex items-center gap-2 ml-auto">

              {/* User badge */}
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 whitespace-nowrap shrink-0"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <PersonIcon style={{ color: '#86efac', fontSize: 16 }} />

                <span className="text-white/90 text-sm font-semibold">
                  {displayName}
                </span>

                <span className="text-green-300 text-xs font-medium">
                  / Owner
                </span>
              </div>

              {/* Home */}
              <NavLink to="/home" icon={<HomeIcon fontSize="small" />} label="Home" />

              <NavLink to="/owner/dashboard" icon={<DashboardIcon fontSize="small" />} label="Dashboard" />

              {/* Livestock Dropdown */}
              <div className="relative" ref={livestockDropdownRef}>
                <button
                  onClick={() => setShowLivestockDropdown(!showLivestockDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/85 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium cursor-pointer border-none bg-transparent whitespace-nowrap"
                >
                  <PetsIcon fontSize="small" />
                  <span>Livestock</span>
                  {showLivestockDropdown
                    ? <KeyboardArrowUpIcon fontSize="small" />
                    : <KeyboardArrowDownIcon fontSize="small" />}
                </button>

                {showLivestockDropdown && (
                  <div
                    className="absolute top-full left-0 mt-2 w-44 rounded-xl shadow-2xl overflow-hidden z-50 border border-white/10"
                    style={{ background: 'linear-gradient(160deg, #0f5233, #0d4a2e)' }}
                  >
                    <Link
                      to="/owner/add-livestock"
                      onClick={() => setShowLivestockDropdown(false)}
                      className="flex items-center gap-2 px-4 py-3 text-white/85 hover:bg-white/10 hover:text-white text-sm transition-colors no-underline border-b border-white/10"
                    >
                      <AddCircleOutlineIcon fontSize="small" style={{ color: '#86efac' }} />
                      Add Livestock
                    </Link>
                    <Link
                      to="/owner/view-livestock"
                      onClick={() => setShowLivestockDropdown(false)}
                      className="flex items-center gap-2 px-4 py-3 text-white/85 hover:bg-white/10 hover:text-white text-sm transition-colors no-underline"
                    >
                      <FormatListBulletedIcon fontSize="small" style={{ color: '#86efac' }} />
                      View Livestock
                    </Link>
                  </div>
                )}
              </div>

              {/* Other Nav Links */}
              {navLinks.slice(1).map((link) => (
                <NavLink key={link.to} to={link.to} icon={link.icon} label={link.label} />
              ))}

              {/* Logout Button */}
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-2 ml-2 px-4 py-2 rounded-lg text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95 border-none cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                <LogoutIcon fontSize="small" />
                Logout
              </button>
            </div>

            {/* ── Mobile Hamburger ── */}
            <button
              className="md:hidden text-white p-2 rounded-lg hover:bg-white/10 transition-colors border-none bg-transparent cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* ── Mobile Menu ── */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t border-white/10 px-4 pb-4 pt-2"
            style={{ background: 'rgba(13,74,46,0.97)' }}
          >
            {/* User badge mobile */}
            <div className="flex items-center gap-2 py-3 border-b border-white/10 mb-2">
              <PersonIcon style={{ color: '#86efac', fontSize: 18 }} />
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wide">
                {displayName} / Owner
              </span>
            </div>

            <MobileLink to="/home" icon={<HomeIcon fontSize="small" />} label="Home" onClose={() => setMobileMenuOpen(false)} />

            {/* Livestock accordion mobile */}
            <div>
              <button
                onClick={() => setShowLivestockDropdown(!showLivestockDropdown)}
                className="flex items-center justify-between w-full py-3 px-2 text-white/85 text-sm font-medium bg-transparent border-none cursor-pointer rounded-lg hover:bg-white/10 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <PetsIcon fontSize="small" style={{ color: '#86efac' }} />
                  Livestock
                </span>
                {showLivestockDropdown ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
              </button>
              {showLivestockDropdown && (
                <div className="ml-6 border-l border-white/20 pl-3">
                  <MobileLink to="/owner/add-livestock" icon={<AddCircleOutlineIcon fontSize="small" />} label="Add Livestock" onClose={() => { setMobileMenuOpen(false); setShowLivestockDropdown(false); }} />
                  <MobileLink to="/owner/view-livestock" icon={<FormatListBulletedIcon fontSize="small" />} label="View Livestock" onClose={() => { setMobileMenuOpen(false); setShowLivestockDropdown(false); }} />
                </div>
              )}
            </div>

            {navLinks.slice(1).map((link) => (
              <MobileLink key={link.to} to={link.to} icon={link.icon} label={link.label} onClose={() => setMobileMenuOpen(false)} />
            ))}

            <button
              onClick={() => { setShowLogoutModal(true); setMobileMenuOpen(false); }}
              className="flex items-center gap-2 w-full mt-3 px-4 py-2.5 rounded-lg text-white font-semibold text-sm cursor-pointer border-none shadow-lg"
              style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
            >
              <LogoutIcon fontSize="small" />
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={() => setShowLogoutModal(false)}
        >
          <div
            className="relative w-full max-w-sm rounded-2xl shadow-2xl p-6 border border-white/10"
            style={{
              background: 'linear-gradient(160deg, #0f5233 0%, #0a3d26 100%)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.15)' }}>
                <WarningAmberIcon style={{ color: '#f87171', fontSize: 32 }} />
              </div>
            </div>

            <h3 className="text-white text-center text-lg font-bold mb-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
              Confirm Logout
            </h3>
            <p className="text-white/60 text-center text-sm mb-6">
              Are you sure you want to logout from your account?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl text-white/80 font-semibold text-sm border border-white/20 hover:bg-white/10 transition-colors cursor-pointer bg-transparent disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl text-white font-semibold text-sm transition-all duration-200 hover:opacity-90 active:scale-95 cursor-pointer border-none disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
              >
                <LogoutIcon fontSize="small" />
                {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/* ── Reusable Desktop Nav Link ── */
const NavLink = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-2 px-4 py-2 rounded-xl text-white/85 hover:text-white hover:bg-white/10 transition-all duration-200 text-sm font-medium no-underline whitespace-nowrap"
  >
    <span style={{ color: '#86efac', display: 'flex' }}>{icon}</span>
    {label}
  </Link>
);

/* ── Reusable Mobile Nav Link ── */
const MobileLink = ({ to, icon, label, onClose }) => (
  <Link
    to={to}
    onClick={onClose}
    className="flex items-center gap-2 py-3 px-2 text-white/85 text-sm font-medium no-underline rounded-lg hover:bg-white/10 transition-colors"
  >
    <span style={{ color: '#86efac', display: 'flex' }}>{icon}</span>
    {label}
  </Link>
);

export default OwnerNavbar;