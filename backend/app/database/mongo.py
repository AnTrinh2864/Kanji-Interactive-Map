from pymongo import MongoClient
from jisho_api.kanji import Kanji
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_USER = os.getenv("DB_USERNAME")
MONGO_PASS = os.getenv("DB_PASSWORD")

uri = f"mongodb+srv://{MONGO_USER}:{MONGO_PASS}@hongancluster.jcwo3zj.mongodb.net/?retryWrites=true&w=majority&appName=HongAnCluster"
client = MongoClient(uri)

db = client["Kanji-Radical-Map"]
radicals_collection = db["Kanji Radical Map"]

# Optional: clear existing collection
radicals_collection.delete_many({})

# Generate radical map
for codepoint in range(0x4E00, 0x9FAF + 1):
    char = chr(codepoint)
    k_info = Kanji.request(char)
    if not k_info or not k_info.data:
        continue

    parts = getattr(k_info.data.radical, "parts", [])
    for part in parts:
        radicals_collection.update_one(
            {"radical": part},
            {"$push": {"kanjis": k_info.data.dict()}},
            upsert=True
        )

print("Radical map stored in MongoDB!")
