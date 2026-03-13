# CIETM 2026 - Conference Management System

A robust MERN stack application for managing conference registrations, paper submissions, peer reviews, and participant verification.

## 🚀 Deployment Guide (Production)

### 1. Prerequisite Environments
- **Node.js**: v18.0.0 or higher
- **MongoDB**: v6.0 or higher (or MongoDB Atlas)
- **Cloudinary Account**: For manuscript and profile picture storage
- **Brevo Account**: For transactional emails (verification, status updates)
- **Cashfree Account**: For payment processing (optional/if enabled)

### 2. Backend Setup (`/server`)
1. Create a `.env` file based on `.env.example`.
2. Configure all sensitive credentials.
3. Run `npm install` (use `--omit=dev` in production).
4. Run `npm start` to run with Node or use a process manager like `PM2`.

### 3. Frontend Setup (`/client`)
1. Run `npm install`.
2. Update `.env` with the production API URL.
3. Run `npm run build`.
4. The production assets will be generated in `client/dist`.

### 4. Direct/Unified Hosting (SaaS Pattern)
The backend is configured to automatically serve the `client/dist` folder if it exists.
- Point your web server (Nginx/Apache) to the Node.js port (default 5000).
- Ensure the frontend build resides at `../client/dist` relative to `server/index.js`.

---

## 🔒 Security Features
- **Helmet**: Secure HTTP headers.
- **Rate Limiting**: Protection against brute force and DDoS (15-min window).
- **JWT Authentication**: Secure state-less user sessions.
- **RBAC**: Role-Based Access Control (Admin, Chair, Reviewer, Author).
- **Email Verification**: Mandatory verification for all new accounts.

## 🛠️ Optimization Highlights
- **Compression**: Gzip compression for all API responses and static assets.
- **Lazy Loading**: Route-based code splitting in React for fast initial loads.
- **Zipped Downloads**: Efficient bulk manuscript exports for administrators.
- **Auto-Assignment**: Track-based reviewer assignment engine with load balancing.

---

## 👥 Roles & Workflows
- **Author**: Submit drafts, upload manuscripts, track review status, pay fees.
- **Reviewer**: Technical review of assigned papers, update expertise tracks.
- **Chair**: Manage reviewers, final paper status updates, assignment overrides.
- **Admin**: Full system control, analytics, user management, database purging.

---

Created with ❤️ by the CIETM Development Team.
