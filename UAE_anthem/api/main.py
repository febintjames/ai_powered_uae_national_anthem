import os
import sys
import uuid
import threading
import time
from io import BytesIO
from typing import Dict, Any, Optional
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles

import requests
import boto3
from botocore.exceptions import ClientError

# Load .env FIRST
from dotenv import load_dotenv
load_dotenv()

# Make repo root importable
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT_DIR)

from wave import nano_banana_edit, wans2v, generate_qr_code
from quiz import get_random_questions, grade_answers

app = FastAPI(title="UAE National Day Video API", version="1.0.0")

# ========== CONFIG ==========
# AWS S3 Config
USE_S3 = os.getenv("USE_S3", "false").lower() == "true"  # Toggle S3 storage
AWS_REGION = os.getenv("AWS_REGION", "me-central-1")
S3_BUCKET = os.getenv("AWS_S3_BUCKET", "")
S3_PREFIX = os.getenv("AWS_S3_PREFIX", "uae-national-day").strip("/")
S3_PUBLIC_DOMAIN = os.getenv("AWS_S3_PUBLIC_DOMAIN", "").rstrip("/")  # CloudFront CDN
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")

# Local storage (fallback when S3 disabled)
PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL", "").rstrip("/")

# Upload limits
MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "10"))
MAX_UPLOAD_SIZE = MAX_UPLOAD_SIZE_MB * 1024 * 1024

# ========== INITIALIZE S3 ==========
s3 = None
if USE_S3:
    if not S3_BUCKET:
        raise RuntimeError("USE_S3=true requires AWS_S3_BUCKET")
    
    s3 = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )
    
    # Verify credentials
    try:
        sts = boto3.client(
            "sts",
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        )
        identity = sts.get_caller_identity()
        print(f"✅ S3 enabled - authenticated as: {identity['Arn']}")
    except Exception as e:
        print(f"❌ S3 credential error: {e}")
        raise

# ========== S3 HELPERS ==========
def _s3_key(*parts: str) -> str:
    """Build S3 key path"""
    safe = [p.strip("/").replace("..", "") for p in parts if p]
    return "/".join([S3_PREFIX] + safe) if S3_PREFIX else "/".join(safe)

def _s3_put_file(local_path: str, key: str, content_type: str) -> None:
    """Upload local file to S3"""
    s3.upload_file(
        Filename=local_path,
        Bucket=S3_BUCKET,
        Key=key,
        ExtraArgs={"ContentType": content_type, "ACL": "public-read"},  # Make public
    )

def _s3_put_bytes(data: bytes, key: str, content_type: str) -> None:
    """Upload bytes to S3"""
    s3.put_object(
        Bucket=S3_BUCKET,
        Key=key,
        Body=data,
        ContentType=content_type,
        ACL="public-read",  # Make public
    )

def _s3_url_for_key(key: str, expires: int = 86400) -> str:
    """Get public URL for S3 key (CDN or presigned)"""
    if S3_PUBLIC_DOMAIN:
        # Use CloudFront/CDN domain
        return f"{S3_PUBLIC_DOMAIN}/{key}"
    else:
        # Generate presigned URL
        return s3.generate_presigned_url(
            "get_object",
            Params={"Bucket": S3_BUCKET, "Key": key},
            ExpiresIn=expires,
        )

# ========== LOCAL STORAGE HELPERS ==========
def _save_local_video(url: str, job_id: str) -> str:
    """Download video from URL and save locally"""
    response = requests.get(url, timeout=300)
    response.raise_for_status()
    
    file_path = os.path.join(ROOT_DIR, "result", "videos", f"{job_id}.mp4")
    with open(file_path, "wb") as f:
        f.write(response.content)
    
    print(f"Video saved locally to {file_path}")
    return file_path

def _save_local_image(url: str, job_id: str) -> str:
    """Download image from URL and save locally"""
    response = requests.get(url, timeout=60)
    response.raise_for_status()
    
    file_path = os.path.join(ROOT_DIR, "result", "images", f"{job_id}.jpeg")
    with open(file_path, "wb") as f:
        f.write(response.content)
    
    print(f"Image saved locally to {file_path}")
    return file_path

# ========== SETUP DIRECTORIES ==========
if not USE_S3:
    # Only create local dirs when not using S3
    os.makedirs(os.path.join(ROOT_DIR, "result", "videos"), exist_ok=True)
    os.makedirs(os.path.join(ROOT_DIR, "result", "images"), exist_ok=True)
    os.makedirs(os.path.join(ROOT_DIR, "result", "qr"), exist_ok=True)

UPLOAD_DIR = os.path.join(ROOT_DIR, "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Serve local media only when S3 disabled
if not USE_S3:
    MEDIA_ROOT = os.path.join(ROOT_DIR, "result")
    app.mount("/media", StaticFiles(directory=MEDIA_ROOT), name="media")

# ========== CORS ==========
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ========== IN-MEMORY JOBS ==========
JOBS: Dict[str, Dict[str, Any]] = {}
JOBS_LOCK = threading.Lock()

# ========== PIPELINE ==========
def _run_pipeline(job_id: str, img_path: str, age_group: str, phone: Optional[str]):
    try:
        with JOBS_LOCK:
            JOBS[job_id] = {
                "status": "image",
                "video_url": None,
                "image_url": None,
                "video_path": None,  # Keep for compatibility
                "error": None,
                "phone": phone,
                "started_at": time.time(),
            }

        # Step 1: Image generation
        edited_img_url = nano_banana_edit(img1=img_path, age_gap=age_group)
        if not edited_img_url:
            raise RuntimeError("Image generation failed")

        with JOBS_LOCK:
            JOBS[job_id]["status"] = "video"

        # Step 2: Video generation
        video_url_remote = wans2v(img=edited_img_url, age_gap=age_group)
        if not video_url_remote:
            raise RuntimeError("Video generation failed")

        # Step 3: Store media (S3 or local)
        if USE_S3:
            # === S3 STORAGE ===
            # Upload original (optional audit trail)
            ext = Path(img_path).suffix.lower() or ".jpg"
            upload_key = _s3_key("uploads", f"{job_id}{ext}")
            _s3_put_file(
                img_path,
                upload_key,
                "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png"
            )

            # Download and upload edited image
            img_resp = requests.get(edited_img_url, timeout=60)
            img_resp.raise_for_status()
            image_key = _s3_key("images", f"{job_id}.jpeg")
            _s3_put_bytes(
                img_resp.content,
                image_key,
                img_resp.headers.get("Content-Type", "image/jpeg")
            )

            # Download and upload video
            vid_resp = requests.get(video_url_remote, timeout=300)
            vid_resp.raise_for_status()
            video_key = _s3_key("videos", f"{job_id}.mp4")
            _s3_put_bytes(vid_resp.content, video_key, "video/mp4")

            # Generate URLs
            final_video_url = _s3_url_for_key(video_key)
            final_image_url = _s3_url_for_key(image_key)
            
        else:
            # === LOCAL STORAGE ===
            # Save image and video locally
            _save_local_image(edited_img_url, job_id)
            local_video_path = _save_local_video(video_url_remote, job_id)
            
            # Build URLs
            filename = os.path.basename(local_video_path)
            rel_url = f"/media/videos/{filename}"
            final_video_url = f"{PUBLIC_BASE_URL}{rel_url}" if PUBLIC_BASE_URL else rel_url
            
            rel_img_url = f"/media/images/{job_id}.jpeg"
            final_image_url = f"{PUBLIC_BASE_URL}{rel_img_url}" if PUBLIC_BASE_URL else rel_img_url

        # Update job status
        with JOBS_LOCK:
            JOBS[job_id]["status"] = "completed"
            JOBS[job_id]["video_url"] = final_video_url
            JOBS[job_id]["image_url"] = final_image_url
            JOBS[job_id]["video_path"] = local_video_path if not USE_S3 else None
            JOBS[job_id]["completed_at"] = time.time()

    except Exception as e:
        with JOBS_LOCK:
            JOBS[job_id] = {
                "status": "failed",
                "video_url": None,
                "image_url": None,
                "video_path": None,
                "error": f"{type(e).__name__}: {e}",
                "phone": phone,
                "failed_at": time.time(),
            }
    finally:
        # Clean up temp upload
        try:
            if os.path.exists(img_path):
                os.remove(img_path)
        except Exception:
            pass

# ========== API ENDPOINTS ==========
@app.post("/api/jobs")
async def create_job(
    image: UploadFile = File(...),
    age_group: str = Form(...),
    phone: Optional[str] = Form(None),
):
    if age_group not in {"Male", "Female", "Boy", "Girl"}:
        raise HTTPException(400, detail="Invalid age_group")
    if image.content_type not in {"image/jpeg", "image/png"}:
        raise HTTPException(400, detail="Only JPEG/PNG images are accepted")

    job_id = str(uuid.uuid4())
    ext = Path(image.filename).suffix or ".jpg"
    upload_path = os.path.join(UPLOAD_DIR, f"{job_id}{ext}")

    # Stream to disk with size limit
    read = 0
    chunk_size = 1024 * 1024
    try:
        with open(upload_path, "wb") as f:
            while True:
                chunk = await image.read(chunk_size)
                if not chunk:
                    break
                read += len(chunk)
                if read > MAX_UPLOAD_SIZE:
                    raise HTTPException(413, detail=f"File too large (max {MAX_UPLOAD_SIZE_MB}MB)")
                f.write(chunk)
    finally:
        await image.close()

    # Start background processing
    t = threading.Thread(
        target=_run_pipeline,
        args=(job_id, upload_path, age_group, phone),
        daemon=True
    )
    t.start()

    return {"job_id": job_id}

@app.get("/api/jobs/{job_id}")
async def job_status(job_id: str):
    with JOBS_LOCK:
        job = JOBS.get(job_id)

    if not job:
        return JSONResponse({"status": "queued"})

    resp = {"status": job["status"], "error": job.get("error")}
    
    if job["status"] == "completed":
        resp["video_url"] = job.get("video_url")
        resp["image_url"] = job.get("image_url")
        resp["qr_url"] = f"/api/jobs/{job_id}/qr"
    
    return resp

@app.get("/api/jobs/{job_id}/qr")
async def job_qr(job_id: str):
    with JOBS_LOCK:
        job = JOBS.get(job_id)

    if not job or job.get("status") != "completed" or not job.get("video_url"):
        raise HTTPException(404, detail="QR not available")

    # Generate QR code with video URL
    qr_img = generate_qr_code(job["video_url"])
    buf = BytesIO()
    qr_img.save(buf, format="PNG")
    buf.seek(0)
    
    return StreamingResponse(
        buf,
        media_type="image/png",
        headers={"Cache-Control": "public, max-age=3600"}
    )

@app.get("/api/questions")
async def get_questions(count: int = 10, seed: Optional[str] = None):
    try:
        qs = get_random_questions(count=count, seed=seed)
        sanitized = [
            {"id": q["id"], "question": q["question"], "options": q["options"]}
            for q in qs
        ]
        return {"questions": sanitized, "key": qs}
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@app.post("/api/jobs/{job_id}/answers")
async def submit_answers(job_id: str, payload: Dict[str, Any]):
    key = payload.get("key")
    answers = payload.get("answers")
    if not isinstance(key, list) or not isinstance(answers, list):
        raise HTTPException(400, detail="Invalid payload")

    result = grade_answers(key, answers)

    # Save quiz result (local only, not in S3)
    os.makedirs(os.path.join(ROOT_DIR, "result", "quiz"), exist_ok=True)
    record_path = os.path.join(ROOT_DIR, "result", "quiz", f"{job_id}.json")
    with open(record_path, "w", encoding="utf-8") as f:
        f.write(
            (
                "{\n"
                f'  "score": {result["score"]},\n'
                f'  "correct": {result["correct"]},\n'
                f'  "total": {result["total"]}\n'
                "}\n"
            )
        )

    return result

@app.get("/healthz")
async def healthz():
    health = {
        "ok": True,
        "time": int(time.time()),
        "storage": "s3" if USE_S3 else "local",
        "jobs_active": len([j for j in JOBS.values() if j["status"] in {"image", "video"}]),
    }
    
    if USE_S3:
        try:
            s3.head_bucket(Bucket=S3_BUCKET)
            health["s3_status"] = "connected"
            health["s3_bucket"] = S3_BUCKET
            health["s3_region"] = AWS_REGION
            health["cdn"] = S3_PUBLIC_DOMAIN or "presigned"
        except Exception as e:
            health["s3_status"] = f"error: {e}"
    
    return health
