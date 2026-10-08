import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import OwnerNavbar from '../OwnerComponents/OwnerNavbar';
import SupplierNavbar from '../SupplierComponents/SupplierNavbar';

// MUI Icons
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined';
import StorefrontOutlinedIcon from '@mui/icons-material/StorefrontOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LocalPhoneOutlinedIcon from '@mui/icons-material/LocalPhoneOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import HandshakeOutlinedIcon from '@mui/icons-material/HandshakeOutlined';
import NatureOutlinedIcon from '@mui/icons-material/NatureOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/* ── Animated Counter Hook ── */
function useCountUp(target, duration = 2000, startWhenVisible = true) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!startWhenVisible) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started, startWhenVisible]);

  useEffect(() => {
    if (!started) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [started, target, duration]);

  return { count, ref };
}

/* ── Stat Card ── */
const StatCard = ({ target, suffix, label, delay }) => {
  const { count, ref } = useCountUp(target, 2000);
  return (
    <div
      ref={ref}
      className="flex flex-col items-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <span className="text-4xl lg:text-5xl font-extrabold text-emerald-700 tabular-nums">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="mt-2 text-xs font-semibold tracking-widest text-gray-400 uppercase">{label}</span>
    </div>
  );
};

/* ── Feature Card ── */
const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div className="group flex flex-col gap-4 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300 hover:-translate-y-1">
    <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
      <Icon style={{ fontSize: 24, color: '#059669' }} />
    </div>
    <div>
      <h3 className="text-gray-900 font-bold text-base mb-1">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </div>
  </div>
);

/* ── Main Component ── */
const HomePage = () => {
  console.log('Home page loaded');
  const userRole = useSelector((state) => state.user.userRole);
  const heroRef = useRef(null);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Navbar */}
      {userRole === 'Owner' ? <OwnerNavbar /> : <SupplierNavbar />}

      {/* ══════════════════════════════════════
          HERO SECTION
      ══════════════════════════════════════ */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src="/farmconnect.png"
          alt="FarmConnect"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(160deg, rgba(4,47,31,0.88) 0%, rgba(6,78,59,0.82) 40%, rgba(6,95,70,0.65) 100%)' }}
        />

        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-emerald-400 opacity-10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-teal-300 opacity-10 blur-3xl" />

        {/* Hero content */}
        <div
          ref={heroRef}
          className={`relative z-10 text-center px-6 max-w-4xl mx-auto transition-all duration-1000
            ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white bg-opacity-10 border border-white border-opacity-20 backdrop-blur-sm mb-8">
            <AgricultureOutlinedIcon style={{ fontSize: 16, color: '#34d399' }} />
            <span className="text-emerald-300 text-xs font-semibold tracking-widest uppercase">Premier Agricultural Platform</span>
          </div>

          {/* Title */}
          <h1 className="text-6xl lg:text-8xl font-extrabold mb-6 leading-none tracking-tight">
            <span className="text-white">Farm</span>
            <span className="text-emerald-400">Connect</span>
          </h1>

          <p className="text-emerald-100 text-lg lg:text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            The premier digital ecosystem where quality feed meets world-class livestock management.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-900/40 transition-all duration-200 hover:scale-105 active:scale-95">
              Get Started
              <ArrowForwardIcon style={{ fontSize: 18 }} />
            </button>
            <button className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-30 text-white font-bold text-sm tracking-wide backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95">
              <StorefrontOutlinedIcon style={{ fontSize: 18 }} />
              View Marketplace
            </button>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1440 80" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path fill="#f9fafb" d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════
          QUOTE + STATS SECTION
      ══════════════════════════════════════ */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          {/* Divider accent */}
          <div className="flex justify-center mb-10">
            <div className="w-16 h-1 rounded-full bg-emerald-500" />
          </div>

          {/* Quote */}
          <blockquote className="text-center text-2xl lg:text-3xl font-semibold text-gray-800 leading-relaxed mb-16 max-w-3xl mx-auto">
            "Success in livestock farming starts with the{' '}
            <span className="text-emerald-600 font-bold">right connections</span>.
            FarmConnect bridges the gap between livestock owners and feed sellers, ensuring access to quality feed and resources for{' '}
            <span className="underline decoration-emerald-400 decoration-2 underline-offset-4">
              healthier, thriving animals
            </span>."
          </blockquote>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4 bg-white rounded-3xl shadow-lg border border-gray-100 px-8 py-10 divide-y-2 lg:divide-y-0 lg:divide-x-2 divide-gray-100">
            <StatCard target={12000} suffix="+" label="Active Users"   delay={0}   />
            <StatCard target={850}   suffix=""  label="Daily Trades"   delay={200} />
            <StatCard target={45}    suffix="+" label="Feed Variety"   delay={400} />
            <StatCard target={18}    suffix=""  label="Regions"        delay={600} />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════ */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">Why FarmConnect</p>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">Everything you need to grow</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <FeatureCard
              icon={TrendingUpOutlinedIcon}
              title="Real-Time Market"
              desc="Live pricing and demand data so you always trade at the best rates."
            />
            <FeatureCard
              icon={VerifiedOutlinedIcon}
              title="Verified Suppliers"
              desc="Every feed supplier is vetted for quality standards and reliability."
            />
            <FeatureCard
              icon={HandshakeOutlinedIcon}
              title="Direct Deals"
              desc="Connect and negotiate directly — no middlemen, lower costs."
            />
            <FeatureCard
              icon={NatureOutlinedIcon}
              title="Sustainable Feed"
              desc="Curated eco-friendly feed options for responsible livestock care."
            />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          HOW IT WORKS SECTION
      ══════════════════════════════════════ */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">Simple Process</p>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-14">How it works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-0.5 bg-emerald-100" />

            {[
              { step: '01', title: 'Create Account', desc: 'Sign up as a livestock owner or a feed supplier in minutes.' },
              { step: '02', title: 'Browse & Connect', desc: 'Explore verified listings and connect with the right partner.' },
              { step: '03', title: 'Trade & Grow', desc: 'Close deals directly and watch your operation thrive.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-emerald-200 mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CONTACT + FOOTER SECTION
      ══════════════════════════════════════ */}
      <footer
        className="py-16 px-6"
        style={{ background: 'linear-gradient(135deg, #0d1b2a 0%, #0f2d40 100%)' }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Contact row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-10 mb-12">
            <div>
              <h2 className="text-white text-2xl font-extrabold mb-2">Contact Us</h2>
              <p className="text-gray-400 text-sm">We are here to support your agricultural growth.</p>
            </div>

            <div className="flex flex-col gap-4">
              <a
                href="mailto:support@farmconnect.com"
                className="flex items-center gap-4 group"
              >
                <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                  support@farmconnect.com
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-40 transition-colors">
                  <EmailOutlinedIcon style={{ fontSize: 20, color: '#34d399' }} />
                </div>
              </a>
              <a
                href="tel:1234567890"
                className="flex items-center gap-4 group"
              >
                <span className="text-gray-300 text-sm group-hover:text-white transition-colors">
                  123-456-7890
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500 bg-opacity-20 flex items-center justify-center group-hover:bg-opacity-40 transition-colors">
                  <LocalPhoneOutlinedIcon style={{ fontSize: 20, color: '#34d399' }} />
                </div>
              </a>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-white border-opacity-10 mb-8" />

          {/* Bottom bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white text-xs font-extrabold">
                FC
              </div>
              <span className="text-gray-400 text-sm">© 2024 FarmConnect Inc.</span>
            </div>
            <div className="flex gap-6">
              <button className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</button>
              <button className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Trade</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;