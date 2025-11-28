# How to Run GreenHarvest Application

## Prerequisites
- Node.js (v18 or higher)
- Docker Desktop (for Docker Compose method)
- MongoDB (if running manually)
- Redis (if running manually)
- Python 3.x (for Celery worker, if running manually)

## Option 1: Docker Compose (Recommended - Easiest)

This method runs all services in containers.

### Steps:
1. **Start Docker Desktop** (if not already running)

2. **Navigate to infra directory and start services:**
   ```powershell
   cd infra
   docker compose up --build
   ```

3. **Seed the database** (in a new terminal):
   ```powershell
   node seed/index.js
   ```

4. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:4000
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3000

### Default Login Credentials (after seeding):
- Admin: `admin@greenharvest.io` / `AdminPass123!`
- Farmer: `farmer1@gh.io` / `Farmer123!`
- Customer: `alice@gh.io` / `Customer123!`

---

## Option 2: Manual Setup (Development Mode)

### Step 1: Install Dependencies

```powershell
# Install backend dependencies
npm install --prefix backend

# Install frontend dependencies
npm install --prefix frontend

# Install Python dependencies for Celery worker
pip install -r celery_worker/requirements.txt
```

### Step 2: Start MongoDB and Redis

**Option A: Using Docker (just for databases):**
```powershell
docker run -d -p 27017:27017 --name mongo mongo:7
docker run -d -p 6379:6379 --name redis redis:7
```

**Option B: Install locally:**
- Install MongoDB and start the service
- Install Redis and start the service

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
```

---

## Quick Start Commands Summary

### Docker Compose (Full Stack):
```powershell
cd infra
docker compose up --build
# Then in another terminal:
node seed/index.js
```

### Manual Development:
```powershell
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm run dev

# Terminal 3 (optional)
cd celery_worker
celery -A app.celery_app worker --loglevel=info

# Terminal 4 (seed database)
node seed/index.js
```

---

## Troubleshooting

### Docker Issues:
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





