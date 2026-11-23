# E-commerce Backend

Node.js, Express and MongoDB API with JWT auth, role-based access (admin/user/guest), product CRUD with filter/sort/search, orders, and product recommendations.

## Setup
1. `npm install`
2. Create a `.env` with PORT, MONGO_URI and JWT_SECRET
3. `npm run dev`

## Endpoints
- POST /api/auth/register, POST /api/auth/login
- GET/PUT/DELETE /api/users/me (admin: GET /api/users, PUT /api/users/:id/role, DELETE /api/users/:id)
- GET /api/products?search=&category=&minPrice=&maxPrice=&sort=price_asc|price_desc|name|newest
- POST/PUT/DELETE /api/products (admin)
- POST /api/orders, GET /api/orders/my, GET /api/orders (admin), PUT /api/orders/:id/status (admin)
- GET /api/analytics/recommendations, GET /api/analytics/export (admin, CSV for RapidMiner)