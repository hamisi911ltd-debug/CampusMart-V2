# CampusMart V2

A modern campus marketplace application built with React, TypeScript, and Node.js. Students can buy/sell products, find accommodation, order food, and connect with each other.

## Features

- **Marketplace**: Buy and sell products with categories (books, electronics, fashion, stationery)
- **Accommodation**: Find and list rooms, hostels, and apartments near campus
- **Food Delivery**: Order from campus food vendors
- **User Authentication**: Secure login and registration system
- **Shopping Cart**: Add items to cart and checkout with WhatsApp integration
- **Responsive Design**: Mobile-first design that works on all devices
- **Real-time Notifications**: Stay updated with order status and messages

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Wouter** for routing
- **TanStack Query** for data fetching

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Local JSON Database** for data persistence
- **Zod** for data validation
- **Pino** for logging

## Project Structure

```
CampusMart-V2/
├── artifacts/
│   ├── api-server/          # Backend API server
│   │   ├── src/
│   │   │   ├── routes/      # API routes
│   │   │   ├── lib/         # Utilities and storage
│   │   │   └── middlewares/ # Express middlewares
│   │   └── local-laptop-database.json # Local database
│   └── campusmart/          # Frontend React app
│       ├── src/
│       │   ├── components/  # React components
│       │   ├── pages/       # Page components
│       │   ├── lib/         # Utilities and contexts
│       │   └── styles/      # CSS styles
│       └── public/          # Static assets
└── lib/                     # Shared libraries
    ├── api-client-react/    # React API client
    ├── api-spec/           # API specifications
    └── api-zod/            # Zod schemas
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CampusMart-V2
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development servers**
   
   **Option 1: Using the batch script (Windows)**
   ```bash
   ./run-dev.bat
   ```
   
   **Option 2: Manual start**
   ```bash
   # Terminal 1 - Start API server
   cd artifacts/api-server
   npm run dev
   
   # Terminal 2 - Start frontend
   cd artifacts/campusmart  
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:5173
   - API Server: http://localhost:3001

## Key Features

### Authentication
- User registration and login
- JWT-based authentication
- Role-based access (student, admin)

### Marketplace
- Product listing with images and details
- Category-based browsing
- Search and filter functionality
- Seller contact information

### Shopping Cart & Checkout
- Add/remove items from cart
- Quantity management
- WhatsApp integration for seller communication
- Order tracking

### Accommodation
- Room and hostel listings
- Detailed property information
- Contact landlords directly
- Filter by price, type, and location

### Food Delivery
- Browse food vendors
- Menu with categories
- Order placement and tracking

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove cart item

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order (checkout)

## Development

### Environment Variables
Create `.env` files in both frontend and backend directories:

**Backend (.env)**
```
NODE_ENV=development
PORT=3001
JWT_SECRET=your-jwt-secret
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:3001/api
```

### Database
The application uses a local JSON file (`local-laptop-database.json`) as the database for development. This provides:
- Fast development without database setup
- Data persistence between server restarts
- Easy data inspection and modification

### Building for Production

```bash
# Build backend
cd artifacts/api-server
npm run build

# Build frontend  
cd artifacts/campusmart
npm run build
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact the development team.