import { useState, useEffect } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchAllTickets = async () => {
    try {
      const response = await api.get("/tickets");
      setTickets(response.data);
    } finally {
      setLoading(false);
    }
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
      <div className="p-10 text-center">กำลังโหลดข้อมูลเจ้าหน้าที่...</div>
    );
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">จัดการรายการแจ้งซ่อมและสถานะงาน</p>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-lg text-blue-700 font-bold">
          Total: {tickets.length} Tickets
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="p-6 text-sm font-bold text-gray-400 uppercase">
                รายละเอียดปัญหา
              </th>
              <th className="p-6 text-sm font-bold text-gray-400 uppercase text-center">
                สถานะ
              </th>
              <th className="p-6 text-sm font-bold text-gray-400 uppercase text-right">
                ดำเนินการ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {tickets.map((t) => (
              <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="p-6">
                  <div className="font-bold text-gray-800 text-lg">
                    {t.title}
                  </div>
                  <div className="text-gray-500 text-sm mt-1">
                    {t.description}
                  </div>
                  <div className="text-blue-500 text-xs font-medium mt-2">
                    📍 {t.contact_info}
                  </div>
                </td>
                <td className="p-6 text-center">
                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-sm
                    ${
                      t.status === "pending"
                        ? "bg-amber-100 text-amber-600"
                        : t.status === "accepted"
                          ? "bg-blue-100 text-blue-600"
                          : t.status === "resolved"
                            ? "bg-emerald-100 text-emerald-600"
                            : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2">
                    {/* แสดงปุ่มตามเงื่อนไข (Logic เดียวกับ Backend) */}
                    {t.status === "pending" && (
                      <button
                        onClick={() => handleUpdateStatus(t.id, "accepted")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                      >
                        รับเรื่อง (Accept)
                      </button>
                    )}

                    {t.status === "accepted" && (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(t.id, "resolved")}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                        >
                          เสร็จสิ้น (Resolve)
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(t.id, "rejected")}
                          className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95"
                        >
                          ปฏิเสธ (Reject)
                        </button>
                      </>
                    )}

                    {(t.status === "resolved" || t.status === "rejected") && (
                      <span className="text-gray-300 text-xs italic">
                        ปิดงานเรียบร้อยแล้ว
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
