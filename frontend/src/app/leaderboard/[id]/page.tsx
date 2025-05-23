"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/hooks/useAuth";

type LeaderboardEntry = {
  user_id: number;
  score: number;
};

export default function LeaderboardPage() {
  const { id: quizId } = useParams();
  const { token } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  const searchParams = useSearchParams();
  const title = searchParams.get("title") || "";

  useEffect(() => {
    if (!quizId || !token) return;

    const fetchLeaderboard = async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/quizzes/leaderboard/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
      }
    };

    fetchLeaderboard();
  }, [quizId, token]);

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Leaderboard: {title}</h1>

      {entries.length === 0 ? (
        <p>No attempts yet.</p>
      ) : (
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">User ID</th>
              <th className="p-2 border">Score</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, i) => (
              <tr key={i}>
                <td className="p-2 border">{entry.user_id}</td>
                <td className="p-2 border">{entry.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
