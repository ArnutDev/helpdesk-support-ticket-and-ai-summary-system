import { useState } from "react";
import api from "../services/api";

export default function TicketForm({ onClose, onRefresh }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    contact_info: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/tickets", formData);
      if (response.status === 200 || response.status === 201) {
        onRefresh();
        onClose();
      }
    } catch (error) {
      alert(error.response?.data?.detail || "เกิดข้อผิดพลาดในการส่งข้อมูล");
    }
  };
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      {/* Modal Container */}
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-800">แจ้งเรื่องใหม่</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">
              หัวข้อปัญหา
            </label>
            <input
              type="text"
              required
              placeholder="เช่น อินเทอร์เน็ตใช้งานไม่ได้"
              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">
              รายละเอียด
            </label>
            <textarea
              required
              placeholder="ระบุรายละเอียดของปัญหาเพิ่มเติม..."
              className="w-full border-2 border-gray-100 rounded-xl p-3 h-32 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all resize-none"
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Contact Info Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">
              ข้อมูลติดต่อ
            </label>
            <input
              type="text"
              required
              placeholder="เบอร์โทรศัพท์ หรือ Line ID"
              className="w-full border-2 border-gray-100 rounded-xl p-3 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              onChange={(e) =>
                setFormData({ ...formData, contact_info: e.target.value })
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              ส่งเรื่องแจ้งซ่อม
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
