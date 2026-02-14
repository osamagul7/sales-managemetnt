# Sales Management Application

A comprehensive, production-ready Sales Management Application built with the MERN stack (MongoDB, Express.js, React.js, Node.js). This application provides complete functionality for managing sales operations, customer relationships, inventory, orders, invoices, and business analytics.

## 🚀 Features

### Core Functionality
- **User Authentication & Authorization**: JWT-based authentication with role-based access control (Admin, Manager, Salesperson)
- **Customer Management**: Complete CRUD operations for customer data with order history tracking
- **Product Management**: Inventory management with stock tracking, low stock alerts, and categorization
- **Order Management**: Full order lifecycle management with status tracking and payment processing
- **Invoice Generation**: Professional invoice creation with PDF export capabilities
- **Dashboard Analytics**: Real-time business metrics, charts, and KPI tracking
- **Reporting System**: Comprehensive sales reports with date filtering and data export

### Technical Features
- **Responsive Design**: Mobile-first design that works seamlessly on all devices
- **Real-time Updates**: Live data synchronization across all modules
- **Role-based Access**: Granular permissions for different user roles
- **Data Validation**: Comprehensive input validation on both frontend and backend
- **Error Handling**: Robust error handling with user-friendly messages
- **Security**: Password hashing, JWT tokens, and protected API routes

## 🛠 Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **express-validator** - Input validation

### Frontend
- **React.js** - UI library (Vite build tool)
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Hook Form** - Form management
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **React Hot Toast** - Notification system
- **Lucide React** - Icon library
- **Day.js** - Date manipulation

## 📁 Project Structure

```
sales-management-app/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable React components
│   │   ├── context/           # React Context (Auth)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── utils/             # Utility functions
│   │   ├── assets/            # Static assets
│   │   ├── App.jsx            # Main App component
│   │   └── main.jsx           # App entry point
│   ├── public/                # Public files
│   ├── package.json
│   └── vite.config.js
├── server/                    # Node.js backend
│   ├── controllers/           # Route controllers
│   ├── middleware/           # Custom middleware
│   ├── models/               # Mongoose models
│   ├── routes/               # API routes
│   ├── utils/                # Utility functions
│   ├── server.js             # Express server
│   ├── seed.js               # Database seeder
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sales-management-app
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/salesdb
   JWT_SECRET=your_super_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   FRONTEND_URL=http://localhost:5173
   ```

5. **Database Setup**
   
   Make sure MongoDB is running on your system, then seed the database:
   ```bash
   cd server
   node seed.js
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd client
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

## 📊 Database Schema

### User Model
- **name**: String (required)
- **email**: String (required, unique)
- **password**: String (required, hashed)
- **role**: String (enum: admin, manager, salesperson)
- **isActive**: Boolean (default: true)
- **timestamps**: Automatic

### Customer Model
- **name**: String (required)
- **email**: String
- **phone**: String
- **address**: Object (street, city, state, zipCode, country)
- **company**: String
- **creditLimit**: Number
- **createdBy**: Reference to User
- **timestamps**: Automatic

### Product Model
- **name**: String (required)
- **description**: String
- **category**: String (required)
- **price**: Number (required)
- **stock**: Number (default: 0)
- **minStockLevel**: Number (default: 10)
- **sku**: String (required, unique)
- **timestamps**: Automatic

### Order Model
- **orderNumber**: String (auto-generated, unique)
- **customer**: Reference to Customer (required)
- **items**: Array of order items
- **subTotal**: Number (required)
- **grandTotal**: Number (required)
- **status**: String (enum: Pending, Processing, Completed, Cancelled)
- **paymentStatus**: String (enum: Unpaid, Partial, Paid)
- **createdBy**: Reference to User
- **timestamps**: Automatic

### Invoice Model
- **invoiceNumber**: String (auto-generated, unique)
- **order**: Reference to Order (required)
- **customer**: Reference to Customer (required)
- **issueDate**: Date (default: current date)
- **dueDate**: Date (required)
- **totalAmount**: Number (required)
- **paidAmount**: Number (default: 0)
- **status**: String (enum: Draft, Sent, Paid, Overdue)
- **createdBy**: Reference to User
- **timestamps**: Automatic

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/change-password` - Change password

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/stats` - Get user statistics

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/:id/orders` - Get customer orders
- `GET /api/customers/stats` - Get customer statistics

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin/Manager)
- `PUT /api/products/:id` - Update product (Admin/Manager)
- `DELETE /api/products/:id` - Delete product (Admin)
- `PUT /api/products/:id/stock` - Update stock (Admin/Manager)
- `GET /api/products/low-stock` - Get low stock products
- `GET /api/products/categories` - Get product categories
- `GET /api/products/stats` - Get product statistics

### Orders
- `GET /api/orders` - Get all orders
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order (Admin)
- `PUT /api/orders/:id/payment` - Add payment to order
- `GET /api/orders/stats` - Get order statistics

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:id` - Get single invoice
- `POST /api/invoices` - Create invoice from order
- `PUT /api/invoices/:id` - Update invoice
- `DELETE /api/invoices/:id` - Delete invoice (Admin)
- `PUT /api/invoices/:id/payment` - Add payment to invoice
- `GET /api/invoices/overdue` - Get overdue invoices
- `GET /api/invoices/stats` - Get invoice statistics

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/monthly-sales` - Get monthly sales data
- `GET /api/dashboard/top-products` - Get top products
- `GET /api/dashboard/order-status` - Get order status breakdown
- `GET /api/dashboard/recent-orders` - Get recent orders
- `GET /api/dashboard/sales-by-category` - Get sales by category
- `GET /api/dashboard/customer-analytics` - Get customer analytics

## 👥 User Roles & Permissions

### Admin
- Full access to all features
- User management (create, update, delete users)
- System configuration
- All CRUD operations on all resources

### Manager
- Manage customers, products, orders, invoices
- View reports and analytics
- Cannot manage other users
- Full CRUD on business resources

### Salesperson
- Manage own customers and orders
- View products (read-only)
- Create and update own orders
- Limited dashboard view (own data only)

## 🎯 Demo Accounts

After running the seed script, you can use these demo accounts:

### Admin Account
- **Email**: admin@salesapp.com
- **Password**: admin123
- **Access**: Full system access

### Manager Account
- **Email**: manager@salesapp.com
- **Password**: manager123
- **Access**: Business management features

### Salesperson Account
- **Email**: sales@salesapp.com
- **Password**: sales123
- **Access**: Sales operations

## 🔧 Development

### Scripts

**Backend (server/)**
```bash
npm run dev      # Start development server with nodemon
npm start        # Start production server
npm run seed    # Seed database with sample data
```

**Frontend (client/)**
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Environment Variables

Create a `.env` file in the server directory:

```env
# Server Configuration
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/salesdb

# JWT Configuration
JWT_SECRET=your_super_secret_key_change_this_in_production
JWT_EXPIRE=7d

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## 📱 Features Overview

### Dashboard
- Real-time KPI cards (Revenue, Orders, Customers, Products)
- Monthly revenue trends chart
- Order status breakdown
- Top-selling products
- Recent orders table
- Low stock alerts

### Customer Management
- Customer directory with search and filtering
- Customer detail pages with order history
- Add/Edit/Delete customers
- Customer statistics and analytics

### Product Management
- Product catalog with categories
- Inventory tracking and management
- Low stock alerts and reorder points
- Product analytics and reporting

### Order Management
- Order creation with customer and product selection
- Order status tracking and updates
- Payment processing and status management
- Order history and reporting

### Invoice Management
- Automatic invoice generation from orders
- Professional invoice layouts
- PDF export functionality
- Payment tracking and status updates

### Reports
- Sales summary reports
- Revenue by product and customer
- Date-range filtering
- Data export capabilities

## 🚀 Deployment

### Production Build

1. **Build frontend**
   ```bash
   cd client
   npm run build
   ```

2. **Configure production environment**
   - Set `NODE_ENV=production`
   - Use production MongoDB URI
   - Set secure JWT secret
   - Configure production CORS settings

3. **Start production server**
   ```bash
   cd server
   npm start
   ```

### Docker Deployment (Optional)

Create `Dockerfile` for production deployment:

```dockerfile
# Backend Dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

1. Check the existing documentation
2. Search through existing issues
3. Create a new issue with detailed information
4. Include error messages, screenshots, and steps to reproduce

## 🎯 Future Enhancements

- [ ] Advanced reporting with custom date ranges
- [ ] Email notifications for orders and invoices
- [ ] Multi-currency support
- [ ] Advanced user permissions
- [ ] API rate limiting
- [ ] Data backup and restore
- [ ] Mobile app development
- [ ] Integration with payment gateways
- [ ] Advanced inventory forecasting
- [ ] Customer portal for self-service

---

**Built with ❤️ for Final Year Project**
#   s a l e s - m a n a g e m e t n t  
 #   s a l e s - m a n a g e m e t n t  
 