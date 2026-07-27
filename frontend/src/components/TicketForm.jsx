import { useState, useEffect } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/errors";

export default function TicketForm({ onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact_info: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await api.post("/tickets", formData);
      if (response.status === 200 || response.status === 201) {
        onRefresh();
        onClose();
      }
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-7.5 w-full max-w-md shadow-2xl shadow-slate-950/20 border border-slate-100 transform transition-all duration-300 scale-100 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Create New Ticket</h2>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Submit details to get support</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-50 p-2 rounded-xl transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 tracking-wide">
              Issue Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Printer is jammed, network offline"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-sm text-slate-800 placeholder-slate-400/90 shadow-sm"
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 tracking-wide">
              Detailed Description
            </label>
            <textarea
              required
              placeholder="Describe the problem you are experiencing in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 h-32 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-sm text-slate-800 placeholder-slate-400/90 shadow-sm resize-none"
            />
          </div>

          {/* Contact Info Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 tracking-wide">
              Contact Information
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Phone number, Slack handle, or email"
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all duration-200 text-sm text-slate-800 placeholder-slate-400/90 shadow-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-800 py-3.5 rounded-2xl font-bold transition-all active:scale-95 cursor-pointer text-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 hover:from-indigo-950 hover:to-indigo-700 text-white py-3.5 rounded-2xl font-bold shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-sm flex items-center justify-center gap-1.5"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <span>Submit Ticket</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
