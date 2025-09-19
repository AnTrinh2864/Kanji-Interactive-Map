from fastapi import APIRouter, HTTPException
import requests

router = APIRouter()

KANJI_ALIVE_API = "https://kanjialive-api.p.rapidapi.com/api/public/kanji/"
KANJI_ALIVE_HEADERS = {
    "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY",   # put this in .env later
    "X-RapidAPI-Host": "kanjialive-api.p.rapidapi.com"
}

@router.get("/{character}")
def get_kanji(character: str):
    url = f"{KANJI_ALIVE_API}{character}"
    response = requests.get(url, headers=KANJI_ALIVE_HEADERS)
    result = response.json()
    if "error" in result:
        raise HTTPException(status_code=400, detail="Kanji not found")
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Kanji not found")
    
    return response.json()
