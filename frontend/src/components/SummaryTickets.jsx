import { useState, useEffect } from "react";
import api from "../services/api";
import { getErrorMessage } from "../utils/errors";

export default function SummaryTickets({ onClose }) {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const fetchSummary = async () => {
    setLoading(true);
    setSummaryData(null);
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/admin/tickets/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummaryData(response.data);
    } catch (error) {
      console.error("Fetch summary error:", error);
      alert(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleCopy = () => {
    if (!summaryData?.summary) return;
    navigator.clipboard.writeText(summaryData.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-7.5 w-full max-w-lg shadow-2xl shadow-slate-950/20 border border-slate-100 flex flex-col max-h-[85vh] transform transition-all duration-300 scale-100 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">AI Insights Summary</h2>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Automated ticket diagnostics & key themes</p>
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

        {/* Content body */}
        <div className="overflow-y-auto flex-grow pr-1.5 scrollbar-thin mb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <svg className="animate-spin h-7 w-7 text-indigo-600 mb-4.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs font-bold">Synthesizing ticket logs with AI...</span>
            </div>
          ) : summaryData ? (
            <div className="bg-indigo-50/20 border border-indigo-100/50 p-5 rounded-2xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium shadow-inner">
              {summaryData.summary}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400 font-bold text-xs">
              No ticket summary details available.
            </div>
          )}
        </div>

        {/* Footer controls */}
        {!loading && summaryData && (
          <div className="flex justify-end gap-3 flex-shrink-0 pt-4 border-t border-slate-100">
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer ${
                copied
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200"
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H5.25m11.9-3.674A3.75 3.75 0 0015 2.25H9c-1.512 0-2.828.88-3.458 2.156m11.9 0c.228.462.35 1.012.35 1.594v11.586a1.125 1.125 0 01-1.125 1.125H9.75M9 7.5h.008v.008H9V7.5zm0 2.25h.008v.008H9V9.75zm0 2.25h.008v.008H9v-.008zm0 2.25h.008v.008H9V14.25z" />
                  </svg>
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
