# 🛠️ iClassic IT - Backend API & Socket Server (ERP)

This repository contains the backend server for the **iClassic IT ERP System**, powered by **Node.js**, **Express**, **TypeScript**, and **Bun**. It manages database models via MongoDB, handles sessions using dual JWT cookies, and broadcasts real-time chat messages via Socket.io.

---

## 🚀 Key Features

* **REST APIs**: Manages models for Authentication, Products, Sales transactions, Users administration, and Permissions.
* **Socket.io Real-time Chat**: Connects active operators inside a global chat workspace:
  * **Dual-Token Handshake**: Handshake requests verify the user's `accessToken` cookie. If expired or missing, it automatically validates their `refreshToken` against the MongoDB database session cache.
  * **Unified Cookie Parser**: Wraps the existing Express `cookie-parser` directly as a socket middleware, ensuring unified authentication behaviors.
* **Optimized Database Layer**: Utilizes Mongoose `.select()` projections and `.lean()` formats on connections and queries to minimize memory consumption and optimize runtime speed.

---

## 📡 API Endpoints Guide

All REST endpoints are prefixed with `/api`. Protected routes require a valid session (validated automatically via HTTP-only cookies).

### 🔐 Authentication Module (`/auth`)
* `POST /auth/register` (Public): Registers a new account.
* `POST /auth/login` (Public): Validates user credentials and issues authentication cookies.
* `POST /auth/logout` (Protected): Clears session cookies and logs the user out.
* `POST /auth` (Protected): Verifies user auth status and resolves session data (returns guest fallback if not logged in).
* `POST /auth/refresh-access-token` (Protected): Validates the refresh token and issues a new access token.

### 📦 Products Module (`/products`)
* `GET /products` (Protected): Fetches all products (supports pagination, keyword search, and category filters).
* `GET /products/:id` (Protected): Fetches a specific product by ID.
* `POST /products` (Protected): Creates a new product (handles `multipart/form-data` file upload for the product image).
* `PATCH /products/:id` (Protected): Modifies details or the image of an existing product.
* `DELETE /products/:id` (Protected): Deletes the product and clears its image file from storage.

### 🛒 Sales Module (`/sales`)
* `GET /sales` (Protected): Retrieves the history of sales transactions.
* `POST /sales` (Protected): Validates checkout cart and registers a new sale (automatically decreases product stock).

### 💬 Chat Module (`/chat`)
* `GET /chat/messages` (Protected): Fetches the last 100 chat messages chronologically for initial synchronization.

### 📊 Analytics Module (`/analytics`)
* `GET /analytics` (Protected): Fetches key performance metrics, sale totals, and dashboard trends.

### 👤 Users & Roles Module (`/users` & `/roles`)
* `GET /users` (Protected - Admin Only): Fetches all registered user profiles.
* `PATCH /users/:id/role` (Protected - Admin Only): Updates a user's system role.
* `DELETE /users/:id` (Protected - Admin Only): Deletes a user account.
* `GET /roles` (Protected): Fetches active system roles.
* `GET /roles/permissions` (Protected): Fetches the system permissions dictionary.

---

## ⚙️ Environment Variables

Create a `.env` file in the root of the `backend/` directory with the following variables:

```env
# Server execution environment (development | production)
NODE_ENV=development

# Cookie sameSite configuration (lax | strict | none)
SAME_SITE=lax

# URL of the client-side frontend
CLIENT_URL=http://localhost:5173

# Server port
PORT=3000

# MongoDB Database configurations
DB_USERNAME=your_mongodb_username
DB_PASSWORD=your_mongodb_password
DB_NAME=iclassic-it-task
DB_CLUSTER=your_cluster_address.mongodb.net
DB_APP_NAME=your_app_name

# JWT Secrets and Expirations
ACCESS_TOKEN_SECRET=your_jwt_access_token_secret
ACCESS_TOKEN_EXPIRATION=30m
REFRESH_TOKEN_SECRET=your_jwt_refresh_token_secret
REFRESH_TOKEN_EXPIRATION=7d

# Cryptographic parameters
HASH_SALT_ROUNDS=10
```

---

## 💻 Local Installation (Bun / NPM)

Follow these steps to run the server directly on your host machine:

### 1. Install Dependencies
```bash
# Using Bun (Recommended)
bun install

# Or using NPM
npm install
```

### 2. Seed Database (Optional)
This runs the seeding scripts to initialize database schemas and mock records:
```bash
# Using Bun
bun run seed

# Or using NPM
npm run seed
```

### 3. Launch Development Server
Starts the compiler listener and hot-reloads on source changes:
```bash
# Using Bun
bun run dev

# Or using NPM
npm run dev
```
The server will boot and listen at [http://localhost:3000](http://localhost:3000).

### 4. Build Production JS
Compiles TypeScript into compiled JavaScript inside the `dist/` directory:
```bash
# Using Bun
bun run build

# Or using NPM
npm run build
```

---

## 🐳 Docker Installation

The project includes pre-configured `Dockerfile` and `compose.yaml` settings to bundle and run the backend inside containerized virtual machines.

### Prerequisite
* Ensure **Docker Desktop** is open and running on your host machine.

### 1. Launch Container
To build the image locally and start the container in one go:
```bash
docker compose up --build
```
* Docker Compose will read your local `.env` file automatically, map ports `3000:3000` to the host, mount directories for live-reload updates, and run the server.

### 2. Run Container in Background (Detached Mode)
```bash
docker compose up -d --build
```

### 3. Stop Container
To stop and remove containers, networks, and volumes generated during execution:
```bash
docker compose down
```
