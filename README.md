<div align="center">

# 🍕 OrderStream

### Digital Restaurant Order Management System

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)

*A modern, full-stack food ordering system where customers can browse menus, place orders, and track order status in real-time.*

[Features](#features) • [Demo](#demo) • [Installation](#installation) • [Tech Stack](#tech-stack) • [API Documentation](#api-documentation)

</div>

---

## 📋 Table of Contents

- [About The Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Database Schema](#database-schema)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

---

## 🎯 About The Project

**OrderStream** is a comprehensive digital restaurant order management system designed to streamline the food ordering process. Built with the MERN stack (MongoDB, Express.js, React, Node.js), it provides a seamless experience for customers to browse menus, place orders, and track their delivery status in real-time.

---

## ✨ Features

### 👥 Customer Features
- 🔐 **User Authentication** - Secure registration and login with JWT
- 📖 **Menu Browsing** - View all available dishes with images and ratings
- 🔍 **Category Filtering** - Filter menu by Starter, Main Course, Dessert, Drinks
- 🛒 **Shopping Cart** - Add items, update quantities, remove items
- 📦 **Order Placement** - Place orders with delivery address and contact info
- 📊 **Order Tracking** - Track order status (Pending → Preparing → Ready → Delivered)
- 📜 **Order History** - View all past orders with details

### 🔧 Technical Features
- ⚡ **Real-time Updates** - Dynamic cart and order status updates
- 💾 **Data Persistence** - Cart saved in localStorage
- 🔒 **Protected Routes** - Secure authentication and authorization
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- 🎨 **Modern UI/UX** - Clean, intuitive interface with smooth transitions
- ⚠️ **Error Handling** - Comprehensive error messages and validation

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=flat&logo=mongoose&logoColor=white)

### Security & Authentication
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=JSON%20web%20tokens&logoColor=white)
![bcrypt](https://img.shields.io/badge/bcrypt-338FFF?style=flat&logo=security&logoColor=white)

---

## 📁 Project Structure
```
orderstream/
│
├── orderstream-backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # Database connection
│   │   ├── models/
│   │   │   ├── User.js              # User schema
│   │   │   ├── MenuItem.js          # Menu item schema
│   │   │   └── Order.js             # Order schema
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── menuController.js    # Menu operations
│   │   │   └── orderController.js   # Order operations
│   │   ├── routes/
│   │   │   ├── auth.js              # Auth routes
│   │   │   ├── menu.js              # Menu routes
│   │   │   └── orders.js            # Order routes
│   │   ├── middleware/
│   │   │   └── authMiddleware.js    # JWT verification
│   │   └── server.js                # Express server
│   ├── seed.js                      # Database seeding
│   ├── .env                         # Environment variables
│   ├── .gitignore
│   └── package.json
│
├── orderstream-frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── MenuCard.jsx        # Menu item card
│   │   │   └── Footer.jsx          # Footer component
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Landing page
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── Menu.jsx            # Menu listing
│   │   │   ├── Cart.jsx            # Shopping cart
│   │   │   └── Orders.jsx          # Order history
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # Auth state management
│   │   │   └── CartContext.jsx     # Cart state management
│   │   ├── services/
│   │   │   └── api.js              # API service layer
│   │   ├── App.jsx                 # Main app component
│   │   ├── main.jsx                # Entry point
│   │   └── index.css               # Global styles
│   ├── .env                        # Environment variables
│   ├── vite.config.js
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/orderstream.git
cd orderstream
```

### 2️⃣ Backend Setup
```bash
# Navigate to backend folder
cd orderstream-backend

# Install dependencies
npm install

# Create .env file
touch .env

# Add environment variables (see below)

# Seed the database
npm run seed

# Start the server
npm run dev
```

**Backend runs on:** `http://localhost:5000`

### 3️⃣ Frontend Setup
```bash
# Navigate to frontend folder (open new terminal)
cd orderstream-frontend

# Install dependencies
npm install

# Create .env file
touch .env

# Add environment variables (see below)

# Start the development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend `.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/orderstream_db
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

### Frontend `.env`
```env
VITE_API_URL=http://localhost:5000/api

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "phone": "+1234567890",
  "address": "123 Main St, City"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64abc123...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

#### Get User Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

---

### Menu Endpoints

#### Get All Menu Items
```http
GET /menu
```

**Response:**
```json
[
  {
    "_id": "64abc123...",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce and mozzarella",
    "category": "Main Course",
    "price": 12.99,
    "imageUrl": "https://...",
    "rating": 4.5,
    "available": true
  }
]
```

---

### Order Endpoints

#### Create Order
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "items": [
    {
      "menuItemId": "64abc123...",
      "name": "Margherita Pizza",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "totalPrice": 28.97,
  "deliveryAddress": "123 Main St",
  "phone": "+1234567890"
}
```

#### Get User Orders
```http
GET /orders/user
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "64xyz789...",
    "userId": "64abc123...",
    "items": [...],
    "totalPrice": 28.97,
    "status": "pending",
    "deliveryAddress": "123 Main St",
    "phone": "+1234567890",
    "createdAt": "2025-01-04T10:30:00.000Z"
  }
]
```

---

## 📸 Screenshots

### 🏠 Home Page
> Clean landing page with call-to-action and feature highlights

### 📖 Menu Page
> Browse all menu items with category filters and ratings

### 🛒 Shopping Cart
> Manage cart items with quantity controls and order summary

### 📦 Order History
> Track all orders with status indicators and order details

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  address: String,
  role: String (customer/staff/admin),
  createdAt: Date,
  updatedAt: Date
}
```

### MenuItems Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String,
  price: Number,
  imageUrl: String,
  rating: Number,
  available: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Orders Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  items: [
    {
      menuItemId: ObjectId (ref: MenuItem),
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  totalPrice: Number,
  deliveryAddress: String,
  phone: String,
  status: String (pending/preparing/ready/delivered),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🗺️ Roadmap

### ✅ Completed (Half)
- [x] User authentication system
- [x] Menu browsing and filtering
- [x] Shopping cart functionality
- [x] Order placement
- [x] Order history and tracking
- [x] Responsive UI design

### 🚧 In Progress (Next 30%)
- [ ] Admin dashboard for order management
- [ ] Staff panel for order status updates
- [ ] Real-time notifications
- [ ] Advanced search and filters

### 🔮 Future Enhancements (Remaining 30%)
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Review and rating system
- [ ] Coupon and discount system
- [ ] Multi-restaurant support
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] WebSocket for real-time updates

---

## 🎯 Key Learnings

This project demonstrates:
- ✅ Full-stack MERN development
- ✅ RESTful API design
- ✅ JWT authentication and authorization
- ✅ State management with Context API
- ✅ Database modeling with Mongoose
- ✅ Responsive UI development
- ✅ Error handling and validation
- ✅ Git version control

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)
- [MongoDB University](https://university.mongodb.com/)
- [Unsplash](https://unsplash.com/) for food images
- Icons from various open-source libraries

---

## 📊 Project Statistics
```
Total Lines of Code: 2500+
Development Time: 3 weeks
Completion Status: 40%
Features Implemented: 15+
API Endpoints: 10+
Database Collections: 3
```

---

<div align="center">


**OrderStream** © 2025

</div>