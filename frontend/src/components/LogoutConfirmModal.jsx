import React, { useEffect } from "react";

export default function LogoutConfirmModal({ onConfirm, onCancel }) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-6.5 w-full max-w-xs sm:max-w-sm shadow-2xl shadow-slate-950/20 border border-slate-100 flex flex-col items-center text-center transform transition-all duration-300 scale-100 animate-scale-up">
        {/* Warning Icon */}
        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
          </svg>
        </div>

        {/* Modal Info */}
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Confirm Logout</h3>
        <p className="text-xs text-slate-500 font-medium mt-1.5 leading-relaxed max-w-[240px]">
          Are you sure you want to end your active session and log out?
        </p>

        {/* Action Buttons */}
        <div className="flex w-full gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-600 font-bold py-3.5 px-4 rounded-2xl transition-all active:scale-95 cursor-pointer text-xs"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 px-4 rounded-2xl shadow-md shadow-rose-600/10 transition-all active:scale-95 cursor-pointer text-xs"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
