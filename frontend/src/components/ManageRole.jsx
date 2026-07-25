import { useState, useEffect } from "react";
import api from "../services/api";

export default function ManageRole({ onClose, onRefresh }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await api.get("/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error("Fetch users error:", error);
      alert(error.response?.data?.detail || "Could not retrieve user directory.");
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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200) {
        setUsers((prevUsers) =>
          prevUsers.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        if (onRefresh) onRefresh();
      }
    } catch (error) {
      alert(error.response?.data?.detail || "An error occurred while updating the role.");
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl p-7 w-full max-w-md shadow-2xl shadow-slate-950/20 border border-slate-100 flex flex-col max-h-[85vh] transform transition-all duration-300 scale-100 animate-scale-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">System Directory</h2>
            <p className="text-[11px] text-slate-400 font-bold mt-0.5">Manage user access control roles</p>
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

        {/* User list */}
        <div className="overflow-y-auto flex-grow pr-1.5 space-y-3.5 scrollbar-thin">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <svg className="animate-spin h-6 w-6 text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span className="text-xs font-bold">Loading system directory...</span>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-slate-450 font-bold text-xs">
              No users registered in system.
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-150/70 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3 truncate mr-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center font-black text-indigo-700 text-xs shrink-0 shadow-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-slate-800 text-[13px] truncate">
                      {user.username}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold truncate">
                      {user.email}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleRole(user.id, user.role)}
                  className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 cursor-pointer select-none shrink-0 ${
                    user.role === "admin"
                      ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-indigo-50 hover:bg-indigo-100 text-indigo-750 border border-indigo-200"
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