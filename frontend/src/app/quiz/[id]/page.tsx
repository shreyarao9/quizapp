"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

type Question = {
  id: number;
  text: string;
  option_a: string | null;
  option_b: string | null;
  option_c: string | null;
  option_d: string | null;
};

type Quiz = {
  id: number;
  title: string;
  questions: Question[];
};
export default function AttemptQuiz() {
  const { token } = useAuth();
  const { id } = useParams();
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchQuizAndQuestions = async () => {
      const questionsRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}/questions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const questionsData: Question[] = await questionsRes.json();

      const formattedQuiz: Quiz = {
        id: parseInt(id as string, 10),
        title: `Quiz ${id}`, // fallback title if not included in questions API
        questions: questionsData,
      };

      setQuiz(formattedQuiz);
    };
    fetchQuizAndQuestions();
  }, [id, token]);

  const handleChange = (questionId: string, selected: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selected }));
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.entries(answers).map(([qid, selected]) => ({
      question_id: parseInt(qid, 10),
      selected_option: selected,
    }));

    const payload = { answers: formattedAnswers };
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}/attempt`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (res.ok) {
      setSubmitted(true);
      alert("Quiz submitted successfully!");
      router.push("/dashboard");
    } else {
      alert("Submission failed.");
    }
  };

  if (!quiz) return <p className="p-6">Loading quiz...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{quiz.title}</h1>

      {quiz.questions.map((q, index) => (
        <div key={q.id} className="space-y-2">
          <p className="font-medium">
            {index + 1}. {q.text}
          </p>
          <div className="space-y-1">
            {["option_a", "option_b", "option_c", "option_d"].map((key) => {
              const opt = q[key as keyof Question];
              if (typeof opt !== "string") return null;
              return (
                <label key={key} className="block">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt}
                    checked={answers[q.id.toString()] === opt}
                    onChange={() => handleChange(q.id.toString(), opt)}
                    className="mr-2"
                  />
                  {opt}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      <button
        disabled={submitted}
        onClick={handleSubmit}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        Submit Quiz
      </button>
    </div>
  );
}
