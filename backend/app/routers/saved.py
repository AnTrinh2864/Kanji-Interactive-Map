from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import models, schemas
from app.database import SessionLocal

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/api/save_kanji/", response_model=schemas.Kanji)
def save_kanji(user_id: int, kanji: schemas.KanjiCreate, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_kanji = models.Kanji(
        user_id=user_id,
        kanji=kanji.kanji,
        meaning=kanji.meaning,
        readings=kanji.readings,
    )
    db.add(new_kanji)
    db.commit()
    db.refresh(new_kanji)

    for p in kanji.parts:
        db.add(models.KanjiPart(saved_kanji_id=new_kanji.id, part=p.part, part_meaning=p.part_meaning))
    db.commit()
    db.refresh(new_kanji)

    return new_kanji

@router.get("/api/user/{user_id}/kanjis", response_model=list[schemas.Kanji])
def get_user_kanjis(user_id: int, db: Session = Depends(get_db)):
    return db.query(models.SavedKanji).filter(models.SavedKanji.user_id == user_id).all()
