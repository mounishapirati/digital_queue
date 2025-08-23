# Digital Queue System - Setup Guide

## 🚀 Quick Start

This guide will help you set up and run the Digital Queue System with MongoDB database.

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB Installation

1. **Download MongoDB Community Server** from [mongodb.com](https://www.mongodb.com/try/download/community)
2. **Install MongoDB** following the installation wizard
3. **Start MongoDB service**:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

### Option 2: MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account and cluster
3. Get your connection string
4. Update `server/.env` with your Atlas connection string

### Option 3: Docker (Recommended for Development)

```bash
# Pull and run MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:latest

# Check if running
docker ps
```

## 🔧 Installation

### 1. Clone and Install Dependencies

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
cd ..
```

### 2. Environment Configuration

```bash
# Copy environment file
cd server
copy env.example .env
```

Edit `server/.env`:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/digital_queue
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/digital_queue
```

### 3. Database Setup

```bash
# Test database connection
cd server
node test-db.js

# Seed database with initial data
npm run seed
```

Expected output:
```
✅ MongoDB connection successful!
Database: digital_queue
Host: localhost
Port: 27017
Connection closed successfully

Database seeding completed successfully!
Default login credentials:
Admin: admin@college.com / admin123
Student: student@college.com / student123
```

## 🚀 Running the Application

### 1. Start the Backend Server

```bash
cd server
npm run dev
```

Expected output:
```
Server running on port 5000
Health check: http://localhost:5000/api/health
Database connected successfully!
```

### 2. Start the Frontend Client

```bash
cd client
npm start
```

Expected output:
```
Compiled successfully!
Local: http://localhost:3000
```

### 3. Run Both Simultaneously (from root)

```bash
npm run dev
```

## 🧪 Testing the System

### 1. Health Check

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{"status":"OK","timestamp":"2025-08-22T17:53:28.875Z"}
```

### 2. Database Connection Test

```bash
cd server
node test-db.js
```

### 3. Frontend Access

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Default Login Credentials

After seeding the database:

- **Admin User:**
  - Email: `admin@college.com`
  - Password: `admin123`

- **Student User:**
  - Email: `student@college.com`
  - Password: `student123`

## 📁 Project Structure

```
digital_queue/
├── server/                 # Backend server
│   ├── config/            # Database configuration
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── uploads/           # File uploads
│   ├── index.js           # Main server file
│   ├── seed.js            # Database seeder
│   └── test-db.js         # Database connection test
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   └── App.js         # Main app component
│   └── package.json
├── package.json            # Root package.json
└── README.md              # Project documentation
```

## 🗄️ Database Models

### User Model
- Authentication (email/password)
- Role-based access (student/admin)
- Profile information
- Order history

### MenuItem Model
- Food items for canteen
- Service type classification
- Pricing and availability

### Order Model
- Canteen orders
- Order status tracking
- QR code generation
- Payment information

### XeroxOrder Model
- File uploads
- Printing specifications
- Order status tracking

### Queue Model
- Queue management
- Customer tracking
- Service type separation

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### Menu
- `GET /api/menu` - Get all menu items
- `GET /api/menu/category/:category` - Get items by category
- `GET /api/menu/service/:serviceType` - Get items by service type

### Orders
- `POST /api/orders` - Place new order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:orderId/qr` - Generate QR code

### Xerox Service
- `POST /api/xerox` - Place xerox order
- `GET /api/xerox/my-orders` - Get user xerox orders
- `PUT /api/xerox/:orderId/status` - Update order status

### Queue Management
- `GET /api/queue` - Get available queues
- `POST /api/queue/:queueId/join` - Join queue
- `POST /api/queue/:queueId/leave` - Leave queue

### Admin Routes
- `GET /api/admin/dashboard` - Admin dashboard stats
- `POST /api/admin/menu` - Add menu item
- `GET /api/admin/reports/daily` - Daily reports
- `GET /api/admin/users` - User management

## 🐛 Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running:**
   ```bash
   # Windows
   net start MongoDB
   
   # Check MongoDB status
   mongo --eval "db.serverStatus()"
   ```

2. **Verify connection string:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/digital_queue
   ```

3. **Test connection:**
   ```bash
   cd server
   node test-db.js
   ```

### Port Conflicts

1. **Check if ports are in use:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   netstat -ano | findstr :3000
   
   # Kill process if needed
   taskkill /PID <PID> /F
   ```

2. **Change ports in .env files if needed**

### File Upload Issues

1. **Check uploads directory:**
   ```bash
   # Create directories if missing
   mkdir -p server/uploads/xerox
   ```

2. **Verify file permissions**

## 🚀 Production Deployment

### Environment Variables
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production MongoDB URI
- Set proper `CLIENT_URL`

### Security
- Enable HTTPS
- Configure CORS properly
- Set up rate limiting
- Use environment-specific secrets

### Database
- Use MongoDB Atlas or production MongoDB instance
- Set up database backups
- Configure connection pooling

## 📚 Additional Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://reactjs.org/)
- [Socket.IO Documentation](https://socket.io/)

## 🤝 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Verify all prerequisites are met
3. Check console logs for error messages
4. Ensure MongoDB is running and accessible

---

**Happy Coding! 🎉**
