# AI-Powered Offline Train Ticket Booking System

A modern train ticket booking application built with the MERN stack, featuring AI-powered recommendations and offline capabilities.

## Features

- 🔌 Offline-first architecture
- 🤖 AI-powered ticket recommendations
- 🔐 Secure user authentication
- 🎫 Real-time ticket booking
- 💳 Offline payment processing
- 📱 Responsive user interface
- 🔄 Automatic data synchronization

## Tech Stack

- **Frontend**: React.js with Redux for state management
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **AI/ML**: TensorFlow.js for recommendation engine
- **Offline Storage**: IndexedDB
- **Authentication**: JWT with refresh tokens

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd train-ticket-booking
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
PORT=5000

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
```

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd frontend
npm start
```

## Project Structure

```
train-ticket-booking/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── utils/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
└── ai/
    ├── models/
    └── training/
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
