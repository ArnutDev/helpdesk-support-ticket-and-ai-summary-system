import { useState, useEffect } from "react";
import api from "../services/api";

export default function SummaryTickets({ onClose }) {
  const [summaryData, setSummaryData] = useState(null);
//   const [summaryError, setSummaryError] = useState(null);
 const [loading, setLoading] = useState(true);

  const FetchSummary = async () => {
    setLoading(true);
    setSummaryData(null); // ล้างข้อมูลเก่าทิ้งก่อน
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/admin/tickets/summary", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSummaryData(response.data);
    } catch (error) {
      console.error("ดึงข้อมูลผู้ใช้ไม่สำเร็จ:", error);
      alert(error.response?.data?.detail || "ไม่สามารถสรุปข้อมูลได้");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    FetchSummary();
  }, []);
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all flex flex-col max-h-[85vh]">
        
        {/* ส่วนหัวหน้าต่าง */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-black text-gray-800">Summary tickets result</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-grow pr-2 space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">กำลังสรุปข้อมูล...</div>
          ) : summaryData ? (
            <div className="text-gray-700 whitespace-pre-wrap">{summaryData.summary}</div>
          ) : (
            <div className="text-center py-4 text-gray-500">ไม่มีข้อมูลให้สรุป</div>
          )}
        </div>
        
      </div>
    </div>
  );
}
