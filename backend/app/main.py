from fastapi import FastAPI, HTTPException
from jisho_api.word import Word
from jisho_api.kanji import Kanji

app = FastAPI()

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
        raise HTTPException(status_code=500, detail=f"Server error: {e}")
