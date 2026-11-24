# E-commerce Backend

A secure REST API built with Node.js, Express and MongoDB. It has JWT authentication, role-based access control (admin, user, guest), product CRUD with filter/sort/search, orders, user profiles, and product recommendations using RapidMiner (Altair AI Studio).

- **Live API:** <<paste your Render link here>>
- **GitHub:** https://github.com/smithsmith8943-blip/ecommerce-backend

## Tech stack
Node.js, Express.js, MongoDB with Mongoose, bcryptjs, jsonwebtoken, dotenv, cors, nodemon, Altair AI Studio (RapidMiner)

## Folder structure
```
ecommerce-backend/
├── index.js
├── config/dbConnection.js
├── models/            user.js, product.js, order.js
├── controllers/       authentication.js, userProfile.js, productController.js,
│                      orderController.js, analyticsController.js
├── routes/            authenticationRoutes.js, userProfileRoutes.js, productRoutes.js,
│                      orderRoutes.js, analyticsRoutes.js
├── middleware/        authMiddleware.js, errorHandler.js, sanitize.js
├── docs/              orders.csv, RapidMiner process and screenshots
├── seed.js            sample data script
├── .env
└── .gitignore
```

## Setup
1. Clone the repo and run `npm install`
2. Create a `.env` file:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=your_long_secret
```
3. Run `npm run dev` (development) or `npm start` (production)

## Security
- Passwords are hashed with bcryptjs (10 salt rounds)
- JWT tokens (7-day expiry) protect all sensitive routes
- Role-based middleware (`authorize`) for admin, user and guest
- Input validation and error handling on all APIs
- Input sanitization removes MongoDB operators (`$`, `.`) from request data
- Nobody can register as admin directly, and admins are promoted in the database

## Roles
| Role | Access |
|---|---|
| guest | Browse and search products |
| user | Guest access, plus own profile, place orders, view own orders, recommendations |
| admin | Everything: product CRUD, all orders and order status, manage users, data export |

## API endpoints

**Auth**
- `POST /api/auth/register` register
- `POST /api/auth/login` login, returns a token

Send the token as `Authorization: Bearer <token>`.

**Users**
- `GET /api/users/me`, `PUT /api/users/me`, `DELETE /api/users/me` own profile
- `GET /api/users` (admin) list users
- `PUT /api/users/:id/role` (admin) change a role
- `DELETE /api/users/:id` (admin) delete a user

**Products**
- `GET /api/products` list with filter, sort, search and pagination
- `GET /api/products/:id` one product
- `POST /api/products` (admin) create
- `PUT /api/products/:id` (admin) update
- `DELETE /api/products/:id` (admin) delete

Query options: `search`, `category`, `minPrice`, `maxPrice`, `sort` (`price_asc`, `price_desc`, `name`, `newest`), `page`, `limit`

Example: `/api/products?search=shoe&category=men&minPrice=10&sort=price_asc`

**Orders**
- `POST /api/orders` place an order (total is calculated on the server, stock is reduced)
- `GET /api/orders/my` own orders
- `GET /api/orders/:id` one order (owner or admin)
- `GET /api/orders` (admin) all orders
- `PUT /api/orders/:id/status` (admin) pending, shipped or delivered
- `DELETE /api/orders/:id` (admin) delete

**Analytics**
- `GET /api/analytics/recommendations` product suggestions for the logged-in user
- `GET /api/analytics/export` (admin) order data as CSV for RapidMiner

## Product recommendations (RapidMiner)
1. An admin exports order data with `GET /api/analytics/export` (saved as `docs/orders.csv`).
2. The data is analysed in Altair AI Studio (RapidMiner) with this process: Select Attributes, Pivot, Replace Missing Values, Numerical to Binominal, Set Role, FP-Growth and Create Association Rules.
3. The process file and screenshots are in the `docs` folder: `rapidminer-process.png` and `rapidminer-rules.png`.
4. `GET /api/analytics/recommendations` applies the same co-purchase idea, suggesting products that other buyers of the same items also bought. It falls back to same-category products, then to the newest products.

## Testing
All endpoints were tested with Thunder Client, including 401 (no token), 403 (wrong role) and invalid login cases.

To load sample data: `node seed.js`

## Author
Smith Suresh