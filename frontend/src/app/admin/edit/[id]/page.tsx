"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

type QuestionInput = {
  text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "a" | "b" | "c" | "d" | "";
};

export default function EditQuizPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { token } = useAuth();

  // Extract quiz_id from URL path `/admin/edit/[id]`
  const quizId = pathname.split("/").pop() || "";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([]);

  useEffect(() => {
    if (!token) return;

    const fetchQuizData = async () => {
      try {
        // Fetch all quizzes
        const quizListRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/quizzes/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const quizzes = await quizListRes.json();

        const quizMeta = quizzes.find((q: any) => q.id === parseInt(quizId));
        if (quizMeta) {
          setTitle(quizMeta.title);
          setDescription(quizMeta.description);
        }

        // Fetch questions for the specific quiz
        const questionsRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}/questions`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        const questionsData = await questionsRes.json();

        setQuestions(
          questionsData.map((q: any) => ({
            text: q.text,
            option_a: q.option_a ?? "",
            option_b: q.option_b ?? "",
            option_c: q.option_c ?? "",
            option_d: q.option_d ?? "",
            correct_option: "", // left empty since not provided by backend
          })),
        );
      } catch (error) {
        console.error("Failed to load quiz for editing:", error);
      }
    };

    fetchQuizData();
  }, [quizId, token]);
  const handleQuestionChange = (
    index: number,
    field: keyof QuestionInput,
    value: string,
  ) => {
    const updated = [...questions];
    updated[index][field] = value as any;
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_option: "",
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const submitQuiz = async () => {
    const payload = {
      title,
      description,
      time_limit: 0, // ignored
      questions,
    };

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quizId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      },
    );

    if (res.ok) {
      alert("Quiz updated!");
      router.push("/admin/dashboard");
    } else {
      alert("Failed to update quiz");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Edit Quiz</h1>

      <input
        className="border px-4 py-2 w-full mb-4"
        placeholder="Quiz Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className="border px-4 py-2 w-full mb-6"
        placeholder="Quiz Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {questions.map((q, i) => (
        <div key={i} className="border p-4 mb-4 rounded space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Question {i + 1}</h3>
            <button
              type="button"
              onClick={() => removeQuestion(i)}
              className="text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>

          <input
            type="text"
            className="border px-2 py-1 w-full"
            placeholder="Question text"
            value={q.text}
            onChange={(e) => handleQuestionChange(i, "text", e.target.value)}
          />

          {(["a", "b", "c", "d"] as const).map((letter) => {
            const key = `option_${letter}` as const;
            return (
              <input
                key={key}
                type="text"
                className="border px-2 py-1 w-full"
                placeholder={`Option ${letter.toUpperCase()}`}
                value={q[key]}
                onChange={(e) => handleQuestionChange(i, key, e.target.value)}
              />
            );
          })}

          <label className="block mt-2">
            Correct Option:
            <select
              value={q.correct_option}
              onChange={(e) =>
                handleQuestionChange(i, "correct_option", e.target.value)
              }
              className="ml-2 border px-2 py-1"
            >
              <option value="">Select correct option</option>
              <option value="a">A</option>
              <option value="b">B</option>
              <option value="c">C</option>
              <option value="d">D</option>
            </select>
          </label>
        </div>
      ))}
      <button
        onClick={addQuestion}
        className="bg-gray-500 text-white px-4 py-2 rounded mr-4"
      >
        + Add Question
      </button>
      <button
        onClick={submitQuiz}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Save Changes
      </button>
    </div>
  );
}
