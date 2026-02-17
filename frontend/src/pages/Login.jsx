import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === "admin" && password === "1234") {
      localStorage.setItem("isAdmin", "true");
      navigate("/admin");
    } else {
      alert("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
    }
  };
  const ProtectedRoute = ({ children }) => {
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!isAdmin) {
      // ถ้าไม่ใช่ Admin ให้ดีดไปหน้า Login ทันที
      return <Navigate to="/login" replace />;
    }

    // ถ้าใช่ Admin ให้แสดงหน้า Dashboard (children)
    return children;
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-100">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-800">Admin Login</h2>
          <p className="text-gray-400 mt-2">
            เข้าสู่ระบบเพื่อจัดการตั๋วแจ้งซ่อม
          </p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              required
              className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all"
              placeholder="กรอกชื่อผู้ใช้"
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              required
              className="w-full p-4 border-2 border-gray-100 rounded-2xl outline-none focus:border-blue-500 transition-all"
              placeholder="กรอกรหัสผ่าน"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-95 transition-all">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}
