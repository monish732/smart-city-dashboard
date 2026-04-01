# Smart City Management System

A complete Smart City Management System with a React + Vite frontend and an Express + Node.js backend mapped to a Supabase Postgres realtime database....

## 📂 Folder Structure
```text
smart-city-dashboard/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # UI, Maps, Layouts
│   │   ├── contexts/       # AuthContext, CityDataContext
│   │   ├── lib/            # Supabase client wrapper
│   │   ├── pages/          # Login, UserDashboard, AdminDashboard, BookTicket
│   │   └── App.jsx         # Routes & Protection Logic
│   └── package.jsonī
├── server/                 # Express backend
│   ├── index.js            # API Endpoint routes
│   ├── supabaseClient.js   # Supabase Admin init
│   └── package.json
├── schema.sql              # Supabase Tables & Triggers setup
├── seed.sql                # Initial Mockup Data
└── README.md
```

## 🛠 Supabase Setup Steps
1. Create a new project at [Supabase](https://supabase.com).
2. Navigate to the **SQL Editor** in your Supabase dashboard.
3. Copy the contents of `schema.sql` and run it. This will create all your tables, the user role trigger, and enable Realtime for these tables.
4. Copy the contents of `seed.sql` and run it to populate mock transit and city status data.
5. In Supabase, go to **Authentication > Providers** and ensure Email/Password signup is enabled. Turn off "Confirm email" for testing purposes.
6. Retrieve your `Project URL` and `anon key` from **Project Settings > API**.

## 🚀 How to Run Locally

### 1. Environment Variables Configuration
**Backend (`server/.env`)**
Create or edit `server/.env`:
```
PORT=5000
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
```

**Frontend (`client/.env`)**
Create or edit `client/.env`:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_API_URL=http://localhost:5000
```

### 2. Start the Backend Server
Open a terminal in the `server/` directory:
```bash
cd server
npm install
npm run start # (or just node index.js)
```
*(It should print: `Server running on port 5000`)*

### 3. Start the Frontend App
Open a terminal in the `client/` directory:
```bash
cd client
npm install
npm run dev
```
Visit `http://localhost:5173` (or the port Vite provides) in your browser.

## 👥 Authentication & Roles
- **To Login as a User**: Simply use the sign up form on the login page. Any new user is automatically assigned the `user` role via the Postgres trigger.
- **To Login as an Admin**: Register normally on the frontend. Then go to your Supabase Table Editor, go to the `users` table, and change your user's role string from `user` to `admin`. The UI will instantly recognize you as an Admin upon a fresh login or reload.
