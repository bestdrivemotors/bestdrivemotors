'use client';

import { useEffect, useState } from 'react';

export function SuccessModal({ isOpen, onClose, message }) {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-2xl max-w-md mx-4 overflow-hidden">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/70"></div>
        
        <div className="flex flex-col items-center text-center">
          <div className="flex size-16 items-center justify-center rounded-full mb-6" style={{ backgroundColor: '#002470', color: '#D4AF37' }}>
            <span className="material-symbols-outlined text-4xl">check_circle</span>
          </div>
          <h2 className="text-3xl font-black text-black mb-3">Success!</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-8">{message || 'Your finance application has been submitted successfully. We will review it shortly.'}</p>
          
          <div className="w-full space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
              <span>Application received and verified</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700">
              <span className="material-symbols-outlined text-primary text-lg">schedule</span>
              <span>We'll review your application within 24 hours</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="mt-8 w-full h-12 rounded-lg font-bold uppercase tracking-wide transition-all active:scale-95 text-white"
            style={{ backgroundColor: '#002470' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#001a52'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#002470'}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function ErrorModal({ isOpen, onClose, message, errors }) {
  const [displayErrors, setDisplayErrors] = useState({});

  useEffect(() => {
    if (isOpen && errors) {
      setDisplayErrors(errors);
    }
  }, [isOpen, errors]);

  if (!isOpen) return null;

  const errorList = Object.entries(displayErrors).map(([key, value]) => (
    <div key={key} className="text-sm text-gray-700 py-2 flex items-start gap-3 border-b border-red-100 last:border-b-0">
      <span className="text-red-500 font-bold mt-0.5 flex-shrink-0">✕</span>
      <span>{value}</span>
    </div>
  ));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-2xl max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        {/* Top accent bar - red for error */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 via-red-600 to-red-500"></div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500 flex-shrink-0">
            <span className="material-symbols-outlined text-3xl">error</span>
          </div>
          <h2 className="text-2xl font-black text-gray-900">Oops!</h2>
        </div>

        <div className="mb-6">
          {message && <p className="text-sm text-gray-600 leading-relaxed mb-6 font-semibold">{message}</p>}
          {errorList.length > 0 && (
            <div className="bg-red-50 rounded-lg p-4 space-y-2">
              {errorList}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          className="w-full h-12 rounded-lg bg-red-500 text-white font-bold uppercase tracking-wide transition-all hover:bg-red-600 active:scale-95 shadow-md"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export function LoadingModal({ isOpen, message = 'Submitting application...' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div className="relative bg-white rounded-2xl p-8 md:p-12 shadow-2xl max-w-md mx-4">
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-primary to-primary/70"></div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex size-16 items-center justify-center rounded-full animate-spin" style={{ backgroundColor: '#002470', color: '#D4AF37' }}>
            <span className="material-symbols-outlined text-3xl">hourglass_top</span>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">{message}</p>
            <div className="flex justify-center gap-1 mt-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '0s'}}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{animationDelay: '0.4s'}}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
