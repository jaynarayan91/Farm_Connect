import React from 'react';
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

const ErrorPage = () => {
  return (
    <div className="min-h-screen flex flex-col font-sans"
      style={{ background: 'linear-gradient(145deg, #064e3b 0%, #065f46 50%, #047857 100%)' }}
    >
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full bg-emerald-300 opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-teal-300 opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-800 opacity-20 blur-3xl pointer-events-none" />

      <header className="relative z-10 flex items-center gap-3 px-8 py-6">
        <div className="w-10 h-10 rounded-2xl bg-emerald-400 flex items-center justify-center shadow-lg">
          <AgricultureOutlinedIcon style={{ fontSize: 22, color: '#fff' }} />
        </div>
        <span className="text-white font-bold text-xl tracking-wide">FarmConnect</span>
      </header>

      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg text-center">

          {/* Error Icon Card */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Outer glow ring */}
              <div className="w-36 h-36 rounded-full bg-white bg-opacity-10 flex items-center justify-center animate-pulse">
                <div className="w-28 h-28 rounded-full bg-white bg-opacity-10 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                    <ErrorOutlineOutlinedIcon style={{ fontSize: 48, color: '#fff' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="text-emerald-300 text-xs font-semibold uppercase tracking-widest mb-3">
            Error — Something went wrong
          </p>

          <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-4">
            Oops! Something<br />Went Wrong
          </h1>

          <p className="text-emerald-100 text-base leading-relaxed max-w-sm mx-auto mb-10">
            We're sorry for the inconvenience. Our team has been notified. Please try again later or return to the home page.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white text-emerald-800 font-bold text-sm tracking-wide shadow-xl hover:shadow-2xl hover:bg-emerald-50 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <RefreshOutlinedIcon style={{ fontSize: 18 }} />
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/home'}
              className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-white bg-opacity-10 border border-white border-opacity-25 text-white font-bold text-sm tracking-wide backdrop-blur-sm hover:bg-opacity-20 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <HomeOutlinedIcon style={{ fontSize: 18 }} />
              Go to Home
            </button>
          </div>

          <div className="mt-14 flex items-center gap-4">
            <div className="flex-1 h-px bg-white bg-opacity-10" />
            <span className="text-emerald-300 text-xs tracking-widest uppercase">FarmConnect Support</span>
            <div className="flex-1 h-px bg-white bg-opacity-10" />
          </div>

          <p className="mt-5 text-emerald-200 text-sm">
            Need help?{' '}
            <a
              href="mailto:support@farmconnect.com"
              className="text-white font-semibold underline underline-offset-4 decoration-emerald-400 hover:text-emerald-200 transition-colors"
            >
              support@farmconnect.com
            </a>
          </p>
        </div>
      </div>

      <footer className="relative z-10 text-center py-5">
        <p className="text-emerald-400 text-xs">© 2024 FarmConnect Inc. — All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ErrorPage;