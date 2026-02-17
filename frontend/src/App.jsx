import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

const RoleProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");
  if (!token) {
    // ถ้าไม่ใช่ Admin ให้ดีดไปหน้า Login ทันที
    return <Navigate to="/login" replace />;
  }
  if (userRole !== allowedRole) {
    // ถ้า role ไม่ตรง ให้ดีดกลับไปหน้าของตัวเอง
    return <Navigate to={userRole === "admin" ? "/admin" : "/"} replace />;
  }

  // ถ้าใช่ Admin ให้แสดงหน้า Dashboard (children)
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-[#343541]">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <RoleProtectedRoute allowedRole="user">
                <Home />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <RoleProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </RoleProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
