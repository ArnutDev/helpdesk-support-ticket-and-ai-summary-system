import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ManageRole from "../components/ManageRole";
import SummaryTickets from "../components/SummaryTickets";
export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const navigate = useNavigate();

  const displayTickets = tickets.filter((ticket) => {
    if (filterStatus === "all") return true;
    return ticket.status === filterStatus;
  });

  const statuses = ["all", "pending", "accepted", "resolved", "rejected"];

  const fetchAllTickets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/tickets");
      setTickets(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
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
  }, []);

  const handleUpdateStatus = async (ticketId, newStatus) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, null, {
        params: { new_status: newStatus },
      });
      fetchAllTickets();
    } catch (error) {
      alert(error.response?.data?.detail || "Update failed");
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center text-white font-bold animate-pulse">
        กำลังโหลดข้อมูลรายการแจ้งซ่อม...
      </div>
    );

  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* HEADER SECTION */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="text-gray-200">จัดการรายการแจ้งซ่อมและสถานะงาน</p>
        </div>

        <div className="flex flex-row items-end gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-200"
          >
            Manage Role
          </button>
          {/*Logout */}
          <button
            onClick={handleLogout}
            className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-xl text-sm font-black shadow-lg transition-all active:scale-95"
          >
            LOGOUT
          </button>
          
          
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex space-x-2 bg-gray-100 p-1.5 rounded-2xl w-fit shadow-inner">
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-5 py-2 rounded-xl text-xs font-bold uppercase transition-all 
            ${
              filterStatus === status
                ? "bg-white text-blue-600 shadow-md"
                : "text-gray-500 hover:text-gray-700"
            }`}
            >
              {status}
            </button>
          ))}
        </div>
        <button
          onClick={fetchAllTickets}
          className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-xl transition-all"
          title="Refresh Data"
        >
          🔄
        </button>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl text-white border border-white/20 font-bold">
            Total: {tickets.length} Tickets
          </div>
          <button
            onClick={() => setIsSummaryModalOpen(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-600"
          >
            Summary Tickets
          </button>
          
          
      </div>

      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest">
                รายละเอียดปัญหา
              </th>
              <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-center">
                สถานะ
              </th>
              <th className="p-6 text-xs font-black text-gray-400 uppercase tracking-widest text-right">
                ดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {displayTickets.map((t) => (
              <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-6">
                  <div className="font-bold text-gray-800 text-lg leading-tight">
                    {t.title}
                  </div>
                  <div className="text-gray-500 text-sm mt-1 line-clamp-2">
                    {t.description}
                  </div>
                  <div className="flex gap-4 mt-3">
                    <span className="text-blue-500 text-xs font-bold bg-blue-50 px-2 py-1 rounded-md">
                      📍 {t.contact_info}
                    </span>
                    {t.owner && (
                      <span className="text-purple-500 text-xs font-bold bg-purple-50 px-2 py-1 rounded-md">
                        👤 โดย: {t.owner.username}
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm border
                    ${
                      t.status === "pending"
                        ? "bg-amber-50 text-amber-600 border-amber-100"
                        : t.status === "accepted"
                          ? "bg-blue-50 text-blue-600 border-blue-100"
                          : t.status === "resolved"
                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                            : "bg-rose-50 text-rose-600 border-rose-100"
                    }
                  `}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    {t.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "accepted")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        Accept
                      </button>
                    )}
                    {t.status === "accepted" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(t.id, "resolved")}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(t.id, "rejected")}
                          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {(t.status === "resolved" || t.status === "rejected") && (
                      <span className="text-gray-300 text-xs font-medium italic">
                        Completed
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayTickets.length === 0 && (
          <div className="p-20 text-center text-gray-400 font-medium">
            ไม่พบรายการแจ้งซ่อมในหมวดนี้
          </div>
        )}
      </div>
      {isModalOpen && (
        <ManageRole
          onClose={() => setIsModalOpen(false)}
        />
      )}

      /// สรุปข้อมูลด้วย AI Modal
      {isSummaryModalOpen && (
       <SummaryTickets
          onClose={() => setIsSummaryModalOpen(false)}
        />
      )}
    </div>
  );
}
