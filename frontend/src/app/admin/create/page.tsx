"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

type QuestionInput = {
  text: string;
  options: string[];
  correct_option: "a" | "b" | "c" | "d" | "";
};

export default function CreateQuizPage() {
  const router = useRouter();
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { text: "", options: ["", "", "", ""], correct_option: "" },
  ]);

  const handleQuestionChange = (
    index: number,
    key: string,
    value: string,
    optIdx?: number,
  ) => {
    const updated = [...questions];
    if (key === "text") {
      updated[index].text = value;
    } else if (key === "option" && typeof optIdx === "number") {
      updated[index].options[optIdx] = value;
    } else if (key === "correct_option") {
      updated[index].correct_option = value as QuestionInput["correct_option"];
    }
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], correct_option: "" },
    ]);
  };

  const submitQuiz = async () => {
    const payload = {
      title,
      description,
      questions: questions.map((q) => ({
        text: q.text,
        option_a: q.options[0] || null,
        option_b: q.options[1] || null,
        option_c: q.options[2] || null,
        option_d: q.options[3] || null,
        correct_option: q.correct_option,
      })),
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      alert("Quiz created!");
      router.push("/admin/dashboard");
    } else {
      alert("Failed to create quiz");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Create New Quiz</h1>

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
        <div key={i} className="border p-4 mb-4 rounded">
          <input
            className="border px-2 py-1 w-full mb-2"
            placeholder={`Question ${i + 1}`}
            value={q.text}
            onChange={(e) => handleQuestionChange(i, "text", e.target.value)}
          />
          {q.options.map((opt, j) => (
            <input
              key={j}
              className="border px-2 py-1 w-full mb-1"
              placeholder={`Option ${String.fromCharCode(65 + j)}`}
              value={opt}
              onChange={(e) =>
                handleQuestionChange(i, "option", e.target.value, j)
              }
            />
          ))}
          <select
            className="border px-2 py-1 w-full mt-2"
            value={q.correct_option}
            onChange={(e) =>
              handleQuestionChange(i, "correct_option", e.target.value)
            }
          >
            <option value="">Select Correct Answer</option>
            <option value="a" className="text-black">
              Option A
            </option>
            <option value="b" className="text-black">
              Option B
            </option>
            <option value="c" className="text-black">
              Option C
            </option>
            <option value="d" className="text-black">
              Option D
            </option>
          </select>
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
        Submit Quiz
      </button>
    </div>
  );
}
