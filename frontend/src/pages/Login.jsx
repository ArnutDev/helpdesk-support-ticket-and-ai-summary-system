import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      const response = await api.post("/auth/login", formData);
      const { access_token, role } = response.data;
      // เก็บ Token ที่ได้จากหลังบ้านลงเครื่อง
      localStorage.setItem("token", access_token);
      localStorage.setItem("role", role); // ยังเก็บไว้ใช้เช็กหน้าเบื้องต้นได้
      if (role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      alert(
        "เข้าสู่ระบบไม่สำเร็จ: " +
          (error.response?.data?.detail || "ลองใหม่อีกครั้ง"),
      );
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
    <div className="min-h-screen flex items-center justify-center bg-[#343541]">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-xl w-80"
      >
        <h2 className="text-2xl font-black mb-6 text-center">LOGIN</h2>
        <input
          type="email"
          placeholder="Email"
          className="w-full mb-4 p-3 border rounded-xl"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full mb-6 p-3 border rounded-xl"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">
          เข้าสู่ระบบ
        </button>
        <div className="mt-4 text-center">
          <Link
            to="/register"
            className="text-sm text-blue-600 hover:underline"
          >
            ยังไม่มีบัญชี? สมัครสมาชิก
          </Link>
        </div>
      </form>
    </div>
  );
}
