# 🚗 Vehicle Rental System

## Live URL
- GitHub Repo: https://github.com/alhaz-431/vehicle-rental-system
- Live Deployment: https://vehicle-rental-system-five-psi.vercel.app

## Features
- User Authentication (JWT)
- Role-based Access Control (Admin & Customer)
- Vehicle Management
- Booking System with auto price calculation
- Auto-return expired bookings

## Technology Stack
- Node.js + TypeScript
- Express.js
- PostgreSQL
- bcrypt
- jsonwebtoken (JWT)

## API Endpoints

### Authentication
- POST /api/v1/auth/signup
- POST /api/v1/auth/signin

### Vehicles
- POST /api/v1/vehicles
- GET /api/v1/vehicles
- GET /api/v1/vehicles/:vehicleId
- PUT /api/v1/vehicles/:vehicleId
- DELETE /api/v1/vehicles/:vehicleId

### Users
- GET /api/v1/users
- PUT /api/v1/users/:userId
- DELETE /api/v1/users/:userId

### Bookings
- POST /api/v1/bookings
- GET /api/v1/bookings
- PUT /api/v1/bookings/:bookingId

## Setup Instructions

### 1. Clone the repository
git clone https://github.com/alhaz-431/vehicle-rental-system.git
cd vehicle-rental-system

### 2. Install dependencies
npm install

### 3. Configure environment variables
Create a `.env` file:
PORT=5000
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_secret_key
NODE_ENV=development

### 4. Run the application
npm run dev