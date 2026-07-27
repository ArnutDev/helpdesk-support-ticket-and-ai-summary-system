import axios from 'axios';

console.log("VITE_API_URL loaded in frontend:", import.meta.env.VITE_API_URL);

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // ตั้งค่า URL หลักของ Backend ไว้ที่นี่
});
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token"); // ดึงกุญแจจากเครื่อง
        if (token) {
            config.headers.Authorization = `Bearer ${token}`; // แปะเข้า Header
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      const isLoginPage = window.location.pathname === '/login';

      localStorage.removeItem("token");
      localStorage.removeItem("role"); 
      
      if (!isLoginPage) {
        alert(error.response.data?.detail || "เซสชันของคุณหมดอายุหรือสิทธิ์ไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่");
        window.location.href = "/"; // สั่งกลับไปที่รากหลัก เพื่อให้ React Router คุมต่อ
      }
    }
    
    return Promise.reject(error);
  }
);
export default api;