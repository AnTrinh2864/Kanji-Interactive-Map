import os
import httpx
from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv

load_dotenv()  # load keys from .env

app = FastAPI()

API_KEY = os.getenv("RAPIDAPI_KEY")
API_HOST = os.getenv("RAPIDAPI_HOST")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/kanji/{character}")
async def get_kanji(character: str):
    print(f"Fetching kanji: {character}")  # 👈 add this
    url = f"https://{API_HOST}/api/public/kanji/{character}"
    headers = {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": API_HOST
    }
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, headers=headers)
        print("Status:", resp.status_code, "Response:", resp.text[:200])  # 👈 add this
        if resp.status_code == 200:
            return resp.json()
        else:
            raise HTTPException(status_code=resp.status_code, detail="Kanji not found")
