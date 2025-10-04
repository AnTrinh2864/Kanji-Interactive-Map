from pydantic import BaseModel
from typing import List, Optional

# -------- PART SCHEMAS --------
class PartBase(BaseModel):
    part: str
    part_meaning: Optional[str] = None

class Part(PartBase):
    id: int
    class Config:
        orm_mode = True

# -------- KANJI SCHEMAS --------
class KanjiBase(BaseModel):
    kanji: str
    meaning: str = ""
    reading: str = ""

class KanjiCreate(KanjiBase):
    parts: List[str] = []

class Kanji(KanjiBase):
    id: int
    parts: List[str] = []
    class Config:
        orm_mode = True

# -------- USER SCHEMAS --------
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

# -------- AUTH --------
class AuthRequest(BaseModel):
    username: str
    password: str

# -------- SAVE KANJI REQUEST --------
class SaveKanjiRequest(BaseModel):
    user_id: int
    kanji: KanjiCreate
