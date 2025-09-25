import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from jisho_api.word import Word
from jisho_api.kanji import Kanji
from pymongo import MongoClient

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()

MONGO_USER = os.getenv("DB_USERNAME")
MONGO_PASS = os.getenv("DB_PASSWORD")

uri = f"mongodb+srv://{MONGO_USER}:{MONGO_PASS}@hongancluster.jcwo3zj.mongodb.net/?retryWrites=true&w=majority&appName=HongAnCluster"
client = MongoClient(uri)

db = client["Kanji-Radical-Map"]
radicals_collection = db["Kanji Radical Map"]

@app.get("/api/kanji/{query}")
async def get_kanji(query: str):
    """
    Lookup kanji information.
    - If query is a kanji character: return its details.
    - If query is English/Japanese: search for matching word(s),
      then return details for kanji used in those words.
    """

    try:
        # Case 1: Single kanji lookup
        if len(query) == 1 and "\u4e00" <= query <= "\u9faf":
            kanji_info = Kanji.request(query)
            if not kanji_info or not kanji_info.data:
                raise HTTPException(status_code=404, detail="Kanji not found")
            return {"query": query, "kanji": kanji_info.data.dict()}

        # Case 2: English or Japanese word lookup
        word_results = Word.request(query)
        if not word_results or not word_results.data:
            raise HTTPException(status_code=404, detail="No results found")

        # Collect all kanji from results
        kanji_chars = set()
        for entry in word_results.data:
            for jp in entry.japanese:
                if jp.word:
                    for char in jp.word:
                        if "\u4e00" <= char <= "\u9faf":
                            kanji_chars.add(char)

        if not kanji_chars:
            raise HTTPException(status_code=404, detail="No kanji found in results")

        # Get details for each kanji
        results = []
        for k in kanji_chars:
            k_info = Kanji.request(k)
            if k_info and k_info.data:
                results.append(k_info.data.dict())

        return {"query": query, "kanji_list": results}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/parts/{part}")
async def get_kanji_by_part(part: str):
    """
    Look up all kanji in MongoDB that contain a given part (radical).
    """
    try:
        doc = radicals_collection.find_one({"radical": part})

        if not doc or "kanjis" not in doc:
            raise HTTPException(status_code=404, detail=f"No kanji found with part '{part}'")

        # Clean up ObjectId
        doc["_id"] = str(doc["_id"])

        return {"part": part, "kanji_list": doc["kanjis"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
