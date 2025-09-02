# Real-Time Chat Application with Socket.io

A real-time chat application built with **React (frontend)**, **Node.js/Express (backend)**, and **Socket.io** for real-time communication.  
Users can create accounts, join conversations instantly, and participate in public or private chat groups.

---

## 🚀 Features

- User authentication (JWT or username-based)
- Real-time messaging with Socket.io
- Create and join chat groups (public or private)
- Online/offline user status
- Typing indicators
- Private one-to-one messaging
- Real-time notifications (new messages, users joining/leaving)
- File/image sharing (optional)
- Read receipts & message reactions (planned)
- Optimized for desktop and mobile

---

## 📂 Project Structure

### Frontend (React)

socketio-chat/
├── client/ # React front-end
│ ├── public/ # Static files
│ ├── src/ # React source code
│ │ ├── components/ # UI components
│ │ ├── context/ # React context providers
│ │ ├── hooks/ # Custom React hooks
│ │ ├── pages/ # Page components
│ │ ├── socket/ # Socket.io client setup
│ │ └── App.jsx # Main application component
│ └── package.json # Client dependencies


![Frontend directory](client%20dir.png)

### Backend (Node.js/Express)

├── server/ # Node.js back-end
│ ├── config/ # Configuration files
│ ├── controllers/ # Socket event handlers
│ ├── models/ # Data models
│ ├── socket/ # Socket.io server setup
│ ├── utils/ # Utility functions
│ ├── server.js # Main server file
│ └── package.json # Server dependencies
└── README.md # Project documentation


![Backend directory](server%20dir.png)


## 📦 Dependencies

### Frontend
- `react`
- `react-router-dom`
- `socket.io-client`
- `tailwindcss`
- `@heroicons/react`
- `@headlessui/react`
- `axios`

### Backend
- `bcrypt`
- `cors`
- `dotenv`
- `express`
- `jsonwebtoken`
- `mongoose`
- `socket.io`

Install dependencies with:

```bash
# Frontend
cd client
npm install

# Backend
cd server
npm install

## Tasks & Roadmap

Task 1: Project Setup

 Set up Node.js server with Express

 Configure Socket.io (server + client)

 Create React frontend and connect to backend

Task 2: Core Chat Functionality

 User authentication

 Global chat room

 Display messages (with sender & timestamp)

 Typing indicators

 Online/offline user status

Task 3: Advanced Features

 Private messaging

 Multiple chat rooms

 File/image sharing

 Read receipts

 Message reactions

Task 4: Notifications

 New message notifications

 User join/leave notifications

 Unread message count

 Sound & browser notifications

Task 5: Performance & UX

 Message pagination

 Reconnection logic

 Delivery acknowledgments

 Message search

 Mobile responsiveness

🧩 Chat Flow Diagram

📖 Getting Started
# Clone the repository
git clone https://github.com/your-username/socketio-chat.git
cd socketio-chat

# Install dependencies for both client and server
cd client && npm install
cd ../server && npm install

# Start backend
npm run dev

# Start frontend
cd ../client
npm start

📜 License

All rights reserved. © 2025
