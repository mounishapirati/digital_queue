# College Digital Queue System

A comprehensive digital queue and ordering system for college canteen and xerox services. This system allows students to join digital queues, order food from the canteen with QR code generation, upload documents for xerox services, and track their status in real-time, while providing admin tools for queue and order management.

## 🚀 Features

### Student Features
- **User Registration & Authentication**: Secure student registration and login system with student ID and department
- **Digital Queue Management**: Join queues for canteen and xerox services, view position, and receive real-time updates
- **Canteen Service**: Browse menu items, add to cart, place orders, and receive unique QR codes for food collection
- **Xerox Service**: Upload documents (PDF, DOC, DOCX, Images), specify printing options, and track order status
- **Order Management**: Track food and xerox orders, view order history, and receive notifications
- **Real-time Notifications**: Get notified when it's your turn in queue or when orders are ready
- **Profile Management**: Update personal information, student ID, and department details

### Admin Features
- **Dashboard**: Real-time statistics for both canteen and xerox services
- **Queue Management**: View and manage active queues, call next customers
- **Order Management**: View all orders, update status, and manage order flow for both services
- **Menu Management**: Add, edit, and remove canteen menu items
- **Xerox Management**: Process xerox orders, update status, and manage document printing
- **Reports & Analytics**: Daily reports, popular items, revenue tracking for both services
- **User Management**: View student information and order history

### Technical Features
- **Real-time Updates**: Socket.IO for live queue and order updates
- **QR Code Generation**: Unique QR codes for canteen orders with order details
- **File Upload System**: Secure document upload for xerox services with validation
- **Responsive Design**: Mobile-friendly interface for students and staff
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **API Rate Limiting**: Protection against abuse
- **Cross-browser Support**: Works on Chrome, Firefox, Safari, and Edge

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern React with hooks and functional components
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.IO Client**: Real-time communication
- **React Query**: Server state management
- **React Hook Form**: Form handling and validation
- **React Hot Toast**: Toast notifications
- **React Dropzone**: File upload handling
- **Lucide React**: Modern icon library
- **Framer Motion**: Animation library

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **Socket.IO**: Real-time bidirectional communication
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **Express Validator**: Input validation
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API protection
- **Multer**: File upload handling
- **QRCode**: QR code generation for orders

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd digital_queue
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   
   Create a `.env` file in the server directory:
   ```env
   PORT=5000
   JWT_SECRET=your-secret-key-here
   CLIENT_URL=http://localhost:3000
   ```

4. **Create uploads directory**
   ```bash
   # From server directory
   mkdir -p uploads/xerox
   ```

5. **Start the development servers**
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

### Alternative Setup

You can also run the servers separately:

```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend
cd client
npm start
```

## 🚀 Usage

### For Students

1. **Register/Login**: Create an account with student ID and department or log in
2. **Choose Service**: Select between canteen food ordering or xerox document printing
3. **Canteen Service**:
   - Browse menu items by category
   - Add items to cart and place orders
   - Receive unique QR code for food collection
   - Pay online or at counter
4. **Xerox Service**:
   - Upload documents (PDF, DOC, DOCX, Images)
   - Specify printing options (paper size, color, binding)
   - Place order and track status
5. **Queue Management**: Join digital queues and get real-time position updates
6. **Track Orders**: Monitor order status and receive notifications when ready

### For Admins

1. **Access Admin Panel**: Login with admin credentials
2. **Manage Queues**: View active queues and call next customers
3. **Process Orders**: Update order status for both canteen and xerox services
4. **Manage Menu**: Add, edit, or remove canteen menu items
5. **View Reports**: Access daily statistics and analytics for both services

### Creating an Admin User

To create an admin user for testing, use the API endpoint:

```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@college.com",
    "password": "admin123"
  }'
```

## 📁 Project Structure

```
digital_queue/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── utils/         # Utility functions
│   └── package.json
├── server/                # Node.js backend
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── uploads/          # File uploads directory
│   ├── index.js         # Server entry point
│   └── package.json
├── package.json          # Root package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Queue Management
- `GET /api/queue` - Get all queues
- `POST /api/queue/:queueId/join` - Join queue
- `POST /api/queue/:queueId/leave` - Leave queue
- `GET /api/queue/:queueId/position` - Get queue position

### Canteen Orders
- `GET /api/menu` - Get all menu items
- `POST /api/orders` - Place new canteen order
- `GET /api/orders/my-orders` - Get user orders
- `GET /api/orders/:orderId/qr` - Generate QR code for order
- `PUT /api/orders/:orderId/status` - Update order status

### Xerox Service
- `POST /api/xerox` - Place new xerox order
- `GET /api/xerox/my-orders` - Get user xerox orders
- `GET /api/xerox/:orderId` - Get xerox order details
- `POST /api/xerox/:orderId/cancel` - Cancel xerox order
- `PUT /api/xerox/:orderId/status` - Update xerox order status

### Admin Endpoints
- `GET /api/admin/dashboard` - Get dashboard statistics
- `POST /api/admin/menu` - Add menu item
- `PUT /api/admin/menu/:itemId` - Update menu item
- `DELETE /api/admin/menu/:itemId` - Delete menu item
- `GET /api/admin/reports/daily` - Get daily reports
- `GET /api/xerox/admin/all` - Get all xerox orders

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Input Validation**: Express-validator for data validation
- **File Upload Security**: File type and size validation
- **Rate Limiting**: Protection against API abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet Security**: Security headers and middleware

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, intuitive interface with Tailwind CSS
- **Real-time Updates**: Live queue and order status updates
- **QR Code Display**: Easy-to-scan QR codes for food collection
- **File Upload Interface**: Drag-and-drop file upload for xerox
- **Toast Notifications**: User-friendly notifications
- **Loading States**: Smooth loading indicators
- **Error Handling**: Graceful error handling and user feedback

## 🚀 Deployment

### Backend Deployment
1. Set up environment variables
2. Install dependencies: `npm install`
3. Create uploads directory: `mkdir -p uploads/xerox`
4. Build the application: `npm run build`
5. Start the server: `npm start`

### Frontend Deployment
1. Install dependencies: `npm install`
2. Build the application: `npm run build`
3. Deploy the `build` folder to your hosting service

### Environment Variables
```env
PORT=5000
JWT_SECRET=your-production-secret-key
CLIENT_URL=https://your-domain.com
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🔮 Future Enhancements

- **Payment Integration**: Online payment processing for orders
- **Push Notifications**: Mobile push notifications
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: Detailed reporting and insights
- **Mobile App**: Native mobile applications
- **Integration APIs**: Third-party service integrations
- **Digital Receipts**: Email/SMS receipts for orders
- **Inventory Management**: Stock tracking for canteen items

---

**Built with ❤️ for modern college queue management**
