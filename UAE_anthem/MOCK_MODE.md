# Mock Mode - Quick Testing Guide

## What is Mock Mode?

Mock Mode allows you to test the entire kiosk flow **in just 5 seconds** instead of waiting 2+ minutes for real AI video generation.

## How to Enable

Add this line to your `.env` file in the `UAE_anthem` directory:

```env
MOCK_MODE=true
```

## How it Works

When `MOCK_MODE=true`:

1. **Camera capture** → Still uploads your photo
2. **Image generation** → Skipped (uses placeholder image) - **2 seconds**
3. **Video generation** → Skipped (uses sample video) - **3 seconds**  
4. **Quiz & Puzzle** → Work normally
5. **Processing page** → Shows progress for ~5 seconds total
6. **Review page** → Plays a sample "Big Buck Bunny" video

### Timeline with Mock Mode:
- **Total backend processing**: ~5 seconds
- **User experience**: Complete quiz while video "generates"
- **Processing page**: Quick 2-second animation (since video is already done)

## Switch Back to Real Mode

To use real AI services again:

```env
MOCK_MODE=false
```

or just remove the line entirely.

## When to Use Each Mode

**Use MOCK_MODE=true for:**
- Frontend testing
- Flow demonstrations
- UI/UX development
- Quick iterations

**Use MOCK_MODE=false (Real Mode) for:**
- Production
- Final testing with real videos
- Client demonstrations
- Actual deployments

## Restart Required

After changing `.env`, restart the backend:

```bash
# Stop the current backend (Ctrl+C in the terminal)
# Then restart:
cd UAE_anthem
.\.venv\Scripts\activate
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

The console will show `🎭 MOCK MODE: Skipping AI services for job...` when mock mode is active.
