from pydantic import BaseModel
from typing import List, Optional

class PartBase(BaseModel):
    part: str
    part_meaning: Optional[str] = None

class PartCreate(PartBase):
    pass

class Part(PartBase):
    id: int
    class Config:
        orm_mode = True

class KanjiBase(BaseModel):
    kanji: str
    meaning: Optional[str] = None
    readings: Optional[str] = None

class KanjiCreate(KanjiBase):
    parts: List[PartCreate]

class Kanji(KanjiBase):
    id: int
    parts: List[Part] = []
    class Config:
        orm_mode = True

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    kanjis: List[Kanji] = []
    class Config:
        orm_mode = True


class AuthRequest(BaseModel):
    username: str
    password: str