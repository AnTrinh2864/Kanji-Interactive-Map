import os
import time
import random
from pymongo import MongoClient
from dotenv import load_dotenv
from tqdm import tqdm
from jisho_api.kanji import Kanji
import requests

load_dotenv()

MONGO_USER = os.getenv("DB_USERNAME")
MONGO_PASS = os.getenv("DB_PASSWORD")

uri = f"mongodb+srv://{MONGO_USER}:{MONGO_PASS}@hongancluster.jcwo3zj.mongodb.net/?retryWrites=true&w=majority&appName=HongAnCluster"
client = MongoClient(uri)

db = client["Kanji-Radical-Map"]
radicals_collection = db["Kanji Radical Map"]

# Safe fetch from Jisho with retries
def fetch_kanji_meaning(char, retries=3, delay=2):
    for attempt in range(retries):
        try:
            k_info = Kanji.request(char)
            if k_info and k_info.data and k_info.data.main_meanings:
                # Return first main meaning
                return k_info.data.main_meanings[0]
            return None
        except (requests.exceptions.RequestException, Exception) as e:
            if attempt < retries - 1:
                wait = delay * (2 ** attempt) + random.uniform(0, 1)
                print(f"⚠️ Error fetching {char}, retrying in {wait:.1f}s...")
                time.sleep(wait)
            else:
                print(f"❌ Skipping {char} after {retries} retries.")
                return None

# Fetch all radical documents
all_docs = list(radicals_collection.find({}))
print(f"🔍 Updating meanings for {len(all_docs)} radical documents...")

for doc in tqdm(all_docs, desc="Updating radicals"):
    radical_field = doc.get("radical")

    # Determine part character safely
    if isinstance(radical_field, dict):
        part_char = radical_field.get("basis") or doc.get("part")
    else:
        part_char = radical_field

    if not part_char:
        continue  # skip if no radical character

    # Fetch meaning only if it's missing
    if not doc.get("meaning"):
        meaning = fetch_kanji_meaning(part_char)
        if meaning:
            radicals_collection.update_one(
                {"_id": doc["_id"]},
                {"$set": {"meaning": meaning}}
            )
        time.sleep(0.3)  # avoid hammering Jisho

print("🎉 All radical meanings updated successfully!")
