import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000', // ตั้งค่า URL หลักของ Backend ไว้ที่นี่
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


export default api;