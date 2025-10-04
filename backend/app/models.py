from sqlalchemy import Column, Integer, String, ForeignKey, Table
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

# Association table between users and kanjis
user_kanji = Table(
    "user_kanji",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("kanji_id", Integer, ForeignKey("kanjis.id"))
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

    kanjis = relationship("Kanji", secondary=user_kanji, back_populates="users")

class Kanji(Base):
    __tablename__ = "kanjis"
    id = Column(Integer, primary_key=True, index=True)
    kanji = Column(String, index=True)
    meaning = Column(String, nullable=True)
    reading = Column(String, nullable=True)
    parts = relationship("Part", back_populates="kanji")
    users = relationship("User", secondary=user_kanji, back_populates="kanjis")

class Part(Base):
    __tablename__ = "parts"
    id = Column(Integer, primary_key=True, index=True)
    part = Column(String)
    part_meaning = Column(String, nullable=True)
    kanji_id = Column(Integer, ForeignKey("kanjis.id"))
    kanji = relationship("Kanji", back_populates="parts")
