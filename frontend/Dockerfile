# frontend/Dockerfile
FROM node:22-alpine

WORKDIR /app

# ก๊อปปี้ไฟล์จัดการ Library
COPY package*.json ./

# ติดตั้ง Library (ขั้นตอนนี้สำคัญมาก)
RUN npm install

# ก๊อปปี้โค้ดทั้งหมดเข้า Container
COPY . .

# สั่งรัน Vite และเปิด --host 0.0.0.0
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]