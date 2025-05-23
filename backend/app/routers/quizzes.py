from fastapi import APIRouter, Depends, HTTPException, status
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


@router.get("/", summary="View all quizzes")
def get_quizzes(db: Session = Depends(database.get_db), user=Depends(get_current_user)):
    quizzes = db.query(models.Quiz).all()
    return quizzes


@router.get("/{quiz_id}/questions")
def get_quiz_questions(quiz_id: int, db: Session = Depends(database.get_db), user=Depends(get_current_user)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(models.Question).filter(
        models.Question.quiz_id == quiz_id).all()
    return [
        {
            "id": q.id,
            "text": q.text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d
        } for q in questions
    ]


@router.post("/{quiz_id}/attempt", response_model=schemas.AttemptResult)
def attempt_quiz(quiz_id: int, submission: schemas.AttemptSubmit,
                 db: Session = Depends(database.get_db), user=Depends(get_current_user)):

    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    total_questions = len(submission.answers)
    correct = 0
    review_list = []

    attempt = models.Attempt(
        user_id=user.id, quiz_id=quiz_id, score=0, total=total_questions)
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    for ans in submission.answers:
        question = db.query(models.Question).filter(
            models.Question.id == ans.question_id).first()
        is_correct = (question.correct_option == ans.selected_option)
        if is_correct:
            correct += 1

        db.add(models.Answer(attempt_id=attempt.id,
                             question_id=question.id,
                             selected_option=ans.selected_option))

        review_list.append(schemas.AnswerReview(
            question=question.text,
            selected=ans.selected_option,
            correct=question.correct_option
        ))

    attempt.score = correct
    db.commit()

    return schemas.AttemptResult(score=correct, total=total_questions, review=review_list)


@router.put("/{quiz_id}", summary="Admin updates quiz")
def update_quiz(quiz_id: int, updated: schemas.QuizCreate,
                db: Session = Depends(database.get_db), admin=Depends(get_current_admin)):

    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    quiz.title = updated.title
    quiz.description = updated.description
    quiz.time_limit = updated.time_limit
    db.commit()

    # Remove old questions and add new ones
    db.query(models.Question).filter(
        models.Question.quiz_id == quiz_id).delete()
    db.commit()

    for q in updated.questions:
        db.add(models.Question(
            quiz_id=quiz_id,
            text=q.text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            correct_option=q.correct_option
        ))

    db.commit()
    return {"msg": "Quiz updated"}


@router.delete("/{quiz_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_quiz(quiz_id: int, db: Session = Depends(database.get_db), admin=Depends(get_current_admin)):
    db.query(models.Attempt).filter(models.Attempt.quiz_id == quiz_id).delete()
    db.query(models.Quiz).filter(models.Quiz.id == quiz_id).delete()
    db.commit()


@router.get("/leaderboard/{quiz_id}")
def get_leaderboard(quiz_id: int, db: Session = Depends(database.get_db)):
    top_scores = (db.query(models.Attempt.user_id, models.Attempt.score)
                    .filter(models.Attempt.quiz_id == quiz_id)
                    .order_by(models.Attempt.score.desc())
                    .limit(10)
                    .all())
    return [{"user_id": u, "score": s} for u, s in top_scores]
