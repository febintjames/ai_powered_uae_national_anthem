# UAE National Anthem Kiosk - API Documentation

## Base URL
- **Development**: `http://localhost:8000`
- **Production**: Set via `PUBLIC_BASE_URL` environment variable

---

## 📋 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/jobs` | Create video generation job |
| GET | `/api/jobs/{job_id}` | Check job status |
| GET | `/api/jobs/{job_id}/qr` | Get QR code image |
| GET | `/api/questions` | Get quiz questions |
| POST | `/api/jobs/{job_id}/answers` | Submit quiz answers |
| GET | `/healthz` | Health check |

---

## 1. Create Video Generation Job

### `POST /api/jobs`

Start a new video generation job with the user's captured photo.

#### Request

**Content-Type**: `multipart/form-data`

**Form Fields**:
| Field | Type | Required | Values | Description |
|-------|------|----------|--------|-------------|
| `image` | File | ✅ Yes | JPEG/PNG | User's face photo |
| `age_group` | String | ✅ Yes | `Male`, `Female`, `Boy`, `Girl` | Avatar costume type |
| `phone` | String | ❌ No | Any valid phone | WhatsApp number (optional) |

#### Response

**Status**: `200 OK`

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Error Responses

**Status**: `400 Bad Request`
```json
{
  "detail": "Invalid age_group"
}
```

**Status**: `400 Bad Request`
```json
{
  "detail": "Only JPEG/PNG images are accepted"
}
```

#### cURL Example

```bash
curl -X POST http://localhost:8000/api/jobs \
  -F "image=@photo.jpg" \
  -F "age_group=Male" \
  -F "phone=+971501234567"
```

#### JavaScript Example

```javascript
const formData = new FormData();
formData.append('image', imageFile); // File object from input
formData.append('age_group', 'Female');
formData.append('phone', '+971501234567');

const response = await fetch('http://localhost:8000/api/jobs', {
  method: 'POST',
  body: formData,
});

const { job_id } = await response.json();
console.log('Job created:', job_id);
```

---

## 2. Check Job Status

### `GET /api/jobs/{job_id}`

Poll the status of a video generation job. Call this endpoint every **2 seconds** until status is `completed` or `failed`.

#### Request

**Path Parameters**:
- `job_id` (string): The job ID returned from job creation

#### Response - Processing (Image)

**Status**: `200 OK`

```json
{
  "status": "image",
  "error": null
}
```

#### Response - Processing (Video)

**Status**: `200 OK`

```json
{
  "status": "video",
  "error": null
}
```

#### Response - Completed

**Status**: `200 OK`

```json
{
  "status": "completed",
  "video_url": "https://api.example.com/media/videos/550e8400-e29b-41d4-a716-446655440000.mp4",
  "qr_url": "/api/jobs/550e8400-e29b-41d4-a716-446655440000/qr",
  "error": null
}
```

#### Response - Failed

**Status**: `200 OK`

```json
{
  "status": "failed",
  "error": "Video generation failed",
  "video_url": null,
  "qr_url": null
}
```

#### Response - Unknown Job

**Status**: `200 OK`

```json
{
  "status": "queued"
}
```

#### Status Flow

```
queued → image → video → completed
                      ↓
                    failed
```

#### Polling Example

```javascript
const pollJobStatus = async (jobId) => {
  const interval = setInterval(async () => {
    const response = await fetch(`http://localhost:8000/api/jobs/${jobId}`);
    const status = await response.json();
    
    console.log('Current status:', status.status);
    
    if (status.status === 'completed') {
      clearInterval(interval);
      console.log('Video ready:', status.video_url);
      // Navigate to video review screen
    } else if (status.status === 'failed') {
      clearInterval(interval);
      console.error('Job failed:', status.error);
      // Show error message
    }
  }, 2000); // Poll every 2 seconds
};
```

---

## 3. Get QR Code

### `GET /api/jobs/{job_id}/qr`

Returns a PNG image of a QR code encoding the video download URL.

#### Request

**Path Parameters**:
- `job_id` (string): The job ID

#### Response

**Status**: `200 OK`

**Content-Type**: `image/png`

**Body**: Binary PNG image data

#### Error Response

**Status**: `404 Not Found`

```json
{
  "detail": "QR not available"
}
```

*Note: QR code is only available when job status is `completed`*

#### Usage Example

```html
<!-- Display QR code in <img> tag -->
<img 
  src="http://localhost:8000/api/jobs/550e8400-e29b-41d4-a716-446655440000/qr" 
  alt="Scan to download video"
  width="300"
  height="300"
/>
```

#### Download QR Code

```javascript
const downloadQR = async (jobId) => {
  const response = await fetch(`http://localhost:8000/api/jobs/${jobId}/qr`);
  const blob = await response.blob();
  
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `uae-anthem-qr-${jobId}.png`;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

## 4. Get Quiz Questions

### `GET /api/questions`

Fetch random quiz questions about UAE National Day.

#### Request

**Query Parameters**:
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `count` | Integer | ❌ No | 10 | Number of questions |
| `seed` | String | ❌ No | Random | Seed for deterministic question selection |

#### Response

**Status**: `200 OK`

```json
{
  "questions": [
    {
      "id": 1,
      "question": "When is UAE National Day celebrated?",
      "options": ["2 December", "1 December", "25 November", "15 December"]
    },
    {
      "id": 5,
      "question": "How many emirates make up the UAE?",
      "options": ["5", "6", "7", "8"]
    }
    // ... more questions
  ],
  "key": [
    {
      "id": 1,
      "question": "When is UAE National Day celebrated?",
      "options": ["2 December", "1 December", "25 November", "15 December"],
      "answer": 0
    },
    {
      "id": 5,
      "question": "How many emirates make up the UAE?",
      "options": ["5", "6", "7", "8"],
      "answer": 2
    }
    // ... includes answer indices
  ]
}
```

**Field Descriptions**:
- `questions`: Array of questions for display (no answers)
- `key`: Same questions but includes `answer` field (correct option index)
- `answer`: Index of correct option (0-3)

#### Important Notes

> [!IMPORTANT]
> Store the `key` array from the response. You'll need it to submit answers for grading.

> [!TIP]
> Use the `job_id` as the `seed` parameter to ensure the same questions are shown if the user refreshes the page.

#### Usage Example

```javascript
const loadQuiz = async (jobId) => {
  const response = await fetch(
    `http://localhost:8000/api/questions?count=10&seed=${jobId}`
  );
  const { questions, key } = await response.json();
  
  // Display questions to user
  setQuizQuestions(questions);
  
  // Store key for later grading
  setQuizKey(key);
};
```

---

## 5. Submit Quiz Answers

### `POST /api/jobs/{job_id}/answers`

Submit the user's quiz answers for grading.

#### Request

**Path Parameters**:
- `job_id` (string): The job ID

**Content-Type**: `application/json`

**Body**:
```json
{
  "key": [
    {
      "id": 1,
      "question": "...",
      "options": [...],
      "answer": 0
    }
    // ... full key array from questions response
  ],
  "answers": [0, 2, 1, 3, 0, 1, 2, 3, 0, 1]
}
```

**Field Descriptions**:
- `key`: The full key array from `/api/questions` response
- `answers`: Array of selected option indices (one per question)
  - Use the selected index (0-3) for each question
  - Use `null` if question was skipped

#### Response

**Status**: `200 OK`

```json
{
  "total": 10,
  "correct": 7,
  "score": 70.0
}
```

**Field Descriptions**:
- `total`: Total number of questions
- `correct`: Number of correct answers
- `score`: Percentage score (0-100)

#### Error Response

**Status**: `400 Bad Request`

```json
{
  "detail": "Invalid payload"
}
```

#### Side Effects

A minimal score record is saved to `result/quiz/{job_id}.json` on the server.

#### Usage Example

```javascript
const submitQuiz = async (jobId, quizKey, userAnswers) => {
  const response = await fetch(
    `http://localhost:8000/api/jobs/${jobId}/answers`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        key: quizKey,
        answers: userAnswers
      }),
    }
  );
  
  const result = await response.json();
  console.log(`Score: ${result.score}% (${result.correct}/${result.total})`);
  return result;
};
```

---

## 6. Health Check

### `GET /healthz`

Simple health check endpoint to verify API is running.

#### Response

**Status**: `200 OK`

```json
{
  "ok": true,
  "time": 1732800000
}
```

#### Usage Example

```javascript
const checkHealth = async () => {
  try {
    const response = await fetch('http://localhost:8000/healthz');
    const { ok } = await response.json();
    return ok;
  } catch (error) {
    return false;
  }
};
```

---

## 🔄 Complete Workflow Example

### Frontend Integration Flow

```javascript
// 1. User selects avatar and captures photo
const avatarType = 'Male'; // from avatar selection
const photoFile = capturedPhoto; // from camera

// 2. Create job
const { job_id } = await createJob(photoFile, avatarType);

// 3. Load quiz questions
const { questions, key } = await getQuestions(10, job_id);

// 4. User answers quiz
const userAnswers = [0, 2, 1, 3, 0, 1, 2, 3, 0, 1];
const quizResult = await submitAnswers(job_id, key, userAnswers);
console.log(`Quiz score: ${quizResult.score}%`);

// 5. Poll job status
const pollInterval = setInterval(async () => {
  const status = await checkJobStatus(job_id);
  
  if (status.status === 'completed') {
    clearInterval(pollInterval);
    
    // 6. Display video
    displayVideo(status.video_url);
    
    // 7. Show QR code
    displayQRCode(job_id);
  }
}, 2000);
```

---

## 🎨 Avatar Type to Costume Mapping

The `age_group` parameter controls which costume is used in the generated video:

| Avatar Type | User Selection | Video Costume |
|-------------|----------------|---------------|
| `Male` | Adult male | UAE traditional male attire |
| `Female` | Adult female | UAE traditional female attire |
| `Boy` | Young boy | UAE traditional boy attire |
| `Girl` | Young girl | UAE traditional girl attire |

> [!IMPORTANT]
> The costume in the generated video **must match** the selected avatar type. Ensure the `age_group` parameter is set correctly when creating the job.

---

## ⏱️ Processing Timeline

Expected processing times for video generation:

| Stage | Status | Duration |
|-------|--------|----------|
| Image editing | `image` | 30-60 seconds |
| Video generation | `video` | 60-120 seconds |
| **Total** | | **90-180 seconds** |

> [!TIP]
> Poll job status every **2 seconds**. The total processing time is typically 1.5-3 minutes.

---

## 🚨 Error Handling

### Common Error Scenarios

#### 1. Invalid Image Format
```json
{
  "detail": "Only JPEG/PNG images are accepted"
}
```
**Solution**: Validate file type before upload

#### 2. Invalid Avatar Type
```json
{
  "detail": "Invalid age_group"
}
```
**Solution**: Use only: `Male`, `Female`, `Boy`, `Girl`

#### 3. Job Not Found
```json
{
  "status": "queued"
}
```
**Cause**: Job ID doesn't exist or hasn't started processing
**Solution**: Verify job_id is correct

#### 4. Video Generation Failed
```json
{
  "status": "failed",
  "error": "Video generation failed"
}
```
**Cause**: Backend AI service error
**Solution**: Show error message, allow user to retry

#### 5. QR Code Not Available
```json
{
  "detail": "QR not available"
}
```
**Cause**: Job not yet completed
**Solution**: Only show QR code when status is `completed`

---

## 🔒 CORS Configuration

The backend has permissive CORS settings for development:

```python
allow_origins=["*"]
allow_credentials=True
allow_methods=["*"]
allow_headers=["*"]
```

> [!WARNING]
> In production, restrict `allow_origins` to your frontend domain only.

---

## 📦 Media File Storage

- **Uploaded images**: `result/images/{job_id}.jpg`
- **Generated videos**: `result/videos/{job_id}.mp4`
- **QR codes**: Generated on-the-fly (not stored)
- **Quiz results**: `result/quiz/{job_id}.json`

All files are stored locally on the backend server. No cloud storage is used.

---

## 🧪 Testing the API

### Using cURL

```bash
# 1. Health check
curl http://localhost:8000/healthz

# 2. Create job
curl -X POST http://localhost:8000/api/jobs \
  -F "image=@test-photo.jpg" \
  -F "age_group=Male"

# 3. Check status
curl http://localhost:8000/api/jobs/{job_id}

# 4. Get questions
curl "http://localhost:8000/api/questions?count=5"

# 5. Submit answers
curl -X POST http://localhost:8000/api/jobs/{job_id}/answers \
  -H "Content-Type: application/json" \
  -d '{"key": [...], "answers": [0,1,2,3,0]}'

# 6. Download QR code
curl http://localhost:8000/api/jobs/{job_id}/qr --output qr.png
```

---

## 📝 Notes

- All timestamps are Unix epoch in seconds
- Phone numbers can be in any format (validation is permissive)
- Images should ideally be under 10MB for best performance
- Videos are in MP4 format with H.264 codec
- QR codes are 300x300 PNG images
- Quiz questions are randomly selected from a pool of 50 questions

---

## 🔗 Related Documentation

- [Backend README](../UAE_anthem/README.md)
- [Frontend Implementation Plan](./IMPLEMENTATION_PLAN.md)

---

**Last Updated**: 2025-11-28
