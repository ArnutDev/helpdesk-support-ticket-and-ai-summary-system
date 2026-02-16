import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api', // ตั้งค่า URL หลักของ Backend ไว้ที่นี่
});

export default api;