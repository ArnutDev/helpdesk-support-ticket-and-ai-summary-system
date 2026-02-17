import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

const ProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  if (!isAdmin) {
    // ถ้าไม่ใช่ Admin ให้ดีดไปหน้า Login ทันที
    return <Navigate to="/login" replace />;
  }

  // ถ้าใช่ Admin ให้แสดงหน้า Dashboard (children)
  return children;
};

function App() {
  return (
    <div className="min-h-screen bg-[#343541]">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
