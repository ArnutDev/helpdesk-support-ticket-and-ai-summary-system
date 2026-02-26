# Helpdesk Support Ticket System

A professional Full-stack Support Ticket Management System built with **FastAPI** (Python) and **React**. This project implements modern web development standards including secure authentication, containerization, and role-based data isolation.

## 🚀 Key Features

- **Authentication & Security:** Secure registration and login using JWT (JSON Web Tokens) and password hashing with `bcrypt`.
- **Role-Based Access Control (RBAC):** Distinct workflows for **Users** (Submit/View own tickets) and **Admins** (Manage all system tickets).
- **Data Isolation:** Implemented logic to ensure users can only access their personal data, preventing unauthorized data exposure.
- **UUID Implementation:** Utilizes **UUID v4** for all primary and foreign keys instead of standard integers to prevent ID enumeration attacks.
- **Interactive Dashboard:** A clean, responsive UI built with **Tailwind CSS** for real-time ticket status updates (Pending, Accepted, Resolved, Rejected).

## 🛠️ Tech Stack

### Backend (Core Logic)

- **FastAPI:** High-performance Python web framework.
- **SQLAlchemy:** ORM for database interactions.
- **PostgreSQL:** Relational database for persistent storage.
- **Docker:** Containerized database environment for consistent development.

### Frontend (UI/UX)

- **React (Vite):** Modern frontend library for a fast user experience.
- **Tailwind CSS:** Utility-first CSS framework for rapid styling.
- **Axios:** Configured with Interceptors to handle global Authentication headers and 401 Unauthorized responses.

## 🏗️ Database Schema

The system uses a relational model with a **One-to-Many** relationship:

- **Users Table:** Stores hashed credentials, usernames, and roles.
- **Tickets Table:** Stores ticket details, linked to the `users` table via `owner_id` (UUID).

## 🔧 Installation & Setup

1. **Clone the project:**
   ```bash
   git clone [https://github.com/ArnutDev/helpdesk-support-ticket.git](https://github.com/ArnutDev/helpdesk-support-ticket.git)
   ```
