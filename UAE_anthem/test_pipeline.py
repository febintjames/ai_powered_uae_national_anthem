"""
Quick diagnostic script to test the video generation API directly
"""
import os
import sys
from dotenv import load_dotenv

# Setup path
sys.path.insert(0, os.path.dirname(__file__))
load_dotenv()

print("="*60)
print("TESTING VIDEO GENERATION PIPELINE")
print("="*60)

# Test imports
try:
    from wave import qwen_edit, wans2v, API_KEY
    print("✓ Imports successful")
except Exception as e:
    print(f"✗ Import failed: {e}")
    sys.exit(1)

# Check API key
if not API_KEY:
    print("✗ API_KEY not set!")
    sys.exit(1)
print(f"✓ API Key loaded: {API_KEY[:8]}...{API_KEY[-4:]}")

# Find a recent upload to test with
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    print(f"✗ No uploads directory found")
    sys.exit(1)

files = sorted([f for f in os.listdir(uploads_dir) if f.endswith(('.jpg', '.jpeg', '.png'))], 
               key=lambda x: os.path.getmtime(os.path.join(uploads_dir, x)), 
               reverse=True)

if not files:
    print("✗ No image files found in uploads/")
    sys.exit(1)

test_image = os.path.join(uploads_dir, files[0])
print(f"✓ Using test image: {files[0]}")

# Test image generation
print("\n" + "="*60)
print("STEP 1: Testing Image Generation (qwen_edit)")
print("="*60)
try:
    result = qwen_edit(img1=test_image, age_gap="Male")
    if result:
        print(f"✓ Image generation SUCCESS!")
        print(f"  Result URL: {result[:80]}...")
    else:
        print("✗ Image generation returned None")
        print("  Check wave.py output above for API errors")
except Exception as e:
    print(f"✗ Image generation FAILED: {e}")
    import traceback
    traceback.print_exc()
