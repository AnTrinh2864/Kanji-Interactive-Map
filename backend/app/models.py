from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    kanjis = relationship("Kanji", back_populates="user")   # 🔹 updated


class Kanji(Base):   # 🔹 renamed from SavedKanji
    __tablename__ = "saved_kanjis"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    kanji = Column(String, nullable=False)
    meaning = Column(String, nullable=True)
    readings = Column(String, nullable=True)

    user = relationship("User", back_populates="kanjis")
    parts = relationship("KanjiPart", back_populates="kanji")   # 🔹 updated


class KanjiPart(Base):
    __tablename__ = "kanji_parts"
    id = Column(Integer, primary_key=True, index=True)
    kanji_id = Column(Integer, ForeignKey("saved_kanjis.id"), nullable=False)  # 🔹 updated column name
    part = Column(String, nullable=False)
    part_meaning = Column(String, nullable=True)

    kanji = relationship("Kanji", back_populates="parts")  # 🔹 updated
