import json
import os
import time
import random
from pymongo import MongoClient
from jisho_api.kanji import Kanji
from dotenv import load_dotenv
from tqdm import tqdm
import requests

# --- Load environment variables ---
load_dotenv()

MONGO_USER = os.getenv("DB_USERNAME")
MONGO_PASS = os.getenv("DB_PASSWORD")

uri = f"mongodb+srv://{MONGO_USER}:{MONGO_PASS}@hongancluster.jcwo3zj.mongodb.net/?retryWrites=true&w=majority&appName=HongAnCluster"
client = MongoClient(uri)
db = client["Kanji-Radical-Map"]
kanji_list_collection = db["KanjiList"]

# --- Function to fetch Kanji info safely ---
def fetch_kanji(char, retries=3, delay=2):
    """Fetch kanji info from Jisho API with retry and backoff."""
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

# --- Read kanji list from sample.txt ---
with open("app/database/kanji.txt", "r", encoding="utf-8") as f:
    content = f.read().strip()
    try:
        sample_kanjis = json.loads(content.replace("'", '"'))
    except json.JSONDecodeError:
        # Fallback: support comma-separated format
        sample_kanjis = [k.strip() for k in content.strip("[]").replace("'", "").split(",") if k.strip()]

sample_kanjis = list(dict.fromkeys(sample_kanjis))  # remove duplicates
print(f"📄 Loaded {len(sample_kanjis)} kanji from sample.txt")

# --- Resume from previously inserted kanji ---
existing = {doc["kanji"] for doc in kanji_list_collection.find({}, {"kanji": 1})}
print(f"✅ {len(existing)} kanji already exist in KanjiList, resuming...")

for char in tqdm(sample_kanjis, desc="Adding to KanjiList"):
    if char in existing:
        continue

    k_info = fetch_kanji(char)
    if not k_info or not k_info.data:
        print(f"⚠️ Skipping {char}, no data found.")
        continue

    data = k_info.data

    # Convert non-serializable fields into dicts
    meanings = getattr(data, "main_meanings", []) or []

    readings_obj = getattr(data, "main_readings", None)
    readings = readings_obj.dict() if hasattr(readings_obj, "dict") else {}

    radical_obj = getattr(data, "radical", None)
    radical = radical_obj.dict() if hasattr(radical_obj, "dict") else {}

    doc = {
        "kanji": getattr(data, "kanji", char),
        "meanings": meanings,
        "readings": readings,
        "radical": radical,
    }

    # Safely insert into MongoDB
    kanji_list_collection.update_one(
        {"kanji": char},
        {"$set": doc},
        upsert=True
    )

    time.sleep(0.3)


print("🎉 All sample kanji stored in KanjiList collection!")
