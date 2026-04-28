<h1 align="center">✨ Full-Stack E-Commerce App (Mobile + Admin + API) ✨</h1>

![Demo App](/admin/public/expo-ecommerce-img.png)

✨ **Highlights:**

- 📱 Fully Functional E-Commerce Mobile App (React Native + Expo)
- 🔐 Secure Authentication with Clerk (Google & Apple sign-in)
- 🛒 Cart, Favorites, Checkout & Orders Flow
- 💳 Paystack-Powered Payments
- 🗺️ Addresses System
- 🏪 Admin Dashboard — Products, Orders, Customers & Stats
- ⚙️ Complete REST API (Node.js + Express) with Auth & Roles
- 🛂 Admin-Only Protected Routes
- 📦 Background Jobs with Inngest
- 🧭 Dashboard with Live Analytics
- 🛠️ Product Management (CRUD, image handling, pricing, etc.)
- 📦 Order Management
- 👥 Customer Management Page
- 🛡️ Sentry Integration for monitoring & error tracking
- 🚀 Deployment on Vercel (API + Admin Dashboard)
- 🖼️ Product Image Slider
- ⚡ Data Fetching & Caching with TanStack Query
- 🧰 End-to-End Git & GitHub Workflow (branches, commits, PRs, code reviews)

---

## 🧪 `.env` Setup

### 🟦 Backend (`/backend`)

```bash
NODE_ENV=development
PORT=7000

DB_URL=<YOUR_DB_URL>

CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
CLERK_SECRET_KEY=<YOUR_CLERK_SECRET_KEY>

INNGEST_SIGNING_KEY=<YOUR_INNGEST_SIGNING_KEY>

CLOUDINARY_API_KEY=<YOUR_CLOUDINARY_API_KEY>
CLOUDINARY_API_SECRET=<YOUR_CLOUDINARY_API_SECRET>
CLOUDINARY_CLOUD_NAME=<YOUR_CLOUDINARY_CLOUD_NAME>

ADMIN_EMAIL=<YOUR_ADMIN_EMAIL>

CLIENT_URL=http://localhost:5173
```

---

### 🟩 Admin Dashboard (/admin)

```bash
VITE_CLERK_PUBLISHABLE_KEY=<YOUR_CLERK_PUBLISHABLE_KEY>
VITE_API_URL=http://localhost:3000/api

VITE_SENTRY_DSN=<YOUR_SENTRY_DSN>
```

---

### 🟧 Mobile App (/mobile)

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY= <YOUR_CLERK_PUBLISHABLE_KEY>

SENTRY_AUTH_TOKEN=<YOUR_SENTRY_DSN>
```

## 🔧 Run the Backend

```bash

cd backend
npm install
npm run dev
```

---

## 🔧 Run the Admin

```
bash
cd admin
npm install
npm run dev
```

---

## 🔧 Run the Mobile

```
bash
cd mobile
npm install
npx expo start
*And then scan the QR Code from your phone*
```
