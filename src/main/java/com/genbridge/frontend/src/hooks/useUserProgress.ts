import { useState, useEffect } from "react";
import api from "@/services/api";

export function useUserProgress() {
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem("gb_xp") ?? "0"));
  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("gb_streak") ?? "0"));
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem("gb_completed");
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Seed from API on mount so XP/streak/completions survive localStorage clears
  useEffect(() => {
    api.get("/profile")
      .then((res) => {
        const data = res.data;

        const apiXp: number = data.xp ?? 0;
        setXp(apiXp);
        localStorage.setItem("gb_xp", String(apiXp));

        const apiStreak: number = data.currentStreak ?? 0;
        setStreak(apiStreak);
        localStorage.setItem("gb_streak", String(apiStreak));

        const completedIds: Set<string> = new Set(
          (data.completedLessons ?? []).map((l: { lessonId: number }) => String(l.lessonId))
        );
        setCompletedLessons(completedIds);
        localStorage.setItem("gb_completed", JSON.stringify([...completedIds]));
      })
      .catch(() => {
        // fall back to localStorage values already loaded in useState initialisers
      });
  }, []);

  const completeLesson = (lessonId: string, xpAmt: number): number => {
    if (completedLessons.has(lessonId)) return 0;
    const next = new Set(completedLessons);
    next.add(lessonId);
    setCompletedLessons(next);
    localStorage.setItem("gb_completed", JSON.stringify([...next]));
    const nextXp = xp + xpAmt;
    setXp(nextXp);
    localStorage.setItem("gb_xp", String(nextXp));
    window.dispatchEvent(new Event("gb_progress"));
    return xpAmt;
  };

  return { xp, streak, completedLessons, completeLesson };
}
