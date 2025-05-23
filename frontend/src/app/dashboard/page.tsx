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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/`, {
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
            className="border rounded p-4 hover:shadow-md cursor-pointer"
            onClick={() => router.push(`/quiz/${quiz.id}`)}
          >
            <h2 className="text-lg font-bold">{quiz.title}</h2>
            <p className="text-sm text-gray-600">{quiz.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
