"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";

type Quiz = {
  id: string;
  title: string;
  description: string;
};

export default function AdminDashboard() {
  const { token, isAuthenticated, role, loading } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || role !== "admin")) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, role, router]);

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <button
          onClick={() => router.push("/admin/create")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Create New Quiz
        </button>
      </div>
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
                onClick={() => router.push(`/admin/edit/${quiz.id}`)}
                className="text-blue-600 hover:underline"
              >
                Edit
              </button>
              <button
                onClick={async () => {
                  const confirmed = confirm("Delete this quiz?");
                  if (!confirmed) return;
                  await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${quiz.id}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${token}`,
                      },
                    },
                  );
                  setQuizzes((q) => q.filter((x) => x.id !== quiz.id));
                }}
                className="text-red-600 hover:underline"
              >
                Delete
              </button>
              <button
                onClick={() =>
                  router.push(
                    `/leaderboard/${quiz.id}?title=${encodeURIComponent(quiz.title)}`,
                  )
                }
                className="text-purple-600 hover:underline"
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
