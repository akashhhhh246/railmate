# 🚆 RailMate — Personal Train Journey Companion

> A modern, aesthetic, and privacy-first web application designed for Indian Railways commuters and rail enthusiasts. Effortlessly log intercity express trips, track daily suburban EMU commutes, inspect detailed station stops, and discover deep passenger telemetry computed from your real journeys.

---

## ✨ Features

- 🚄 **Intercity & Express Journeys**: Log and manage long-distance train journeys with train number, name, coach, seat/berth, travel class (1A, 2A, 3A, 3E, CC, SL, etc.), PNR, platform, and intermediate scheduled halts.
- ⚡ **Suburban EMU Commuter Mode**: Dedicated suburban transit logging (Chennai Suburban network, South Line, West Line, etc.) with station timeline integration.
- 📊 **Deep Passenger Telemetry**:
  - **Temporal Cadence**: Shortest turnaround, average return cadence, and platform hiatus between journeys.
  - **Corridor Symmetry & Closed-Loop Index**: Bidirectional route balance and pendulum loop ratio.
  - **Chrono-Biological Distribution**: Travel density mapped by day of the week and weekday vs. weekend ratios.
  - **Spatial Entropy**: Shannon entropy calculations of station dispersion and terminal anchor concentration.
  - **Milestone Badges**: Dynamic achievement badges unlocked purely based on actual logged journeys.
- 🔍 **8,900+ Station Autocomplete**: Integrated offline database of official Indian Railway stations with instant search by station code or name.
- ⏳ **Live Boarding Countdown**: Real-time departure clocks, audio cues, and active journey hero cards.
- 🎫 **Waiting List & PNR Tracking**: Track reservation states (Confirmed vs. Waiting List) with berth protection and PNR verification.
- 🎨 **Modern Indian Railways Aesthetic**: Warm sandal accents, deep navy/charcoal glassmorphism, responsive desktop sidebar & mobile navigation.

---

## 🛠️ Tech Stack

- **Frontend**:
  - React 19 + TypeScript
  - Vite
  - Vanilla CSS design tokens with sleek dark glassmorphism
  - Lucide React icons
- **Backend**:
  - Node.js + Express
  - Native Node.js SQLite (`node:sqlite` `DatabaseSync`) — zero external native C++ compilation needed
  - Bundled dataset of 8,900+ Indian Railway stations

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v22+ recommended for native `node:sqlite` support)
- npm or pnpm

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/akashhhhh246/railmate.git
   cd railmate
   ```

2. **Install dependencies**:
   ```bash
   # Install backend dependencies
   cd backend && npm install
   
   # Install frontend dependencies
   cd ../frontend && npm install
   
   cd ..
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```
   This launches both services simultaneously:
   - **Frontend**: [http://localhost:2263](http://localhost:2263)
   - **Backend API**: [http://localhost:2264](http://localhost:2264)

---

## 📂 Project Structure

```
railmate/
├── backend/
│   ├── data/
│   │   ├── stations.json       # 8,900+ Indian Railway station records
│   │   └── railmate.db         # Local SQLite database (auto-created)
│   ├── scripts/
│   │   ├── importStations.js   # Station cache importer
│   │   └── seedJourneys.js     # Sample journey seeder
│   ├── db.js                   # SQLite schema & database migrations
│   ├── index.js                # Express API server (Port 2264)
│   └── routes.js               # REST API endpoints
├── frontend/
│   ├── src/
│   │   ├── components/         # Journey cards, timeline, navigation, modal
│   │   ├── views/              # Dashboard, Journeys, Details, Telemetry
│   │   ├── data/               # Routes, schedules, and train datasets
│   │   ├── App.tsx             # Main application orchestrator
│   │   ├── api.ts              # Frontend API client
│   │   └── index.css           # Design tokens, typography & animations
│   ├── vite.config.ts          # Vite configuration (Port 2263)
│   └── index.html
├── .gitignore                  # Production gitignore rules
├── package.json                # Root workspaces runner
├── start-dev.js                # Cross-platform development supervisor
└── README.md
```

---

## 🧪 Optional: Seed Sample Journeys

To populate realistic sample journeys for demonstration:
```bash
npm run seed
```

---

## 🌐 Deploying to Render (Free Web Service)

Deploy RailMate as a single full-stack web service on Render's free tier:

1. **Create New Web Service**:
   - Connect your GitHub repo: `https://github.com/akashhhhh246/railmate`
   - **Environment**: `Node`
   - **Region**: Any (e.g., Singapore / Frankfurt / Oregon)
   - **Branch**: `main`

2. **Build & Start Commands**:
   - **Build Command**:
     ```bash
     npm --prefix backend install && npm --prefix frontend install && npm --prefix frontend run build
     ```
     *(or simply `npm run build`)*
   - **Start Command**:
     ```bash
     node backend/index.js
     ```
     *(or `npm start`)*

3. **Environment Variables**:
   - `NODE_VERSION`: `22` (Required for built-in `node:sqlite`)

---

## 📜 License

MIT License. Crafted with passion for rail passengers and commuters.
