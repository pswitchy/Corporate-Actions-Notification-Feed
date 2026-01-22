# Real-Time Corporate Actions Notification Feed

A full-stack application demonstrating real-time updates for corporate action events (Dividends, Stock Splits, Mergers) using Node.js, Socket.io, and Angular 16+.

<img width="1365" height="614" alt="Screenshot 2026-01-22 203709" src="https://github.com/user-attachments/assets/87249a0d-5f0b-44ff-9ecd-5e37694c7a3f" />


## 🚀 Features

- **Real-Time Updates**: Instant push notifications via WebSockets when new events occur.
- **Live Dashboard**: Auto-updating feed of corporate actions with visual distinction for different event types.
- **Notification Center**: Navbar dropdown with unread count badges and toast-like alerts.
- **Event Simulation**: Built-in tools to trigger individual or random corporate actions for testing.
- **Persistence**: Events are saved to a local JSON file database (`lowdb`) and persist across restarts.
- **Responsive Design**: Modern UI built with Tailwind CSS.

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-Time Engine**: Socket.io
- **Database**: LowDB (JSON file-based)
- **Utilities**: `uuid` for ID generation, `cors` for cross-origin support

### Frontend
- **Framework**: Angular 16+ (Standalone Components)
- **Reactivity**: Angular Signals
- **Styling**: Tailwind CSS
- **WebSocket Client**: `socket.io-client`

## 📦 Project Structure

```
.
├── backend/            # Node.js Express Server
│   ├── server.js       # Main server file
│   ├── db.json         # Local database file (auto-created)
│   └── package.json    # Backend dependencies
│
├── frontend/           # Angular Application
│   ├── src/app/        # Source code
│   │   ├── components/ # Dashboard, Notification Center
│   │   ├── services/   # WebSocket & API services
│   │   └── models/     # TypeScript interfaces
│   └── package.json    # Frontend dependencies
└── README.md
```

## ⚡ Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm (Node Package Manager)
- Angular CLI (`npm install -g @angular/cli`)

### 1. Setup Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   *Server runs on `http://localhost:3000`*

### 2. Setup Frontend

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   ng serve
   ```
   *Application runs on `http://localhost:4200` (or `4201` if port is busy)*

## 📖 Usage Guide

1. **Open the App**: Navigate to `http://localhost:4200` in your browser.
2. **Dashboard**: You will see the main dashboard. It connects to the backend automatically.
3. **Simulate Events**:
   - Use the **"Simulate Corporate Action"** panel to trigger events.
   - Click **"💰 Dividend"** to create a dividend event.
   - Click **"🎲 Random Event"** to generate a random action.
4. **Observe Real-Time Updates**:
   - The event card appears instantly in the feed.
   - The notification bell in the top right shows a red badge.
   - Stats at the top update immediately.
5. **Filters**: Click the tabs (Dividends, Splits, Mergers) to filter the feed.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/events` | Retrieve all persisted events |
| `POST` | `/api/simulate-event` | Trigger a new event. Body: `{ "type": "DIVIDEND" }` |
| `DELETE` | `/api/events` | Clear the database (Testing utility) |

## 📡 WebSocket Events

- `connection`: Client connects to server.
- `initial-events`: Server sends existing history to new client.
- `corporate-action`: Server broadcasts a new event to all clients.
- `mark-read`: Client notifies server that an event was read.

## 🤝 Troubleshooting

**(CORS Errors)**: If you see CORS errors in the console, the backend is configured to allow requests from any origin (`origin: *`) or reflects the request origin for development flexibility. Restart the backend server if you change frontend ports.

**"Port in use"**: If port 3000 (backend) or 4200 (frontend) is in use, the tools will usually ask to use a different port (e.g., 3001 or 4201). The application is configured to handle dynamic ports, but check `environment.ts` if connection fails.
