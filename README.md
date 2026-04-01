# 🏙️ Smart City Dashboard: Neural Urban Hub

A high-performance, real-time urban intelligence platform for seamless monitoring and management of city infrastructure, transport and essential services.

---

## 🌟 Key Features

### 👤 Citizen Portal (User)
- **Live Infrastructure Map**: Real-time monitoring of traffic congestion and service node health.
*   **Smart Mobility**: Integrated parking management with **automated fee calculation** and a seamless **UPI checkout** redirect.
*   **Emergency Dispatch**: Dedicated SOS triggering system that alerts city admins instantly via WebSockets.
*   **Utility Insights**: Live tracking of Water Flow, Grid Consumption, and Climate Statistics via high-performance AreaCharts.
*   **Neural AI Assistant**: An embedded LLM-powered chat interface focused on city-specific utility queries.

### 👨‍💼 Operation Control (Admin)
*   **Global Metrics Bar**: Instant oversight of daily bookings, total revenue, and city-wide alerts.
*   **Advanced Transport Analytics**: Real-time revenue tracking and occupancy monitoring for Bus, Metro, and Public Bike networks.
*   **Traffic Optimization**: Interactive route optimization engine to resolve congestion at major city nodes.
*   **Security Console**: Centralized oversight of active/inactive CCTV cameras and automated service alerts.

---

## 🛠️ Technical Ecosystem

### Frontend: The Command Center
- **Framework**: React.js 18 (Vite)
- **Styling**: Tailwind CSS with custom **Glassmorphism** depth effects.
- **Visuals**: `Recharts` for telemetry and `Lucide React` for high-fidelity iconography.
- **Geospatial**: `React Leaflet` for real-time GIS node visualization.
- **Navigation**: `React Router v6` with role-based route protection.

### Backend: The City Brain
- **Engine**: **FastAPI (Python 3.x)** - Chosen for asynchronous speed and performance.
- **Heartbeat**: A continuous `asyncio` simulation loop that recalculates city dynamics every 1,000ms.
- **Real-time Sync**: **Socket.io (WebSockets)** for instant "push" events (SOS, Bookings, Parking).
- **Architecture**: Stateless RESTful API design with integrated simulation state management.

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.9+
- Node.js 16+
- npm or yarn

### 2. Backend Setup
```bash
cd server
pip install -r requirements.txt
uvicorn main:socket_app --reload --port 8000
```
*Backend will run at: `http://localhost:8000`*
*API Docs available at: `http://localhost:8000/docs`*

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*Dashboard will run at: `http://localhost:5173`*

---

## 🏗️ Project Architecture

A robust, decoupled architecture separating the **Data Simulation Layer** from the **Visual Intelligence Layer**:

```text
smart-city-dashboard/
├── client/                          # React + Frontend Ecosystem
│   ├── src/
│   │   ├── components/              # Modular UI Atomic Elements
│   │   │   ├── Map/
│   │   │   │   └── CityMap.jsx      # Leaflet Geospatial Logic
│   │   │   ├── Layout/
│   │   │   │   ├── Layout.jsx       # Base structural wrapper
│   │   │   │   └── Navbar.jsx       # Side-navigation routing
│   │   │   └── UI/
│   │   │       ├── Button.jsx       # Glassmorphic Base Button
│   │   │       └── Card.jsx         # Telemetry Data container
│   │   ├── contexts/                # Global Neural State Management
│   │   │   ├── AuthContext.jsx      # Role-Based Security & JWT Logic
│   │   │   └── CityDataContext.jsx  # Shared Simulation Data Stream
│   │   ├── pages/                   # Feature-Rich City Portals
│   │   │   ├── Auth/
│   │   │   │   └── Login.jsx        # Modern Session Entry
│   │   │   ├── Dashboard/
│   │   │   │   ├── AdminDashboard.jsx # Operation Control Center
│   │   │   │   ├── UserDashboard.jsx  # Citizen Service Hub
│   │   │   │   └── BookTicket.jsx     # Transit Reservation Portal
│   │   │   └── Services/
│   │   │       ├── Payment.jsx      # Secured Neural Checkout
│   │   │       └── Confirmation.jsx # Transaction Receipt Logic
│   │   ├── App.jsx                  # Main RBAC Multi-Route Integrated Hub
│   │   ├── main.jsx                 # Client Entry Point
│   │   └── index.css                # Global Glassmorphic CSS Variables
│   └── package.json                 # Node.js dependencies & scripts
│
├── server/                          # Python + Backend Neural Engine
│   ├── main.py                      # API Gateway (REST + Socket.io Server)
│   ├── simulation.py                # City Brain (Heartbeat & Logic Engine)
│   ├── seed.sql                     # Legacy Initial Data seeding
│   ├── schema.sql                   # Database Structure Blueprint
│   └── requirements.txt             # Python Package Manifest (FastAPI/Sio)
│
└── README.md                        # Project Documentation & Architecture
```

---

## 🎨 Visual Identity & UI Standards
The dashboard utilizes a **Frosted Glass (Glassmorphism)** aesthetic, featuring:
- Semi-transparent backdrop-blur layers.
- High-contrast typography for mission-critical data.
- Harmonic color palettes (Emerald for Health, Rose for Alerts, Indigo for Services).

---
*Developed as a next-generation blueprint for urban resiliency and responsive governance.*
