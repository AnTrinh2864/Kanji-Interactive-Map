from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal
from app.routers.auth import hash_password, verify_password

router = APIRouter()
# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ========== AUTH ROUTES ==========

@router.post("/api/signup", response_model=schemas.User)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    new_user = models.User(
        username=user.username,
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/api/login", response_model=schemas.User)
def login(auth: schemas.AuthRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.username == auth.username).first()
    if not db_user or not verify_password(auth.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid username or password")
    return db_user


@router.post("/api/save_kanji", response_model=schemas.Kanji)
def save_kanji(request: schemas.SaveKanjiRequest, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == request.user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    kanji_data = request.kanji

    # 🔎 Check if kanji already exists in DB
    db_kanji = db.query(models.Kanji).filter(models.Kanji.kanji == kanji_data.kanji).first()

    if not db_kanji:
        # Create new Kanji entry if it doesn't exist
        db_kanji = models.Kanji(
            kanji=kanji_data.kanji,
            meaning=kanji_data.meaning,
            reading=kanji_data.reading
        )
        db.add(db_kanji)
        db.commit()
        db.refresh(db_kanji)

        # Save parts
        for part in kanji_data.parts:
            db_part = models.Part(part=part, kanji_id=db_kanji.id)
            db.add(db_part)
        db.commit()
        db.refresh(db_kanji)

    # 🔎 Ensure user doesn't already have this kanji
    if db_kanji not in db_user.kanjis:
        db_user.kanjis.append(db_kanji)
        db.commit()

    # ✅ Convert ORM → schema (parts as list of strings)
    return schemas.Kanji(
        id=db_kanji.id,
        kanji=db_kanji.kanji,
        meaning=db_kanji.meaning,
        reading=db_kanji.reading,
        parts=[p.part for p in db_kanji.parts]
    )


@router.get("/api/users/{user_id}/kanjis", response_model=List[schemas.Kanji])
def get_saved_kanjis(user_id: int, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    result = []
    for k in db_user.kanjis:
        result.append(
            schemas.Kanji(
                id=k.id,
                kanji=k.kanji,
                meaning=k.meaning,
                reading=k.reading,
                parts=[p.part for p in k.parts]  # flatten Part objects into strings
            )
        )

    return result
