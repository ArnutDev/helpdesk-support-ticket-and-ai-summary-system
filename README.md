# 🎫 Helpdesk Support Ticket Management System

A Full-stack Support Ticket System designed for efficient issue tracking and resolution. Built with **FastAPI** (Python) and **React** (Vite), this project is fully containerized using **Docker Compose** for a "One-Command Setup" experience.

---

## 🌟 Key Features

- **User Authentication:** Secure Login/Register with JWT (JSON Web Tokens).
- **Ticket Management:** Users can create, view, and track their own tickets (UUID-based data isolation).
- **Admin Dashboard:** Staff can manage ticket statuses (Pending, In Progress, Resolved) and see all global tickets.
- **UUID Security:** Uses UUID v4 for all primary keys to prevent ID enumeration attacks.
- **Responsive UI:** Modern design using Tailwind CSS, fully compatible with mobile and desktop.

---

## 🛠️ Tech Stack

| Layer              | Technology                                              |
| ------------------ | ------------------------------------------------------- |
| **Backend**        | FastAPI (Python 3.11), SQLAlchemy, PostgreSQL, Pydantic |
| **Frontend**       | React (Vite), Tailwind CSS, Axios, Lucide Icons         |
| **Database**       | PostgreSQL 15                                           |
| **Infrastructure** | Docker, Docker Compose                                  |

---

## 🚀 Quick Start (Running with Docker)

You can get the entire system up and running with just **one command**.

### 1. Clone the repository

    git clone https://github.com/ArnutDev/helpdesk-support-ticket.git
    cd helpdesk-support-ticket

### 2. Start the system

    docker-compose up --build

### 3. Access the Application

Once the logs show that the services are ready:

- **Frontend (Web UI):** http://localhost:5173
- **Backend API (Swagger Docs):** http://localhost:8000/docs

---

## 🛡️ Administration & Setup

### 🔑 Setting up an Admin User

By default, newly registered users have the `user` role. To grant yourself **Admin** privileges:

1. Register a new account via the Web UI.
2. Run this command in your terminal (Replace `YOUR_USERNAME` with your actual username):

   docker exec -it helpdesk-postgres psql -U postgres -d helpdesk_db -c "UPDATE users SET role = 'admin' WHERE username = 'YOUR_USERNAME';"

### 🔄 Resetting the Database

To clear all data and reset the schema (Fresh Start):

    docker exec -it helpdesk-postgres psql -U postgres -d helpdesk_db -c "DROP TABLE IF EXISTS tickets, users CASCADE;"

---

## 🏗️ Project Structure

    .
    ├── backend/            # FastAPI Source Code & Dockerfile
    ├── frontend/           # React Source Code & Dockerfile
    ├── docker-compose.yml  # Docker Infrastructure Setup
    └── README.md           # Documentation

---
