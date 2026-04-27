# CampusMart V2 - Campus Marketplace

Production-ready campus marketplace platform.

## Quick Start

```bash
npm install
npm start
```

Server runs on port 3001.

## Deployment

### AWS EC2
```bash
docker build -t campusmart .
docker run -p 80:3001 campusmart
```

### AWS Elastic Beanstalk
```bash
eb init
eb create
eb deploy
```

See [AWS_DEPLOYMENT.md](./AWS_DEPLOYMENT.md) for details.

## API Endpoints

- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add to cart
- `POST /api/orders` - Create order
- `GET /api/health` - Health check

## Features

- User authentication
- Product marketplace
- Shopping cart
- Order management
- WhatsApp integration
- Food ordering
- Room listings
- Responsive design

## Database

JSON file-based storage (database.json). For production, migrate to RDS/DynamoDB.

## License

MIT