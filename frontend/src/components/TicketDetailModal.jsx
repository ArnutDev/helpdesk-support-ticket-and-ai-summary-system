import React from "react";

export default function TicketDetailModal({ ticket, onClose, onUpdateStatus, isAdmin }) {
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  if (!ticket) return null;

  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500 animate-pulse",
          label: "Pending Review",
        };
      case "accepted":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-200",
          dot: "bg-indigo-600 animate-pulse",
          label: "In Progress",
        };
      case "resolved":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: "Resolved",
        };
      case "rejected":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-200",
          dot: "bg-rose-500",
          label: "Cancelled",
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-600 border-slate-200",
          dot: "bg-slate-400",
          label: "Unknown",
        };
    }
  };

  const styles = getStatusStyles(ticket.status);

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-7.5 w-full max-w-lg shadow-2xl shadow-slate-950/20 border border-slate-100 flex flex-col max-h-[90vh] transform transition-all duration-300 scale-100 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-start mb-5 flex-shrink-0">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Ticket Ref: #{ticket.id.slice(0, 8)}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles.bg}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
              {styles.label}
            </span>
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

        {/* Content details scroll block */}
        <div className="overflow-y-auto flex-grow pr-1.5 scrollbar-thin space-y-6 pb-4">
          {/* Title */}
          <div>
            <h2 className="text-xl font-black text-slate-900 leading-snug tracking-tight break-words">
              {ticket.title}
            </h2>
          </div>

          <hr className="border-slate-100" />

          {/* Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Issue Description
            </h4>
            <div className="bg-slate-200/60 border border-slate-200/65 p-4.5 rounded-2xl text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium break-words shadow-inner">
              {ticket.description}
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Contact Information */}
            <div className="space-y-1.5 bg-slate-200/50 p-3.5 rounded-2xl border border-slate-200/60">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 00.099.281L7 9.3a1 1 0 001.25.253l2.25-.5c.28-.06.57-.02.82.09l2.2 1.1a1 1 0 001.07 0l2.2-1.1c.25-.11.54-.15.82-.09l2.25.5a1 1 0 001.25-.253l-1.12-2.12a1 1 0 00-.099-.281l-.548-2.2A1 1 0 0017.3 3H21a2 2 0 012 2v16a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3a2 2 0 00-2-2H9a2 2 0 00-2 2v3a2 2 0 01-2 2H2a2 2 0 01-2-2V5z" />
                </svg>
                <span>Contact Info</span>
              </h4>
              <p className="text-xs font-bold text-slate-800 break-all">
                {ticket.contact_info}
              </p>
            </div>

            {/* Created Date */}
            <div className="space-y-1.5 bg-slate-200/50 p-3.5 rounded-2xl border border-slate-200/60">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Date Reported</span>
              </h4>
              <p className="text-xs font-bold text-slate-850">
                {new Date(ticket.created_at).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>

            {/* Reporter details */}
            {ticket.owner && (
              <div className="space-y-1.5 bg-slate-200/50 p-3.5 rounded-2xl border border-slate-200/60 sm:col-span-2">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Reported By User</span>
                </h4>
                <div className="flex items-center gap-2">
                  <span className="w-5.5 h-5.5 rounded bg-indigo-100/50 text-indigo-700 flex items-center justify-center text-[10px] font-black uppercase tracking-wider">
                    {ticket.owner.username.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <span className="text-xs font-bold text-slate-800 mr-2">
                      {ticket.owner.username}
                    </span>
                    {ticket.owner.email && (
                      <span className="text-[10px] font-bold text-slate-400">
                        ({ticket.owner.email})
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-100 flex-shrink-0">
          {isAdmin && onUpdateStatus && (
            <div className="flex-grow flex flex-col sm:flex-row gap-2">
              {ticket.status === "pending" && (
                <button
                  onClick={() => {
                    onUpdateStatus(ticket.id, "accepted");
                    onClose();
                  }}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-95 cursor-pointer text-center"
                >
                  Accept Ticket
                </button>
              )}
              {ticket.status === "accepted" && (
                <>
                  <button
                    onClick={() => {
                      onUpdateStatus(ticket.id, "resolved");
                      onClose();
                    }}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer text-center"
                  >
                    Resolve Ticket
                  </button>
                  <button
                    onClick={() => {
                      onUpdateStatus(ticket.id, "rejected");
                      onClose();
                    }}
                    className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-2xl text-xs font-bold shadow-md shadow-rose-500/10 transition-all active:scale-95 cursor-pointer text-center"
                  >
                    Reject Ticket
                  </button>
                </>
              )}
            </div>
          )}

          <button
            onClick={onClose}
            className={`bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-800 py-3 px-6 rounded-2xl font-bold transition-all active:scale-95 cursor-pointer text-xs ${
              isAdmin && onUpdateStatus && ticket.status !== "resolved" && ticket.status !== "rejected"
                ? "w-full sm:w-auto"
                : "w-full"
            }`}
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
