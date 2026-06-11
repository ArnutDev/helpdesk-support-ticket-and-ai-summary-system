import axios from 'axios';

const api = axios.create({
    baseURL: 'https://helpdesk-support-ticket-329813944956.asia-southeast1.run.app', // ตั้งค่า URL หลักของ Backend ไว้ที่นี่
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
  (response) => response, // ถ้าทำงานปกติ (สเตตัส 200) ปล่อยผ่านไปตามปกติ
  (error) => {
    // เช็คว่าถ้า Error เกิดจากระบบสิทธิ์ (401=กุญแจหมดอายุ, 403=สิทธิ์ไม่ถึง/โดนปลด)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      
      // ล้างข้อมูลเซสชัน
      localStorage.removeItem("token");
      localStorage.removeItem("role"); 
      
      alert(error.response.data?.detail || "เซสชันหมดอายุหรือสิทธิ์ถูกเปลี่ยนแปลง กรุณาเข้าสู่ระบบใหม่");

      window.location.href = "/login"; 
    }
    
    return Promise.reject(error);
  }
);
export default api;