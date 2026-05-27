import { useState, useEffect } from "react";
import api from "../services/api";

export default function TicketForm({ onClose, onRefresh }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.get("/admin/users",{
        headers: { Authorization: `Bearer ${token}` }
    }); 
      setUsers(response.data);
    } catch (error) {
      console.error("ดึงข้อมูลผู้ใช้ไม่สำเร็จ:", error);
      alert(error.response?.data?.detail || "ไม่สามารถดึงรายชื่อผู้ใช้ได้");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    
    try {
      const token = localStorage.getItem("token");
      const response = await api.put("/admin/update-role", {
        user_id: userId,
        new_role: newRole,
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        
        if (onRefresh) onRefresh(); 
      }
    } catch (error) {
      alert(error.response?.data?.detail || "เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl transform transition-all flex flex-col max-h-[85vh]">
        
        {/* ส่วนหัวหน้าต่าง */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h2 className="text-2xl font-black text-gray-800">List Users</h2>
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

        {/* ส่วนแสดงรายชื่อ (ใส่ Scrollbar เผื่อกรณีผู้ใช้เยอะ ขอบหน้าต่างจะได้ไม่ทะลุจอ) */}
        <div className="overflow-y-auto flex-grow pr-2 space-y-4">
          {loading ? (
            <div className="text-center py-4 text-gray-500">กำลังโหลดรายชื่อ...</div>
          ) : users.length === 0 ? (
            <div className="text-center py-4 text-gray-500">ไม่พบผู้ใช้งานในระบบ</div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow"
              >
                {/* ข้อมูลซ้ายมือ: ชื่อและอีเมล */}
                <div className="flex flex-col truncate mr-2">
                  <span className="font-bold text-gray-800 truncate">
                    {user.username}
                  </span>
                  <span className="text-xs text-gray-400 truncate">
                    {user.email}
                  </span>
                </div>

                {/* ปุ่มสลับสิทธิ์ขวามือ */}
                <button
                  onClick={() => handleToggleRole(user.id, user.role)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shadow-sm ${
                    user.role === "admin"
                      ? "bg-red-500 text-white hover:bg-red-600 active:scale-95"
                      : "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
                  }`}
                >
                  {user.role === "admin" ? "🔥 Admin" : "👤 User"}
                </button>
              </div>
            ))
          )}
        </div>
        
      </div>
    </div>
  );
}