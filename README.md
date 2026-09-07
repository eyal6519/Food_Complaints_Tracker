# Food Complaint Process Management System

A mobile-friendly, modern web application built with **Next.js**, **TypeScript**, and **Tailwind CSS** to track, manage, and resolve quality complaint processes between food warehouses and suppliers.

---

## ✨ Features

- 📱 **Mobile-First Responsive UI**: Optimized for iPhone, Android, tablets, and desktop computers.
- ⚡ **Editable Comboboxes**: Auto-suggests existing Categories, Suppliers, and Warehouses, but lets you type new ones on the fly.
- ⏱️ **Automatic Overdue Tracking**: Flags complaints pending for more than 14 days with visual alerts.
- 🔒 **Passcode Protection**: Simple team login screen to secure the app when hosted online.
- 🔍 **Live Search & Filter Tabs**: Instant filtering by status (*Overdue*, *Pending*, *Resolved*), category, supplier, and keyword search.
- 📊 **Statistics Summary**: At-a-glance counters of total, overdue, pending, and resolved complaints.
- 📥 **CSV Export**: 1-click export of all complaint data (with UTF-8 Excel support).
- 💾 **Zero-Configuration Storage**: Portable JSON database stored in `./data/complaints.json`.

---

## 🚀 Quick Start (Running Locally)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

Open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

**Default Passcode**: `admin123`

---

## 📱 How to Access on your Mobile Phone (over local Wi-Fi)

1. Ensure your phone and PC are connected to the same Wi-Fi network.
2. Find your computer's local IP address:
   - On Windows: Run `ipconfig` in the terminal and look for `IPv4 Address` (e.g., `192.168.1.50`).
3. On your phone's browser (Safari or Chrome), visit:
   `http://<YOUR-IP-ADDRESS>:3000` (e.g., `http://192.168.1.50:3000`).
4. **Tip for iPhone/Android**: Tap "Share" / "Menu" -> **"Add to Home Screen"** to install it like a native mobile app!

---

## ☁️ Cloud Deployment (Free Hosting)

### Option 1: Vercel (Recommended)
1. Push this folder to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository and click **Deploy**.
4. *(Optional)* Add an environment variable `APP_PASSWORD` in Vercel project settings to change the default passcode.

### Option 2: Render or Railway
1. Create a Web Service on [Render](https://render.com) or [Railway](https://railway.app).
2. Set Build Command to `npm run build` and Start Command to `npm start`.
3. Set environment variable `PORT=3000` and `APP_PASSWORD=your_custom_password`.

---

## ⚙️ Configuration & Customization

- **Passcode**: You can change the passcode by setting the `APP_PASSWORD` environment variable, or modifying [app/api/auth/route.ts](file:///c:/Users/eyalh/Documents/VibeProjects/EE/app/api/auth/route.ts).
- **Overdue Threshold**: Default is 14 days, configurable in [types/complaint.ts](file:///c:/Users/eyalh/Documents/VibeProjects/EE/types/complaint.ts).
- **Data Location**: Stored safely in `data/complaints.json`.
