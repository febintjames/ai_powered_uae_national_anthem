# 🚀 How to Start the Backend Server

## Quick Start (Easiest Way)

**Option 1: Use the startup script (Double-click)**

1. Navigate to: `C:\Users\febin\OneDrive\Desktop\avatar\UAE_anthem\`
2. **Double-click** `start-backend.bat`
3. A terminal will open showing the server starting
4. Wait for this message: `Uvicorn running on http://0.0.0.0:8000`

---

## Option 2: Manual Start (Using Terminal)

Open a **new PowerShell terminal** and run:

```powershell
# 1. Navigate to backend directory
cd C:\Users\febin\OneDrive\Desktop\avatar\UAE_anthem

# 2. Activate virtual environment
.venv\Scripts\Activate.ps1

# 3. Start the server
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Option 3: Using Command Prompt

Open a **new Command Prompt** and run:

```cmd
# 1. Navigate to backend directory
cd C:\Users\febin\OneDrive\Desktop\avatar\UAE_anthem

# 2. Activate virtual environment
.venv\Scripts\activate.bat

# 3. Start the server
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

---

## ✅ Verify Backend is Running

Once started, you should see output like:

```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Test it's working:**
1. Open browser: http://localhost:8000/healthz
2. You should see: `{"ok":true,"time":1732800000}`

---

## 🎯 Now You'll Have Both Servers Running

**Terminal 1 - Backend** (port 8000):
```
UAE_anthem> uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend** (port 3000):
```
kiosk_ui> npm run dev
```

**Open in browser:** http://localhost:3000

---

## 🐛 Troubleshooting

### Error: "Unable to create process"
- Make sure you're in the `UAE_anthem` directory
- Make sure virtual environment exists: `.venv` folder should be present

### Error: "Address already in use"
- Port 8000 is already being used
- Stop any existing backend server (Ctrl+C)
- Or change the port: `uvicorn api.main:app --port 8001`

### Error: "Module not found"
- Virtual environment not activated
- Run: `.venv\Scripts\activate.bat` first

---

## 📝 Current Status Check

**Check if backend is running:**
```powershell
curl http://localhost:8000/healthz
```

Should return:
```json
{"ok": true, "time": 1732800000}
```

**If NOT running** → Follow steps above to start it! 🚀
