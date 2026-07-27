import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { getErrorMessage } from "../utils/errors";
import ManageRole from "../components/ManageRole";
import SummaryTickets from "../components/SummaryTickets";
import TicketDetailModal from "../components/TicketDetailModal";
import LogoutConfirmModal from "../components/LogoutConfirmModal";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const fetchAllTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/tickets");
      const data = response.data;
      if (Array.isArray(data)) {
        setTickets(data);
        if (selectedTicket) {
          const updatedTicket = data.find((t) => t.id === selectedTicket.id);
          if (updatedTicket) {
            setSelectedTicket(updatedTicket);
          }
        }
      } else {
        console.error("API /tickets did not return an array:", data);
        setTickets([]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  useEffect(() => {
    fetchAllTickets();
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const name = payload.sub || payload.username || payload.email || "";
        setUsername(name);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, null, {
        params: { new_status: newStatus },
      });
      fetchAllTickets();
    } catch (error) {
      alert(getErrorMessage(error));
    }
  };

  const displayName = username.includes("@") ? username.split("@")[0] : username;

  const ticketsList = Array.isArray(tickets) ? tickets : [];
  const totalCount = ticketsList.length;
  const pendingCount = ticketsList.filter((t) => t && t.status === "pending").length;
  const acceptedCount = ticketsList.filter((t) => t && t.status === "accepted").length;
  const resolvedCount = ticketsList.filter((t) => t && t.status === "resolved").length;
  const rejectedCount = ticketsList.filter((t) => t && t.status === "rejected").length;

  const displayTickets = ticketsList.filter((ticket) => {
    if (!ticket) return false;
    const title = ticket.title || "";
    const description = ticket.description || "";
    const ownerName = ticket.owner?.username || "";

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ownerName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" ? true : ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyles = (status) => {
    switch (status) {
      case "pending":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-100/80",
          dot: "bg-amber-500 animate-pulse",
          border: "border-l-amber-500",
          label: "Pending",
        };
      case "accepted":
        return {
          bg: "bg-indigo-50 text-indigo-700 border-indigo-100/80",
          dot: "bg-indigo-600 animate-pulse",
          border: "border-l-indigo-600",
          label: "In Progress",
        };
      case "resolved":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-100/80",
          dot: "bg-emerald-500",
          border: "border-l-emerald-500",
          label: "Resolved",
        };
      case "rejected":
        return {
          bg: "bg-rose-50 text-rose-700 border-rose-100/80",
          dot: "bg-rose-500",
          border: "border-l-rose-500",
          label: "Cancelled",
        };
      default:
        return {
          bg: "bg-slate-50 text-slate-600 border-slate-100/80",
          dot: "bg-slate-400",
          border: "border-l-slate-400",
          label: "Unknown",
        };
    }
  };

  const getAvatarLetter = () => {
    if (!displayName) return "A";
    return displayName.charAt(0).toUpperCase();
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen w-full bg-[#F1F5F9] flex flex-col justify-center items-center font-sans">
        <svg className="animate-spin h-8 w-8 text-indigo-600 mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-sm font-bold text-slate-500">Loading admin workspace...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F1F5F9] text-slate-800 font-sans overflow-x-hidden relative pb-16">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/70 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-600 rounded-xl shadow-lg shadow-indigo-600/15">
              <svg
                className="w-5.5 h-5.5 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                Helpdesk Portal
              </h1>
              <p className="text-[10px] text-slate-500 font-bold -mt-0.5">Admin Workspace</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t border-slate-200/50 pt-4 md:pt-0 md:border-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 shadow-sm">
                {getAvatarLetter()}
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-slate-800">{displayName || "Admin"}</p>
                <span className="text-[9px] text-indigo-600 font-bold block -mt-0.5">Administrator</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border border-slate-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Manage Roles
              </button>
              <button
                onClick={() => setIsSummaryModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white border border-indigo-700 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                AI Summary
              </button>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-1 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                <span>LOGOUT</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* METRICS ROW */}
        <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Card: Total */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-slate-900/5 hover:shadow-2xl hover:shadow-slate-900/8 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600 border border-indigo-100/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-slate-900">{totalCount}</span>
              <p className="text-[10px] text-slate-500 font-bold mt-0.5">Total tickets in system</p>
            </div>
          </div>

          {/* Card: Pending */}
          <div className="bg-amber-50/60 border border-amber-100/70 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-amber-900/5 hover:shadow-2xl hover:shadow-amber-900/10 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-extrabold text-amber-700/90 uppercase tracking-wider">Pending</span>
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 border border-amber-200/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-amber-950">{pendingCount}</span>
              <p className="text-[10px] text-amber-700/80 font-bold mt-0.5">Tickets awaiting response</p>
            </div>
          </div>

          {/* Card: Accepted */}
          <div className="bg-blue-50/60 border border-blue-100/70 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:shadow-blue-900/10 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-extrabold text-blue-700/90 uppercase tracking-wider">In Progress</span>
              <div className="p-2 bg-blue-100 rounded-xl text-blue-700 border border-blue-200/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-blue-950">{acceptedCount}</span>
              <p className="text-[10px] text-blue-700/80 font-bold mt-0.5">Tickets active / unresolved</p>
            </div>
          </div>

          {/* Card: Resolved */}
          <div className="bg-emerald-50/60 border border-emerald-100/70 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-emerald-900/5 hover:shadow-2xl hover:shadow-emerald-900/10 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-extrabold text-emerald-700/90 uppercase tracking-wider">Resolved</span>
              <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700 border border-emerald-200/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-emerald-950">{resolvedCount}</span>
              <p className="text-[10px] text-emerald-700/80 font-bold mt-0.5">Issues resolved successfully</p>
            </div>
          </div>

          {/* Card: Cancelled */}
          <div className="bg-rose-50/60 border border-rose-100/70 rounded-2xl p-5 flex flex-col justify-between shadow-xl shadow-rose-900/5 hover:shadow-2xl hover:shadow-rose-900/10 hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex justify-between items-start">
              <span className="text-[11px] font-extrabold text-rose-700/90 uppercase tracking-wider">Cancelled</span>
              <div className="p-2 bg-rose-100 rounded-xl text-rose-700 border border-rose-200/50">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl font-black text-rose-950">{rejectedCount}</span>
              <p className="text-[10px] text-rose-700/80 font-bold mt-0.5">Tickets cancelled / rejected</p>
            </div>
          </div>
        </section>

        {/* SEARCH & FILTERS */}
        <section className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search by title, description, or user..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm shadow-slate-900/5"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 scrollbar-none items-center">
              {[
                { id: "all", label: "All" },
                { id: "pending", label: "Pending" },
                { id: "accepted", label: "In Progress" },
                { id: "resolved", label: "Resolved" },
                { id: "rejected", label: "Cancelled" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer select-none
                    ${
                      filterStatus === tab.id
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                        : "bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 border border-slate-200"
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllTickets}
              className="bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-800 p-2.5 rounded-2xl border border-slate-200 shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Refresh tickets list"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
            <div className="bg-white border border-slate-200 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-750 shadow-sm">
              Filtered: {displayTickets.length}
            </div>
          </div>
        </section>

        {/* DESKTOP TABLE VIEW */}
        <section className="hidden lg:block bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-900/5 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/75 border-b border-slate-200/80">
              <tr>
                <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest w-[55%]">
                  Ticket Details
                </th>
                <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-center w-[20%]">
                  Status
                </th>
                <th className="p-5 text-xs font-extrabold text-slate-400 uppercase tracking-widest text-right w-[25%]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayTickets.map((t) => {
                const styles = getStatusStyles(t.status);
                const displayDesc = t.description.length > 80
                  ? `${t.description.slice(0, 80)}...`
                  : t.description;

                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                    <td
                      className="p-5 cursor-pointer hover:bg-slate-50/70"
                      onClick={() => setSelectedTicket(t)}
                      title="Click to view full ticket details"
                    >
                      <div className="font-extrabold text-slate-800 text-[15px] leading-tight break-words hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                        <span>{t.title}</span>
                        <svg className="w-3.5 h-3.5 text-slate-350 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.5 6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM13.5 13.5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zM13.5 21a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
                        </svg>
                      </div>
                      <div className="text-slate-500 text-xs mt-1.5 whitespace-pre-wrap leading-relaxed font-medium break-words">
                        {displayDesc}
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md break-all">
                          📞 {t.contact_info}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          📅 {new Date(t.created_at).toLocaleDateString("en-US", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${styles.bg}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                        {styles.label}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex flex-wrap justify-end gap-1.5">
                        {t.status === "pending" && (
                          <button
                            onClick={() => handleUpdateStatus(t.id, "accepted")}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 transition-all active:scale-95 cursor-pointer"
                          >
                            Accept
                          </button>
                        )}
                        {t.status === "accepted" && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(t.id, "resolved")}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all active:scale-95 cursor-pointer"
                            >
                              Resolve
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(t.id, "rejected")}
                              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-rose-500/10 transition-all active:scale-95 cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(t.status === "resolved" || t.status === "rejected") && (
                          <span className="text-slate-400 text-xs font-bold italic mr-2 bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">
                            Completed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {displayTickets.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-bold">
              No tickets found matching current status/filters.
            </div>
          )}
        </section>

        {/* MOBILE STACKED CARDS VIEW */}
        <section className="lg:hidden space-y-4">
          {displayTickets.length > 0 ? (
            displayTickets.map((t) => {
              const styles = getStatusStyles(t.status);
              const displayDesc = t.description.length > 80
                ? `${t.description.slice(0, 80)}...`
                : t.description;

              return (
                <article
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`bg-white border border-slate-200/80 p-5 rounded-2xl shadow-sm border-l-4 ${styles.border} flex flex-col justify-between cursor-pointer hover:border-indigo-400`}
                >
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <h3 className="text-base font-extrabold text-slate-800 leading-snug">
                      {t.title}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 border ${styles.bg}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot}`} />
                      {styles.label}
                    </span>
                  </div>

                  <div className="text-slate-650 text-xs leading-relaxed mb-4 whitespace-pre-wrap font-medium">
                    {displayDesc}
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-slate-100 pointer-events-none">
                    <div className="flex flex-wrap justify-between items-center gap-2 text-[11px]">
                      {t.owner && (
                        <div className="flex items-center gap-1">
                          <span className="text-slate-400 font-bold">Reporter:</span>
                          <span className="text-indigo-700 font-bold bg-indigo-50/50 border border-indigo-100/50 px-2 py-0.5 rounded-md">
                            👤 {t.owner.username}
                          </span>
                        </div>
                      )}
                      <div className="text-slate-400 font-medium">
                        {new Date(t.created_at).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-100/60 p-2.5 rounded-xl justify-between">
                      <span>📞 Contact: {t.contact_info}</span>
                      <span className="text-indigo-600 font-bold hover:underline inline-flex items-center gap-0.5">
                        View details
                        <svg className="w-3 h-3 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="bg-white border border-slate-200/70 rounded-2xl py-16 px-6 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h4 className="text-base font-extrabold text-slate-800">No Tickets Found</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto font-medium">
                We couldn't find any tickets matching your search query or status filter. Please try a different query.
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 text-xs font-bold px-4.5 py-2.5 rounded-xl transition-all border border-slate-200 cursor-pointer shadow-sm"
                >
                  Clear Filters & Search
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* MANAGE ROLE MODAL */}
      {isModalOpen && (
        <ManageRole
          onClose={() => setIsModalOpen(false)}
          onRefresh={fetchAllTickets}
        />
      )}

      {/* AI SUMMARY MODAL */}
      {isSummaryModalOpen && (
        <SummaryTickets
          onClose={() => setIsSummaryModalOpen(false)}
        />
      )}

      {/* TICKET DETAILS MODAL */}
      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onUpdateStatus={handleUpdateStatus}
          isAdmin={true}
        />
      )}

      {/* LOGOUT CONFIRM MODAL */}
      {showLogoutModal && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogoutModal(false)}
        />
      )}
    </div>
  );
}
