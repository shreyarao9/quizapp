from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, database
from ..dependencies import get_current_admin, get_current_user

router = APIRouter(prefix="/quizzes", tags=["Quizzes"])


@router.post("/", summary="Admin creates a quiz")
def create_quiz(quiz: schemas.QuizCreate, db: Session = Depends(database.get_db), admin=Depends(get_current_admin)):
    new_quiz = models.Quiz(
        title=quiz.title,
        description=quiz.description,
        time_limit=quiz.time_limit,
        creator_id=admin.id
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)

    for q in quiz.questions:
        db_question = models.Question(
            quiz_id=new_quiz.id,
            text=q.text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            correct_option=q.correct_option
        )
        db.add(db_question)

    db.commit()
    return {"msg": "Quiz created", "quiz_id": new_quiz.id}
