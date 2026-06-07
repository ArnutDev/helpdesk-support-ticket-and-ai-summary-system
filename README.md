# 🎫 Helpdesk Ticket & AI Summary System

ระบบจัดการตั๋วแจ้งซ่อมและซัพพอร์ต (Helpdesk Ticket) พร้อมระบบคัดกรองสิทธิ์ (RBAC) พัฒนาในรูปแบบ Full-Stack Application รองรับการรันผ่าน Docker Compose

## 👥 User Roles & Permissions (การแบ่งสิทธิ์ผู้ใช้งาน)

ระบบมีการควบคุมสิทธิ์การเข้าถึงข้อมูลและฟังก์ชันต่าง ๆ (Role-Based Access Control) แยกออกจากกันเด็ดขาดระหว่าง 2 กลุ่มผู้ใช้งานหลัก

### 1. 🧑‍💻 ฝั่งผู้ใช้งานทั่วไป (User / Employee)
- **การเข้าถึงหน้าเว็บ:** สามารถเข้าถึงหน้าสร้างตั๋ว (Create Ticket) และดูรายการตั๋วของตัวเองได้เท่านั้น โดยการ register และ login
- **สิทธิ์การทำงาน (Permissions):** - สร้างตั๋วแจ้งซ่อม/สอบถามข้อมูลใหม่เข้าสู่ระบบได้
  - ติดตามสถานะตั๋วปัจจุบันของตัวเองได้แบบ Real-time

### 2. 🛡️ ฝั่งผู้ดูแลระบบ (Admin / Support Team)
- **การเข้าถึงหน้าเว็บ:** สามารถเข้าถึงหน้าแผงควบคุมหลัก (Admin Dashboard) เพื่อดูภาพรวมตั๋วทั้งหมดในระบบ โดย login ผ่าน email, password ที่กำหนดไว้ใน .env
- **สิทธิ์การทำงาน (Permissions):**
  - มองเห็นตั๋วแจ้งซ่อมทั้งหมดที่ยูสเซอร์ทุกคนส่งเข้ามา
  - มีสิทธิ์สับสวิตช์เปลี่ยนสถานะตั๋ว (`Pending`, `Accepted`, `Rejected`, `Resolved`) 
  - เรียกใช้ระบบ AI Summary เพื่อช่วยสรุปข้อมูลตั๋วในระบบ 7 วันที่ผ่านมา

## 🛠️ Tech Stack & Architecture
- **Backend:** Python (FastAPI), SQLAlchemy, Pydantic, Pytest
- **Frontend:** React (Vite), Axios, TailwindCSS
- **Database:** PostgreSQL 15
- **DevOps:** Docker

---

## 🚀 Getting Started (วิธีรันระบบ)

### 🔑 สเต็ปที่ 1: ตั้งค่า Environment Variables (.env)
เนื่องจากโปรเจคนี้มีการใช้ข้อมูลความลับ (เช่น API Key ของ AI และรหัสผ่านแอดมิน) **จำเป็นต้องสร้างไฟล์ `.env` ไว้ในโฟลเดอร์ `backend/` ก่อนเริ่มรันระบบ** โดยทำตามขั้นตอนดังนี้:

1. เข้าไปที่โฟลเดอร์ `backend/`
2. คัดลอกไฟล์ต้นแบบ `.env.example` แล้วเปลี่ยนชื่อเป็น `.env`
3. เปิดไฟล์ `.env` แล้วกรอกข้อมูลจริง (สามารถรับ API Key ของ OpenTyphoon AI ได้ที่เว็บไซต์ [https://playground.opentyphoon.ai/](https://playground.opentyphoon.ai/))

### 🐳 สเต็ปที่ 2: สั่งรันระบบผ่าน Docker Compose
กลับมาที่โฟลเดอร์นอกสุดของโปรเจค (ระดับเดียวกับไฟล์ `docker-compose.yml`) แล้วรันคำสั่งเพื่อบิวด์และสตาร์ทคอนเทนเนอร์ทั้งหมดขึ้นมาพร้อมกัน:

```bash
docker compose up --build -d
```

### 📍 Network Ports ที่เปิดใช้งาน

| บริการ (Service) | แพลตฟอร์ม (Tech) | URL / Port |
| :--- | :--- | :--- |
| **Frontend** | React (Vite) | [http://localhost:5173](http://localhost:5173) |
| **Backend API** | FastAPI | [http://localhost:8000](http://localhost:8000) |
| **Main Database** | PostgreSQL | Port `5432` |
| **Test Database** | PostgreSQL | Port `5433` |


## 🗂️ Project Structure (โครงสร้างไฟล์ทั้งหมดในโปรเจค)

```text
├── backend/
│   ├── app/
│   │   ├── api/             # Route จัดการ Logic ล็อกอิน, ตั๋ว และ AI Summary
│   │   ├── test/            # สคริปต์ Pytest และ conftest.py (ตู้ดีบีจำลองสำหรับเทส)
│   │   ├── database.py      # ตัวเชื่อมต่อ SQLAlchemy engine และ SessionLocal
│   │   ├── models.py        # โครงสร้างตารางฐานข้อมูลหลัก (User, Ticket Tables)
│   │   ├── schemas.py       # Pydantic Models สำหรับ Validation ข้อมูล API Input/Output
│   │   └── main.py          # จุดเริ่มต้น FastAPI App, เปิดใช้งาน CORS และรวม Routers
│   ├── .env.example         # ไฟล์ตัวอย่างโครงสร้าง .env 
│   ├── Dockerfile           # คำสั่งบิวด์ Environment ของ Python หลังบ้าน
│   └── requirements.txt     # รายชื่อ Libraries/Dependencies ทั้งหมดที่หลังบ้านใช้
│
├── frontend/
│   ├── src/
│   │   ├── components/      # UI Components
│   │   ├── pages/           # หน้าเว็บหลักของระบบ 
│   │   └── services/        # ฟังก์ชันติดต่อหลังบ้าน ยิง API ด้วย Axios 
│   ├── Dockerfile           # คำสั่งบิวด์สภาพแวดล้อมหน้าบ้าน
│   └── package.json         # รายชื่อ Dependencies ของฝั่งหน้าบ้าน
│
└── docker-compose.yml       # ไฟล์ศูนย์กลางควบคุมการบิวด์, มัดรวม Network และพอร์ต Databases ทั้งหมด
```