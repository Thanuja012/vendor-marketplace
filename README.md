# SmartMart

SmartMart is a full-stack multi-vendor marketplace portfolio project. It demonstrates a customer shopping experience, vendor storefront and operations, and an admin control plane backed by a REST API and MongoDB.

> **Portfolio/demo note:** Card checkout is intentionally a mock flow. SmartMart does not connect to a payment gateway, charge cards, or accept/store raw card details.

## Overview

### Problem being solved

Traditional marketplace prototypes often model only product browsing and a simple cart. SmartMart demonstrates the wider workflow required by a multi-vendor platform:

- Customers discover products from multiple vendors.
- Vendors manage their own catalog and order lifecycle.
- Administrators manage users, vendors, products, and platform orders.
- The platform enforces role-based access and calculates order totals on the server.

### Key features

- Product browsing, search, filters, sorting, featured products, recommendations, and public vendor stores
- Customer registration, login, profile, addresses, cart, wishlist, checkout, orders, and reviews
- Vendor dashboard, profile, product management, order management, and store page
- Admin dashboard, user/vendor management, product status management, product CRUD, and order views
- JWT authentication with customer, vendor, and admin roles
- Server-side price, tax, shipping, and total calculation
- COD checkout and clearly labeled mock card checkout
- Notifications for order and vendor events
- Redis-backed product caching with graceful degradation when Redis is unavailable
- Swagger UI API documentation
- Disposable MongoDB-backed integration tests using `mongodb-memory-server`
- Local Docker Compose support for frontend, backend, MongoDB, and Redis

## Architecture

SmartMart is organized as two independently runnable applications:

```text
Browser
   |
   v
React/Vite frontend  --->  Express REST API  --->  MongoDB
                                   |
                                   +-----------> Redis (optional cache)
```

- The frontend owns presentation, routing, Redux state, and API calls.
- The backend owns authentication, authorization, validation, business rules, persistence, totals, and notifications.
- MongoDB stores users, vendors, products, carts, wishlists, orders, reviews, categories, and notifications.
- Redis caches product queries when available. Core functionality continues without it.

## Technology stack

### Frontend

- React 19
- Vite
- React Router
- Redux Toolkit and React Redux
- Axios
- Recharts
- React Hot Toast
- Oxlint

### Backend

- Node.js
- Express
- Mongoose
- MongoDB
- JWT (`jsonwebtoken`)
- `bcryptjs`
- Express Validator
- Helmet, CORS, Morgan, and rate limiting
- ioredis
- Swagger UI Express and Swagger JSDoc
- Jest, Supertest, and MongoDB Memory Server

## Frontend architecture

The frontend is a Vite single-page application:

- `src/App.jsx` defines public, authenticated, vendor, and admin routes.
- Layout components provide the common header, footer, and dashboard shells.
- Redux slices manage authentication, cart, wishlist, notifications, and shared state.
- `src/api/` centralizes Axios configuration and API methods.
- `ProtectedRoute` enforces client-side navigation restrictions. Backend authorization remains authoritative.
- Vite builds the application into `frontend/dist`.

## Backend architecture

The backend follows a route/controller/service/model structure:

- **Routes** define HTTP paths and middleware.
- **Controllers** translate HTTP requests into service calls and responses.
- **Services** contain business logic such as totals, ownership checks, stock updates, and dashboard aggregates.
- **Models** define MongoDB schemas.
- **Middleware** handles JWT authentication, role authorization, validation, and errors.
- `src/app.js` configures middleware, Swagger, routes, and health checks.
- `src/server.js` connects to MongoDB, initializes Redis, and starts the HTTP server.

## Database

MongoDB is the primary datastore. The main collections/models are:

- `User`
- `Vendor`
- `Category`
- `Product`
- `Cart`
- `Wishlist`
- `Order`
- `Review`
- `Notification`

Products reference vendors and categories. Orders snapshot item names, prices, vendors, and quantities so historical orders are not dependent on future catalog changes.

## Authentication and RBAC

Authentication uses JWT bearer tokens:

```http
Authorization: Bearer <token>
```

Passwords are hashed with `bcryptjs`. Inactive users cannot authenticate.

### Roles

| Role | Access |
| --- | --- |
| Customer | Browse products, use cart/wishlist, checkout, view/cancel own orders, and review products from delivered orders |
| Vendor | Manage only their own approved vendor catalog, view relevant orders, update order status, and manage their store profile |
| Admin | Manage users, vendor approval/status, platform products, and platform orders |

Role checks are enforced on the backend with `authenticate` and `authorize` middleware. Frontend route guards improve UX but are not a security boundary.

## REST APIs

The API is mounted under `/api`.

| Area | Routes |
| --- | --- |
| Auth | `/auth/register`, `/auth/login`, `/auth/me`, `/auth/profile`, `/auth/addresses` |
| Products | `/products`, `/products/:id`, `/products/featured`, `/products/:id/recommended`, `/products/:id/reviews` |
| Categories | `/categories` |
| Cart | `/cart` |
| Wishlist | `/wishlist` |
| Orders | `/orders`, `/orders/:id`, `/orders/:id/cancel` |
| Vendor | `/vendor/profile`, `/vendor/dashboard`, `/vendor/products`, `/vendor/orders`, `/vendor/store/:slug` |
| Admin | `/admin/dashboard`, `/admin/users`, `/admin/vendors`, `/admin/products`, `/admin/orders` |
| Notifications | `/notifications` |
| Health | `/health` |

Most mutating and private routes require a JWT. Vendor and admin routes additionally require the matching role.

## Customer workflow

1. Register or log in.
2. Browse products and filter/search the catalog.
3. Open a product detail page, select variants, and add the product to the cart or wishlist.
4. Review cart quantities and totals.
5. Enter or select a shipping address.
6. Choose COD or the demo/mock card option.
7. Place the order.
8. Track the order, cancel eligible orders, and view order history.
9. After delivery, submit a verified review for products in the delivered order.

## Vendor workflow

1. Register with the vendor role.
2. Wait for admin approval.
3. Open the vendor dashboard after approval.
4. Create, update, or delete products belonging to the vendor's own account.
5. Review vendor-related orders.
6. Update order statuses and manage the public store profile.

Vendor product writes are ownership-scoped. A vendor cannot modify another vendor's product.

## Admin workflow

1. Log in with an admin account.
2. Review dashboard metrics.
3. Manage users and toggle user status.
4. Approve, reject, or update vendor status.
5. Create, update, delete, list, and activate/deactivate products across vendors.
6. Review platform orders.

Admin product creation requires an approved target vendor, but the admin does not need to own a vendor account.

## Cart and wishlist

Cart and wishlist data are stored per authenticated user in MongoDB. Cart items retain selected variants and the product price snapshot used for the current cart display. At checkout, the backend re-reads active products and calculates the authoritative order values.

## Checkout and demo payment

COD is stored with:

```text
paymentMethod: cod
paymentStatus: pending
```

The card option is a mock portfolio flow only:

```text
paymentMethod: card
paymentStatus: mock_paid
transactionReference: MOCK-<server-generated-id>
```

The application does not request or store card number, CVV, expiry, or other raw card data. It does not contact a payment provider and does not claim that a real payment was processed.

The backend calculates:

- Item prices from current MongoDB products
- Subtotal
- Shipping fee (`$0` for subtotal at least `$50`, otherwise `$5.99`)
- Tax (8%)
- Final total

Client-supplied totals are not trusted.

## Orders

Orders snapshot line items, vendors, prices, quantities, shipping address, totals, payment metadata, current status, and status history. Creating an order decrements product stock, updates vendor statistics, clears the customer's cart, and creates a notification.

Customers can cancel orders in `placed` or `confirmed` status. Cancellation restores stock. Vendors can update order status for orders containing their products.

## Reviews

Reviews are publicly readable per product. Only authenticated customers can create reviews, and the backend verifies:

- The customer owns the order.
- The product is in that order.
- The order is delivered.
- The customer has not already reviewed the product.

Eligible reviews are marked as verified.

## Notifications

Notifications are stored per user and are created for events such as:

- Order placed
- Order cancelled
- Order status changed
- Vendor status changed
- Seeded welcome notification

The frontend provides notification retrieval and read-state actions.

## Redis caching

Redis caches product list, featured product, and product detail results where configured. If Redis is unavailable, the application logs the issue and continues using MongoDB without cache reads/writes. Redis is an optimization, not a required source of truth.

## Docker

The repository includes:

- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `frontend/nginx.conf`
- `backend/.dockerignore`
- `frontend/.dockerignore`

Compose runs:

- Frontend through Nginx on port `5173`
- Backend on port `5000`
- MongoDB on the internal Compose network
- Redis on the internal Compose network

The backend defaults to `mongodb://mongodb:27017/smartmart` and `redis://redis:6379` in Compose. The frontend build receives its API URL through `VITE_API_URL`.

> Docker CLI validation depends on Docker Desktop/Engine being installed. Run `docker compose config` before starting the stack.

## Environment variables

### Backend

Copy the example file:

```powershell
Copy-Item backend\.env.example backend\.env
```

| Variable | Purpose | Local default |
| --- | --- | --- |
| `PORT` | Backend HTTP port | `5000` |
| `NODE_ENV` | Runtime environment | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smartmart` for local non-Compose use |
| `JWT_SECRET` | JWT signing secret | Set a private value |
| `JWT_EXPIRE` | JWT lifetime | `7d` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` for local non-Compose use |
| `CLIENT_URL` | Allowed frontend origin | `http://localhost:5173` |
| `BCRYPT_ROUNDS` | Password hashing cost | `10` |

Never use the example JWT secret in a real deployment.

### Frontend

Create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000/api
```

For Compose, set `VITE_API_URL` in the shell or an untracked root `.env` file. The browser must be able to resolve the configured URL; use `http://localhost:5000/api` for a browser running on the host.

## Installation

Requirements:

- Node.js 20 or later recommended
- npm
- MongoDB for non-Docker local runs
- Redis is optional for local development

Install dependencies:

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

## Running the frontend

From the repository root:

```powershell
cd frontend
npm run dev
```

## Deploying the frontend to Vercel

The frontend can be deployed as a Vite static site on Vercel.

1. Push the repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, import the repository.
3. Set the project root to `frontend`.
4. Use these build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
   - **Install command:** `npm install`
5. Add the environment variable `VITE_API_URL` with the public backend API URL, for example:

   ```text
   https://api.example.com/api
   ```

6. Deploy the project.

`frontend/vercel.json` provides the SPA rewrite required for direct navigation to React Router routes such as `/products`, `/orders`, `/vendor`, and `/admin`.

The backend must be deployed separately and configured with the Vercel deployment URL in its `CLIENT_URL` environment variable. A frontend deployed to Vercel cannot use `localhost` as its API URL for other users.

Open `http://localhost:5173`.

Production build and preview:

```powershell
npm run build
npm run preview
```

## Running the backend

Start MongoDB locally, configure `backend/.env`, then run:

```powershell
cd backend
npm start
```

Development mode:

```powershell
npm run dev
```

The API is available at `http://localhost:5000/api`. Health check:

```text
GET http://localhost:5000/api/health
```

## Database seeding

The seed script clears the configured database and creates demo users, vendors, categories, products, reviews, a delivered order, and a notification.

> Do not run this against a database containing data you need to keep.

```powershell
cd backend
npm run seed
```

## Running tests

Backend tests use Jest, Supertest, and an isolated MongoDB Memory Server. They do not require a production or local MongoDB instance:

```powershell
cd backend
npm test -- --runInBand
```

Current tests cover authentication, JWT protection, RBAC, product access and ownership, cart, wishlist, order creation/cancellation, payment metadata, admin/vendor authorization, and review eligibility.

## Docker commands

Set a secret before starting:

```powershell
$env:JWT_SECRET = "replace-with-a-long-random-secret"
```

Validate the Compose file:

```powershell
docker compose config
```

Build and start:

```powershell
docker compose up --build
```

Run in the background:

```powershell
docker compose up --build -d
```

View logs:

```powershell
docker compose logs -f backend
docker compose logs -f frontend
```

Stop services:

```powershell
docker compose down
```

Stop services and remove persisted database/cache volumes:

```powershell
docker compose down -v
```

## API documentation / Swagger

When the backend is running, open:

```text
http://localhost:5000/api-docs
```

Swagger UI is generated from route annotations in `backend/src/routes`.

## Demo credentials

After running `npm run seed`, the following accounts are available:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@smartmart.com` | `Demo@1234` |
| Vendor | `vendor@smartmart.com` | `Demo@1234` |
| Customer | `customer@smartmart.com` | `Demo@1234` |

These credentials are for local demonstration only and must not be used in production.

## Project folder structure

```text
smart-vendor/
├── docker-compose.yml
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── .env.example
│   ├── package.json
│   ├── tests/
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── controllers/
│       ├── middleware/
│       ├── models/
│       ├── routes/
│       ├── seed/
│       ├── services/
│       └── utils/
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── api/
        ├── components/
        ├── pages/
        ├── store/
        └── utils/
```

## Security considerations

- Use a strong, unique `JWT_SECRET` outside local demos.
- Never commit `.env` files, credentials, or production secrets.
- Run behind HTTPS in production.
- Keep MongoDB and Redis private; do not expose them publicly without a deliberate security design.
- Treat frontend route guards and client calculations as UX only. Enforce authorization and totals on the backend.
- The mock card flow intentionally does not handle real payment data. A production payment implementation should use a PCI-compliant provider and tokenized payment methods rather than accepting raw card details.
- Review CORS, rate limits, request validation, logging, and error responses before deployment.
- The seed command deletes all data in the configured database; use a dedicated development database.
- Keep dependencies patched and review `npm audit` output before production deployment.
