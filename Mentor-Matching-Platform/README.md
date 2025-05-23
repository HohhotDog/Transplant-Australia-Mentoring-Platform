# 🧬 Transplant Australia – Mentor Matching Platform

This is the development environment for the **Transplant Australia Mentoring Platform** – a web-based platform that connects transplant recipients, those awaiting transplantation, caregivers, and living donors with experienced mentors who have navigated similar journeys.

---

## 📦 Tech Stack

| Layer      | Technology                   |
|------------|------------------------------|
| Frontend   | React, Tailwind CSS          |
| Backend    | Node.js, Express.js          |
| Database   | SQLite                        |

---

## 📁 Folder Structure

```yaml
Mentor-Matching-Platform/
├── client/               # React frontend with Tailwind CSS
├── server/               # Node.js + Express backend
└── README.md             # This file
```

## ⚙️ Prerequisites

- [Node.js](https://nodejs.org/) (v16+)
- npm (comes with Node)
- [MySQL](https://www.mysql.com/)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/HohhotDog/Transplant-Australia-Mentoring-Platform.git
cd Transplant-Australia-Mentoring-Platform/Mentor-Matching-Platform
```

### 2. Setup the Frontend (React + Tailwind)

```bash
cd client
npm install
npm start
```
Runs on: `http://localhost:3000`

### 3. Setup the Backend (Node.js + MySQL)

```bash
cd ../server
mkdir data
npm install
node index.js
```
Runs on: `http://localhost:3001`

### 4. Back-end Testing (Jest)

```bash
npm test
```


## 🛠️ Example API

-   `GET /mentors` — Returns list of mentors
