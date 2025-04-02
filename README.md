# Ahia Gboo Backend

The backend server for Ahia Gboo, an e-commerce platform for African artisans to showcase and sell their traditional crafts.

## API URL

Production: https://ahia-gboo-backend.onrender.com/

## Features

- User Authentication (JWT-based)
- Product Management
- Order Processing
- Artisan Profiles
- File Upload Support
- Input Validation
- Error Handling
- Database Integration (Sequelize with MySQL)

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=5000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=ahia_gboo
JWT_SECRET=your_jwt_secret
```

4. Set up the database:
```bash
# Create the database
mysql -u root -p
CREATE DATABASE ahia_gboo;

# Exit MySQL
exit

# Run migrations
npm run migrate
```

## Available Scripts

- `npm start`: Start the production server
- `npm run dev`: Start the development server with nodemon
- `npm run migrate`: Run database migrations
- `npm run seed`: Seed the database with initial data
- `npm test`: Run tests

## API Endpoints

Base URL: https://ahia-gboo-backend.onrender.com/api

### Authentication
- `POST /auth/register`: Register a new user
- `POST /auth/login`: Login user
- `GET /auth/me`: Get current user profile

### Products
- `GET /products`: Get all products
- `GET /products/:id`: Get single product
- `POST /products`: Create new product (Artisan only)
- `PUT /products/:id`: Update product (Artisan only)
- `DELETE /products/:id`: Delete product (Artisan only)

### Orders
- `GET /orders`: Get user's orders
- `POST /orders`: Create new order
- `GET /orders/:id`: Get order details
- `PUT /orders/:id/status`: Update order status (Admin only)

### Artisans
- `GET /artisans`: Get all artisans
- `GET /artisans/:id`: Get artisan profile
- `PUT /artisans/:id`: Update artisan profile

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

## Database Schema

### Users Table
- id (Primary Key)
- name
- email (Unique)
- password
- role (enum: 'user', 'artisan', 'admin')
- createdAt
- updatedAt

### Products Table
- id (Primary Key)
- name
- description
- price
- category
- imageUrl
- stock
- artisanId (Foreign Key)
- culturalSignificance
- materials
- isActive
- createdAt
- updatedAt

### Orders Table
- id (Primary Key)
- userId (Foreign Key)
- status
- total
- shippingAddress
- paymentMethod
- createdAt
- updatedAt

### OrderItems Table
- id (Primary Key)
- orderId (Foreign Key)
- productId (Foreign Key)
- quantity
- price
- createdAt
- updatedAt

## Security Features

- JWT Authentication
- Password Hashing
- Input Validation
- CORS Configuration
- Rate Limiting
- XSS Protection

## Development Guidelines

1. Follow the existing code style
2. Write meaningful commit messages
3. Update documentation for new features
4. Add tests for new functionality
5. Use proper error handling

## Testing

Run tests with:
```bash
npm test
```

## Deployment

1. Set up environment variables
2. Build the application:
```bash
npm run build
```
3. Start the production server:
```bash
npm start
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Support

For support, email support@ahia-gboo.com or create an issue in the repository.

