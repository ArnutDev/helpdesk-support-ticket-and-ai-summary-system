# 🎫 Helpdesk Support Ticket Management System

A professional Full-stack Support Ticket System designed for efficient issue tracking and resolution. Built with **FastAPI** (Python) and **React** (Vite), this project is fully containerized using **Docker Compose** for a "One-Command Setup" experience.

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

```bash
git clone [https://github.com/your-username/helpdesk-support-ticket.git](https://github.com/your-username/helpdesk-support-ticket.git)
cd helpdesk-support-ticket
```
