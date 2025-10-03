from fastapi import APIRouter, HTTPException
from jisho_api.word import Word
from jisho_api.kanji import Kanji
from pymongo import MongoClient
import os

router = APIRouter()

# Mongo setup
MONGO_USER = os.getenv("DB_USERNAME")
MONGO_PASS = os.getenv("DB_PASSWORD")
uri = f"mongodb+srv://{MONGO_USER}:{MONGO_PASS}@hongancluster.jcwo3zj.mongodb.net/?retryWrites=true&w=majority&appName=HongAnCluster"
client = MongoClient(uri)
db = client["Kanji-Radical-Map"]
radicals_collection = db["Kanji Radical Map"]

@router.get("/api/kanji/{query}")
async def get_kanji(query: str):
    try:
        if len(query) == 1 and "\u4e00" <= query <= "\u9faf":
            kanji_info = Kanji.request(query)
            if not kanji_info or not kanji_info.data:
                raise HTTPException(status_code=404, detail="Kanji not found")
            return {"query": query, "kanji": kanji_info.data.dict()}

        word_results = Word.request(query)
        if not word_results or not word_results.data:
            raise HTTPException(status_code=404, detail="No results found")

        kanji_chars = set()
        for entry in word_results.data:
            for jp in entry.japanese:
                if jp.word:
                    for char in jp.word:
                        if "\u4e00" <= char <= "\u9faf":
                            kanji_chars.add(char)

        results = []
        for k in kanji_chars:
            k_info = Kanji.request(k)
            if k_info and k_info.data:
                results.append(k_info.data.dict())

        return {"query": query, "kanji_list": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/parts/{part}")
async def get_kanji_by_part(part: str):
    try:
        doc = radicals_collection.find_one({"part": part})
        if not doc or "kanji_list" not in doc:
            raise HTTPException(status_code=404, detail=f"No kanji found with part '{part}'")
        doc["_id"] = str(doc["_id"])
        return {"part": part, "kanji_list": doc["kanji_list"], "meaning": doc["meaning"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
