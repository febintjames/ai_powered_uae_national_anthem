# Quick Reference - UAE National Anthem Kiosk

## 🚀 Quick Start

```bash
# 1. Install dependencies
cd kiosk_ui
npm install

# 2. Create .env.local
echo "NEXT_PUBLIC_API_BASE_URL=http://localhost:8000" > .env.local

# 3. Start backend (separate terminal)
cd ../UAE_anthem
uvicorn api.main:app --reload --port 8000

# 4. Start frontend
cd ../kiosk_ui
npm run dev

# 5. Open browser
# http://localhost:3000
```

## 📱 User Flow

```
Landing
  ↓ Click "Start Experience"
Avatar Selection (Male/Female/Boy/Girl)
  ↓ Select avatar + Click "Next"
Camera Capture
  ↓ Capture photo → API calls start video + loads quiz
Quiz (10 questions)
  ↓ Answer questions + Submit → Shows score
Processing
  ↓ Polls every 2s until video ready
Video Review
  ↓ Watch video + Click "Next"
QR Code
  ↓ Download video/QR + Click "Finish"
Back to Landing
```

## 🔌 API Endpoints (Backend)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/jobs` | POST | Create video generation job |
| `/api/jobs/{id}` | GET | Check job status (poll this!) |
| `/api/jobs/{id}/qr` | GET | Get QR code image |
| `/api/questions` | GET | Get quiz questions |
| `/api/jobs/{id}/answers` | POST | Submit quiz answers |
| `/healthz` | GET | Health check |

## 📂 Key Files

### API & State
- `app/lib/api.ts` - API client functions
- `app/store/kioskStore.ts` - Zustand state store

### Screens
- `app/page.tsx` - Landing
- `app/avatar-selection/page.tsx` - Avatar selection
- `app/camera/page.tsx` - Camera + API integration
- `app/quiz/page.tsx` - Quiz
- `app/processing/page.tsx` - Processing with polling
- `app/review/page.tsx` - Video review
- `app/qr/page.tsx` - QR code download

### Components
- `app/components/BackgroundWrapper.tsx` - Unified background

## 🎯 State Management

```typescript
// Update avatar
setAvatarType('Male')

// After camera capture
setJobId(job_id)
setQuizQuestions(questions, key)

// During quiz
setQuizAnswer(index, answer)
setQuizScore({ total, correct, score })

// During processing
setProcessingStatus('image' | 'video' | 'completed')
setVideoUrl(url)

// Reset everything
resetStore()
```

## ⏱️ Timing

| Phase | Duration | User Sees |
|-------|----------|-----------|
| Camera | 5-10s | Face capture |
| API Call | <1s | Loading... |
| **Quiz** | **60-120s** | **Questions** |
| **Video (background)** | **90-180s** | **N/A** |
| Processing Screen | 0-60s | Spinner (if video not done) |
| Video Review | 30-60s | Watching video |
| QR Code | 10-30s | Download options |

**Best case**: User takes 2 min on quiz, video is ready immediately after!

## 🔍 Debugging

### Check State
Open browser console (F12):
```javascript
// View current state
localStorage.getItem('kiosk-storage')

// Clear state
localStorage.removeItem('kiosk-storage')
location.reload()
```

### API Logs
Camera screen logs to console:
- "Creating video generation job..."
- "Job created: {job_id}"
- "Loading quiz questions..."
- "Quiz loaded: 10 questions"

Processing screen logs:
- "Job status: { status: 'image' }"
- "Job status: { status: 'video' }"
- "Job status: { status: 'completed', video_url: '...' }"

### Common Issues

**Camera not working**
- Check HTTPS (or localhost)
- Allow camera permissions
- Try Chrome/Edge

**API errors**
- Verify backend running: `http://localhost:8000/healthz`
- Check `.env.local` has correct URL
- Check CORS (should allow * in dev)

**Video stuck processing**
- Check backend console for errors
- Verify WSAI_KEY is set in backend
- Check backend has enough resources

## 📊 Testing Checklist

- [ ] Backend running on :8000
- [ ] Frontend running on :3000
- [ ] Landing page loads
- [ ] Avatar selection works
- [ ] Camera permissions granted
- [ ] Photo capture succeeds
- [ ] Job created (check console)
- [ ] Quiz loads
- [ ] Quiz submission works
- [ ] Processing polls status
- [ ] Video appears (<3 min wait)
- [ ] Video plays
- [ ] QR code displays
- [ ] Download works
- [ ] Finish resets app

## 🎨 Styling

### Colors
- **Emerald**: `#00732F` (UAE Green)
- **Red**: `#FF0000` (UAE Red)
- **Black**: `#000000`

### Tailwind Classes
```
bg-gradient-to-br from-emerald-600 via-black to-red-600
```

## 🛠️ Build Commands

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Lint
npm run lint
```

## 📖 Documentation

- **SETUP.md** - Installation guide
- **README.md** - Project overview
- **API_DOCUMENTATION.md** - All endpoints
- **WORKFLOW_GUIDE.md** - Detailed flow
- **walkthrough.md** - Implementation details

## 💡 Pro Tips

1. **Video takes time**: Set user expectations (1-3 minutes)
2. **Quiz is engagement**: Keeps users busy during processing
3. **Polling is continuous**: Don't stop until completed/failed
4. **Error handling**: Always show user-friendly messages
5. **State persistence**: Use it to recover from refreshes

---

**Need help?** Check the documentation or backend console logs!
