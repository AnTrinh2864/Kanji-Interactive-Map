import json
import os
import time
import random
from pymongo import MongoClient, UpdateOne
from jisho_api.kanji import Kanji
from dotenv import load_dotenv
from tqdm import tqdm
import requests

load_dotenv()

MONGO_USER = os.getenv("DB_USERNAME")
MONGO_PASS = os.getenv("DB_PASSWORD")

uri = f"mongodb+srv://{MONGO_USER}:{MONGO_PASS}@hongancluster.jcwo3zj.mongodb.net/?retryWrites=true&w=majority&appName=HongAnCluster"
client = MongoClient(uri)

db = client["Kanji-Radical-Map"]
radicals_collection = db["Kanji Radical Map"]

# Load your JSON file
with open("app/database/kanji.json", "r", encoding="utf-8") as f:
    kanji_data = json.load(f)   # Dict[str, Dict]

kanji_list = list(kanji_data.keys())

print(f"🔍 Preparing to fetch {len(kanji_list)} kanji...")

def fetch_kanji(char, retries=3, delay=2):
    """Fetch kanji info from Jisho with retries and backoff."""
    for attempt in range(retries):
        try:
            return Kanji.request(char)
        except (requests.exceptions.RequestException, Exception) as e:
            if attempt < retries - 1:
                wait = delay * (2 ** attempt) + random.uniform(0, 1)
                print(f"⚠️ Error fetching {char}, retrying in {wait:.1f}s...")
                time.sleep(wait)
            else:
                print(f"❌ Skipping {char} after {retries} retries.")
                return None

# Collect already-processed kanji from DB to resume progress
processed_kanji = set()
for doc in radicals_collection.find({}, {"kanjis": 1}):
    for k in doc.get("kanjis", []):
        # Use the field that actually contains the kanji character
        char_field = k.get("kanji") or k.get("character")  # fallback
        if char_field:
            processed_kanji.add(char_field)


print(f"✅ Resuming... {len(processed_kanji)} kanji already processed.")

# Main loop with checkpoint saving
for char in tqdm(kanji_list, desc="Processing kanji"):
    if char in processed_kanji:
        continue  # skip already processed

    k_info = fetch_kanji(char)
    if not k_info or not k_info.data:
        continue

    parts = getattr(k_info.data.radical, "parts", [])
    if not parts:
        continue

    # Save immediately to MongoDB as checkpoint
    for part in parts:
        radicals_collection.update_one(
            {"radical": part},
            {"$addToSet": {"kanjis": k_info.data.dict()}},
            upsert=True
        )

    # Mark as processed
    processed_kanji.add(char)

    # Small delay to avoid hammering Jisho
    time.sleep(0.3)

print("🎉 All kanji processed and stored in MongoDB!")
