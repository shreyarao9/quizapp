"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useRouter } from "next/navigation";

type Quiz = {
  id: string;
  title: string;
  description: string;
};

export default function UserDashboard() {
  const { token, isAuthenticated, loading } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!token) return;
    const fetchQuizzes = async () => {
      const url = `api/quizzes/`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setQuizzes(data);
    };
    fetchQuizzes();
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Available Quizzes</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {quizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="border rounded p-4 hover:shadow-md space-y-2"
          >
            <h2 className="text-lg font-bold">{quiz.title}</h2>
            <p className="text-sm text-gray-600">{quiz.description}</p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  router.push(
                    `/quiz/${quiz.id}?title=${encodeURIComponent(quiz.title)}`,
                  )
                }
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Attempt Quiz
              </button>
              <button
                onClick={() => router.push(`/leaderboard/${quiz.id}`)}
                className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
