import os
import sys
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

load_dotenv()

API_KEY = os.getenv("WSAI_KEY")

print("=" * 50)
print("API Key Check")
print("=" * 50)
print(f"API Key found: {bool(API_KEY)}")
if API_KEY:
    print(f"API Key length: {len(API_KEY)} characters")
    print(f"API Key preview: {API_KEY[:8]}...{API_KEY[-4:]}")
else:
    print("ERROR: WSAI_KEY not set!")
    
print("\nTesting API connection...")

# Test with a minimal API call
import requests
import json

url = "https://api.wavespeed.ai/api/v3/predictions"
headers = {
    "Authorization": f"Bearer {API_KEY}",
}

try:
    response = requests.get(url, headers=headers)
    print(f"API Response Status: {response.status_code}")
    if response.status_code == 200:
        print("✓ API Key is valid!")
    elif response.status_code == 401 or response.status_code == 403:
        print("✗ API Key is INVALID or UNAUTHORIZED!")
        print(f"Response: {response.text}")
    else:
        print(f"Response: {response.text[:200]}")
except Exception as e:
    print(f"Connection error: {e}")
