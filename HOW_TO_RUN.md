# How to Run GreenHarvest Application

## Prerequisites
- Node.js (v18 or higher)
- Docker Desktop (for Docker Compose method)

## Setup (First Time Only)

**Option 1: Automatic Setup (Windows)**
Double-click the `setup.bat` file in the root directory. This will install all necessary libraries for you.

**Option 2: Manual Setup**
If you prefer to do it manually, run these commands:

```bash
# 1. Install root dependencies
npm install

# 2. Install backend dependencies
cd backend
npm install
cd ..

# 3. Install frontend dependencies
cd frontend
npm install
cd ..
```

## Option 0: One-Click Start (Windows)

Simply double-click the `start_app.bat` file in the root directory.
This script will:
1.  Check dependencies.
2.  Seed the database.

### Step 3: Configure Environment (Optional)

Create a `.env` file in the root directory if you need custom settings:
```
PORT=4000
MONGO_URI=mongodb://localhost:27017/greenharvest
REDIS_URL=redis://localhost:6379/0
CORS_ORIGIN=http://localhost:5173
JWT_ACCESS_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

**Note:** The application has default values, so this step is optional for development.

### Step 4: Start Services

**Terminal 1 - Backend:**
```powershell
cd backend
npm run dev
```
Backend will run on http://localhost:4000

**Terminal 2 - Frontend:**
```powershell
cd frontend
npm run dev
```
Frontend will run on http://localhost:5173

**Terminal 3 - Celery Worker (Optional):**
```powershell
cd celery_worker
celery -A app.celery_app worker --loglevel=info
```

### Step 5: Seed the Database

In a new terminal:
```powershell
node seed/index.js

---

## Troubleshooting

### Docker Issues:
- **"context deadline exceeded" / "load metadata error"**:
    -   **Cause**: Your internet or firewall is blocking Docker from downloading images.
    -   **Fix**: Run `troubleshoot.bat` to diagnose.
    -   **Solution**: Disconnect from VPN, try a mobile hotspot, or restart Docker Desktop.
- **"Docker Desktop not running"**: Start Docker Desktop application
- **Port conflicts**: Make sure ports 4000, 5173, 27017, 6379, 9090, 3000 are not in use
- **Build errors**: Try `docker compose down` then `docker compose up --build`

### Manual Setup Issues:
- **MongoDB connection error**: Ensure MongoDB is running on port 27017
- **Redis connection error**: Ensure Redis is running on port 6379
- **Module not found**: Run `npm install` in backend and frontend directories

---

## Testing

Run backend tests:
```powershell
cd backend
npm test
```

---

## Stopping the Application

### Docker Compose:
```powershell
cd infra
docker compose down
```

### Manual Setup:
Press `Ctrl+C` in each terminal running the services.






