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
      <div className="relative bg-gradient-to-br from-green-900 to-green-800 border border-green-600/50 rounded-2xl p-8 md:p-12 shadow-2xl shadow-green-500/30 max-w-md mx-4 animate-bounce-in">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-green-500/20 text-green-400">
            <span className="material-symbols-outlined text-2xl">check_circle</span>
          </div>
          <h2 className="text-2xl font-black text-white">Success!</h2>
        </div>
        <p className="text-sm text-green-100 leading-relaxed">{message || 'Your finance application has been submitted successfully. We will review it shortly.'}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full h-10 rounded-lg bg-green-500 text-white font-bold uppercase tracking-wide transition-all hover:bg-green-600 active:scale-95"
        >
          Close
        </button>
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
    <div key={key} className="text-sm text-red-200 py-1 flex items-start gap-2">
      <span className="text-primary font-bold mt-0.5">•</span>
      <span>{value}</span>
    </div>
  ));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-gradient-to-br from-card-dark to-background-dark border border-primary/30 rounded-2xl p-2 md:p-12 shadow-2xl shadow-primary/20 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center gap-4 mb-4">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/50">
            <span className="material-symbols-outlined text-2xl">error</span>
          </div>
          <h2 className="text-2xl font-black text-primary">Validation Error</h2>
        </div>
        <div className="mb-6">
          {message && <p className="text-sm text-text-light leading-relaxed mb-4">{message}</p>}
          {errorList.length > 0 && (
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4">
              {errorList}
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-full h-10 rounded-lg bg-primary text-black font-bold uppercase tracking-wide transition-all hover:bg-primary-hover active:scale-95 shadow-[0_0_12px_rgba(212,175,55,0.3)]"
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
      <div className="relative bg-card-dark border border-border-grey rounded-2xl p-8 md:p-12 shadow-2xl shadow-black/50 max-w-md mx-4">
        <div className="flex flex-col items-center gap-6">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/20 text-primary animate-spin">
            <span className="material-symbols-outlined text-3xl">hourglass_top</span>
          </div>
          <div className="text-center">
            <p className="text-sm text-text-muted">{message}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
