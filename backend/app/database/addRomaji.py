import os
from pymongo import MongoClient
from dotenv import load_dotenv
from pykakasi import kakasi
from tqdm import tqdm

# --- Load environment variables ---
load_dotenv()

MONGO_USER = os.getenv("DB_USERNAME")
MONGO_PASS = os.getenv("DB_PASSWORD")

# --- Connect to MongoDB ---
uri = f"mongodb+srv://{MONGO_USER}:{MONGO_PASS}@hongancluster.jcwo3zj.mongodb.net/?retryWrites=true&w=majority&appName=HongAnCluster"
client = MongoClient(uri)
db = client["Kanji-Radical-Map"]
kanji_list_collection = db["KanjiList"]

# --- Initialize Kakasi converter ---
kks = kakasi()
kks.setMode("H", "a")  # Hiragana to ascii
kks.setMode("K", "a")  # Katakana to ascii
kks.setMode("J", "a")  # Kanji readings (if present)
kks.setMode("r", "Hepburn")  # Use Hepburn romanization
converter = kks.getConverter()

def to_romaji(reading_list):
    """Convert a list of kana readings into romaji."""
    if not reading_list:
        return []
    romaji_list = []
    for r in reading_list:
        clean = (
            r.replace("・", "")
             .replace("－", "-")
             .replace("ー", "")
             .replace("　", "")
             .strip()
        )
        romaji = converter.do(clean)
        romaji_list.append(romaji)
    return romaji_list

# --- Process all kanji ---
all_docs = list(kanji_list_collection.find({}, {"_id": 1, "readings": 1}))
print(f"📚 Found {len(all_docs)} kanji to process.")

for doc in tqdm(all_docs, desc="Adding romaji readings"):
    readings = doc.get("readings", {})
    kun_readings = readings.get("kun", [])
    on_readings = readings.get("on", [])

    romaji_readings = {
        "kun": to_romaji(kun_readings),
        "on": to_romaji(on_readings)
    }

    kanji_list_collection.update_one(
        {"_id": doc["_id"]},
        {"$set": {"romaji_readings": romaji_readings}}
    )

print("✅ All romaji readings successfully added to KanjiList!")
