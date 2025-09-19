from fastapi import FastAPI, HTTPException
from jisho_api.word import Word
from jisho_api.kanji import Kanji

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/kanji/{query}")
async def get_kanji(query: str):
    """
    Lookup kanji information.
    - If query is a kanji character: return its details.
    - If query is English: search for matching word, then get kanji details for each kanji in that word.
    """

    results = []

    try:
        # Case 1: Direct kanji lookup (if query is a single kanji character)
        if len(query) == 1:
            kanji_info = Kanji.request(query)
            if not kanji_info:
                raise HTTPException(status_code=404, detail="Kanji not found")
            return {"query": query, "kanji": kanji_info.dict()}

        # Case 2: English/Japanese word lookup
        word_results = Word.request(query)
        if not word_results.data:
            raise HTTPException(status_code=404, detail="No results found for query")

        # Extract all kanji characters from results
        kanji_chars = set()
        for entry in word_results.data:
            for jp in entry.japanese:
                for char in jp.word or "":
                    if "\u4e00" <= char <= "\u9faf":  # CJK unified ideographs
                        kanji_chars.add(char)

        # Lookup details for each kanji found
        for k in kanji_chars:
            try:
                kanji_info = Kanji.request(k)
                if kanji_info:
                    results.append(kanji_info.dict())
            except Exception:
                continue

        if not results:
            raise HTTPException(status_code=404, detail="No kanji found in results")

        return {"query": query, "kanji_list": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
