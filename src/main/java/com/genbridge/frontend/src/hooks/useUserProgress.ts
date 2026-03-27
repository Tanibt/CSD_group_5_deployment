import { useState, useEffect } from "react";

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

  useEffect(() => {
    const today = new Date().toDateString();
    const last = localStorage.getItem("gb_lastLogin");
    const yesterday = new Date(Date.now() - 86_400_000).toDateString();

    if (last !== today) {
      const newStreak = last === yesterday ? streak + 1 : 1;
      setStreak(newStreak);
      localStorage.setItem("gb_streak", String(newStreak));
      localStorage.setItem("gb_lastLogin", today);
      window.dispatchEvent(new Event("gb_progress"));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
