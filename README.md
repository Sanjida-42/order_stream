<div align="center">

# 🍕 OrderStream

### Digital Restaurant Order Management System

[![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)

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

**OrderStream** is a comprehensive digital restaurant order management system designed to streamline the food ordering process. Built with modern technologies (React, FastAPI, PostgreSQL), it provides a seamless experience for customers to browse menus, place orders, and track their delivery status in real-time.

### 🎓 Project Status
- ✅ **40% Complete** - Core functionality implemented
- 🚀 **Demo-Ready** - Fully functional MVP
- 📚 **Academic Project** - Built for learning and demonstration
- 🔒 **Production-Grade Security** - Argon2 password hashing, JWT authentication

---

## ✨ Features

### 👥 Customer Features
- 🔐 **User Authentication** - Secure registration and login with JWT tokens
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
- 🔐 **Argon2 Hashing** - Industry-leading password security (PHC 2015 winner)
- 📚 **Auto API Docs** - Interactive Swagger UI documentation

---

## 🛠️ Tech Stack

### Frontend
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=flat&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat&logo=axios&logoColor=white)

### Backend
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)
![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-D71F00?style=flat&logo=sqlalchemy&logoColor=white)

### Security & Authentication
![JWT](https://img.shields.io/badge/JWT-000000?style=flat&logo=JSON%20web%20tokens&logoColor=white)
![Argon2](https://img.shields.io/badge/Argon2-4B8BBE?style=flat&logo=security&logoColor=white)

---

## 📁 Project Structure
```
orderstream/
│
├── orderstream-backend-fastapi/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application
│   │   ├── config.py                # Configuration settings
│   │   ├── database.py              # PostgreSQL connection
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # User model (SQLAlchemy)
│   │   │   ├── menu_item.py        # MenuItem model
│   │   │   └── order.py            # Order model
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── user.py             # Pydantic schemas
│   │   │   ├── menu_item.py
│   │   │   └── order.py
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py             # Authentication routes
│   │   │   ├── menu.py             # Menu routes
│   │   │   └── orders.py           # Order routes
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── security.py         # JWT & Argon2 hashing
│   │       └── dependencies.py     # Auth dependencies
│   ├── seed.py                      # Database seeding script
│   ├── requirements.txt             # Python dependencies
│   ├── .env                         # Environment variables
│   └── .gitignore
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
- **Python 3.8+** (for backend)
- **Node.js v16+** (for frontend)
- **PostgreSQL 12+** (database)
- **pip** (Python package manager)
- **npm or yarn** (Node package manager)

---

---

### 2️⃣ PostgreSQL Setup

#### Install PostgreSQL

**Windows:**
```bash
# Download from https://www.postgresql.org/download/windows/
# Or use chocolatey
choco install postgresql
```

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE orderstream_db;

# Create user (optional)
CREATE USER orderstream_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE orderstream_db TO orderstream_user;

# Exit
\q
```

---

### 3️⃣ Backend Setup (FastAPI)
```bash
# Navigate to backend folder
cd orderstream-backend-fastapi

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
touch .env  # or manually create the file

# Add environment variables (see below)

# Seed the database
python seed.py

# Start the server
python run.py
```

**Backend runs on:** `http://localhost:5000`  
**API Docs (Swagger):** `http://localhost:5000/docs`  
**Alternative Docs (ReDoc):** `http://localhost:5000/redoc`

---

### 4️⃣ Frontend Setup (React)
```bash
# Navigate to frontend folder (open new terminal)
cd orderstream-frontend

# Install dependencies
npm install

# Create .env file
touch .env  # or manually create the file

# Add environment variables (see below)

# Start the development server
npm run dev
```

**Frontend runs on:** `http://localhost:5173`

---

## 🔐 Environment Variables

### Backend `.env` (orderstream-backend-fastapi/.env)
```env
# Database Configuration
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/orderstream_db

# JWT Configuration
SECRET_KEY=your_super_secret_jwt_key_change_in_production_min_32_chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
```

### Frontend `.env` (orderstream-frontend/.env)
```env
VITE_API_URL=http://localhost:5000/api
```


## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Interactive Documentation
FastAPI provides **automatic interactive API documentation**:

- **Swagger UI:** `http://localhost:5000/docs`
- **ReDoc:** `http://localhost:5000/redoc`

---

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
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
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City",
    "role": "customer"
  }
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

#### Get User Profile
```http
GET /api/auth/profile
Authorization: Bearer 
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City",
  "role": "customer",
  "created_at": "2025-01-10T10:30:00Z",
  "updated_at": null
}
```

---

### Menu Endpoints

#### Get All Menu Items
```http
GET /api/menu
```

**Response:**
```json
[
  {
    "_id": "1",
    "name": "Margherita Pizza",
    "description": "Classic pizza with tomato sauce, mozzarella, and fresh basil",
    "category": "Main Course",
    "price": 12.99,
    "imageUrl": "images-link()",
    "rating": 4.5,
    "available": true,
    "createdAt": "2025-01-10T10:00:00Z",
    "updatedAt": null
  }
]
```

---

### Order Endpoints

#### Create Order
```http
POST /api/orders
Authorization: Bearer 
Content-Type: application/json

{
  "items": [
    {
      "menuItemId": 1,
      "name": "Margherita Pizza",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "totalPrice": 28.97,
  "deliveryAddress": "123 Main St, City",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "_id": "1",
  "userId": 1,
  "items": [
    {
      "menuItemId": 1,
      "name": "Margherita Pizza",
      "quantity": 2,
      "price": 12.99
    }
  ],
  "totalPrice": 28.97,
  "deliveryAddress": "123 Main St, City",
  "phone": "+1234567890",
  "status": "pending",
  "createdAt": "2025-01-10T11:00:00Z",
  "updatedAt": null
}
```

#### Get User Orders
```http
GET /api/orders/user
Authorization: Bearer 
```

**Response:**
```json
[
  {
    "_id": "1",
    "userId": 1,
    "items": [...],
    "totalPrice": 28.97,
    "status": "pending",
    "deliveryAddress": "123 Main St, City",
    "phone": "+1234567890",
    "createdAt": "2025-01-10T11:00:00Z",
    "updatedAt": null
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

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,  -- Argon2 hashed
  phone VARCHAR NOT NULL,
  address VARCHAR,
  role VARCHAR DEFAULT 'customer',  -- customer/staff/admin
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### Menu Items Table
```sql
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  category VARCHAR NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR,
  rating DECIMAL(3,2) DEFAULT 0.0,
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  items JSONB NOT NULL,  -- Array of order items
  total_price DECIMAL(10,2) NOT NULL,
  delivery_address VARCHAR NOT NULL,
  phone VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'pending',  -- pending/preparing/ready/delivered
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);
```

**Items JSON Structure:**
```json
[
  {
    "menuItemId": 1,
    "name": "Margherita Pizza",
    "quantity": 2,
    "price": 12.99
  }
]
```

---

## 🗺️ Roadmap

### ✅ Completed (40%)
- [x] User authentication system with Argon2 hashing
- [x] Menu browsing and filtering
- [x] Shopping cart functionality
- [x] Order placement
- [x] Order history and tracking
- [x] Responsive UI design
- [x] PostgreSQL database integration
- [x] FastAPI backend with auto-documentation
- [x] JWT token authentication

### 🚧 In Progress (Next 30%)
- [ ] Admin dashboard for order management
- [ ] Staff panel for order status updates
- [ ] Real-time notifications
- [ ] Advanced search and filters
- [ ] Order status update API

### 🔮 Future Enhancements (Remaining 30%)
- [ ] Payment gateway integration (Stripe/PayPal)
- [ ] Email notifications
- [ ] Review and rating system
- [ ] Coupon and discount system
- [ ] Multi-restaurant support
- [ ] Mobile application (React Native)
- [ ] Advanced analytics dashboard
- [ ] WebSocket for real-time updates
- [ ] Database migrations with Alembic

---

## 🎯 Key Learnings

This project demonstrates:
- ✅ Full-stack development (React + FastAPI + PostgreSQL)
- ✅ RESTful API design with FastAPI
- ✅ JWT authentication and authorization
- ✅ Argon2 password hashing (PHC 2015 winner)
- ✅ State management with React Context API
- ✅ Database modeling with SQLAlchemy ORM
- ✅ Pydantic data validation
- ✅ Responsive UI development
- ✅ Error handling and validation
- ✅ Auto-generated API documentation (Swagger/ReDoc)
- ✅ Git version control

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---



## 🙏 Acknowledgments

- [React Documentation](https://react.dev/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [SQLAlchemy Documentation](https://www.sqlalchemy.org/)
- [Pydantic Documentation](https://docs.pydantic.dev/)
- [Unsplash](https://unsplash.com/) for food images
- Icons from various open-source libraries

---

## 📊 Project Statistics
```
Total Lines of Code: 3000+
Development Time: 3 weeks
Completion Status: 40%
Features Implemented: 15+
API Endpoints: 7
Database Tables: 3
Technologies: 8+
```

---

## 🔒 Security Features

- ✅ **Argon2 Password Hashing** - Winner of Password Hashing Competition 2015
- ✅ **JWT Token Authentication** - Secure stateless authentication
- ✅ **SQL Injection Protection** - SQLAlchemy ORM parameterized queries
- ✅ **CORS Configuration** - Restricted cross-origin requests
- ✅ **Input Validation** - Pydantic automatic data validation
- ✅ **Password Requirements** - Minimum length enforcement
- ✅ **Protected Routes** - Authorization middleware
- ✅ **HTTP-Only Tokens** - Secure token storage

---

## 🚀 Performance Optimizations

- ✅ **Database Indexing** - Optimized queries on frequently accessed fields
- ✅ **Connection Pooling** - Efficient database connections
- ✅ **Async Operations** - FastAPI async/await support
- ✅ **Lazy Loading** - React component code-splitting
- ✅ **Cart Persistence** - localStorage caching
- ✅ **Response Caching** - Future enhancement planned

---

<div align="center">


**OrderStream** 


</div>