import { useState, useMemo, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import {
  BookOpen,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  Clock,
  Star,
  ArrowLeft,
  Zap,
  Search,
  Flame,
  LogOut,
  Trophy,
  Loader2,
} from "lucide-react";
import HomeIcon from "@/assets/icons/home.svg?react";
import DictionaryIcon from "@/assets/icons/dictionary.svg?react";
import AccountIcon from "@/assets/icons/account.svg?react";
import NoteStackIcon from "@/assets/icons/note_stack.svg?react";
import BarChartIcon from "@/assets/icons/bar_chart.svg?react";
import EmojiObjectsIcon from "@/assets/icons/emoji_objects.svg?react";
import ForumIcon from "@/assets/icons/forum.svg?react";
import KeepIcon from "@/assets/icons/keep.svg?react";
import SettingsIcon from "@/assets/icons/settings.svg?react";
import BridgeIcon from "@/assets/icons/bridge.svg?react";
import { useUserProgress } from "@/hooks/useUserProgress";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lesson {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  objective: string;
  published: boolean;
}

interface ContentTerm {
  id: number;
  term: string;
  title: string;
  description: string;
  example: string;
}

interface QuizQuestion {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctIndex: number;
  explanation: string;
}

interface ProgressEntry {
  lessonId: number;
  completed: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const XP_MAP: Record<string, number> = {
  BEGINNER: 10, Beginner: 10,
  INTERMEDIATE: 15, Intermediate: 15,
  ADVANCED: 20, Advanced: 20,
};

const badgeColorMap: Record<string, string> = {
  BEGINNER: "bg-lime/15 text-lime border-lime/30",
  Beginner: "bg-lime/15 text-lime border-lime/30",
  INTERMEDIATE: "bg-primary/15 text-primary border-primary/30",
  Intermediate: "bg-primary/15 text-primary border-primary/30",
  ADVANCED: "bg-coral/15 text-coral border-coral/30",
  Advanced: "bg-coral/15 text-coral border-coral/30",
};

const LEVELS = [
  { label: "Beginner",     min: 0,  max: 30  },
  { label: "Intermediate", min: 30, max: 80  },
  { label: "Advanced",     min: 80, max: 999 },
] as const;

// ─── XP Celebration overlay ───────────────────────────────────────────────────

function XPCelebration({ xp, onClose }: { xp: number; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2200);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-card rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ rotate: [0, -10, 10, -8, 8, 0] }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <Zap className="w-8 h-8 text-primary" />
          <span className="font-display text-5xl font-bold text-primary">+{xp} XP</span>
        </motion.div>
        <Button onClick={onClose} className="w-full">
          Continue
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const Learn = () => {
  const { xp, completedLessons, completeLesson } = useUserProgress();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // ── API state ──────────────────────────────────────────────────────────────
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, boolean>>({});
  const [loadingLessons, setLoadingLessons] = useState(true);

  // Lesson detail state (loaded on demand)
  const [lessonContent, setLessonContent] = useState<ContentTerm[]>([]);
  const [lessonQuiz, setLessonQuiz] = useState<QuizQuestion[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState<{ score: number; total: number } | null>(null);
  const [xpPop, setXpPop] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [currentPage, setCurrentPage] = useState<"home" | "learn">(
    () => (sessionStorage.getItem("learn_view") as "home" | "learn") ?? "home"
  );
  const [learnedWordsOpen, setLearnedWordsOpen] = useState(false);
  const [streak] = useState(() => parseInt(localStorage.getItem("gb_streak") ?? "0"));

  const changePage = (page: "home" | "learn") => {
    sessionStorage.setItem("learn_view", page);
    setCurrentPage(page);
  };

  // Keep a ref so popstate handler always sees the latest selectedLesson
  const selectedLessonRef = useRef(selectedLesson);
  useEffect(() => { selectedLessonRef.current = selectedLesson; }, [selectedLesson]);

  // Intercept browser back button
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const step = (e.state as any)?.learnStep;
      if (step === "lesson") {
        setSelectedLesson(null);
        setLessonContent([]);
        setLessonQuiz([]);
        setShowQuiz(false);
        setQuizAnswers({});
        setQuizSubmitted(false);
        setQuizScore(null);
      } else if (window.location.pathname === "/lessons") {
        setSelectedLesson(null);
        setLessonContent([]);
        setLessonQuiz([]);
        setShowQuiz(false);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // ── Fetch lessons + progress ───────────────────────────────────────────────
  useEffect(() => {
    const fetchAll = async () => {
      setLoadingLessons(true);
      try {
        const [lessonsRes, progressRes] = await Promise.all([
          api.get("/lessons"),
          api.get("/progress"),
        ]);
        setLessons(lessonsRes.data);
        const map: Record<number, boolean> = {};
        (progressRes.data.lessons as ProgressEntry[]).forEach((p) => {
          map[p.lessonId] = p.completed;
        });
        setProgressMap(map);
      } catch {
        toast({ title: "Error loading lessons" });
      } finally {
        setLoadingLessons(false);
      }
    };
    fetchAll();
  }, [location]);

  // ── Open a lesson — fetch content + quiz + mark started ───────────────────
  const handleLessonClick = async (lesson: Lesson) => {
    window.history.pushState({ learnStep: "lesson" }, "", "/lessons");
    setSelectedLesson(lesson);
    setShowQuiz(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
    setLoadingDetail(true);
    try {
      await api.post(`/lessons/${lesson.id}/start`);
      const [contentRes, quizRes] = await Promise.all([
        api.get(`/content/lesson/${lesson.id}`),
        api.get(`/lessons/${lesson.id}/quiz`),
      ]);
      setLessonContent(contentRes.data);
      setLessonQuiz(quizRes.data);
    } catch {
      toast({ title: "Error loading lesson content" });
    } finally {
      setLoadingDetail(false);
    }
  };

  // ── Submit quiz ────────────────────────────────────────────────────────────
  const handleQuizSubmit = async () => {
    if (!selectedLesson) return;
    const answers: Record<number, number> = quizAnswers;
    try {
      const res = await api.post(`/lessons/${selectedLesson.id}/quiz/submit`, { answers });
      const { score, totalQuestions, allCorrect } = res.data;
      setQuizScore({ score, total: totalQuestions });
      setQuizSubmitted(true);
      if (allCorrect) {
        const earned = completeLesson(selectedLesson.id.toString(), XP_MAP[selectedLesson.difficulty] ?? 10);
        if (earned > 0) setXpPop(earned);
        setProgressMap((prev) => ({ ...prev, [selectedLesson.id]: true }));
      }
    } catch {
      toast({ title: "Error submitting quiz" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  // ── Derived stats ──────────────────────────────────────────────────────────
  const completedCount = Object.values(progressMap).filter(Boolean).length;
  const totalCount = lessons.length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const currentLevel = [...LEVELS].reverse().find((l) => xp >= l.min) ?? LEVELS[0];
  const isMaxLevel = currentLevel.label === "Advanced";
  const levelProgressPct = isMaxLevel
    ? 100
    : Math.min(((xp - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100, 100);
  const xpToNext = isMaxLevel ? null : currentLevel.max - xp;

  // "Learned words" = all content terms from completed lessons
  const [learnedTermsList, setLearnedTermsList] = useState<ContentTerm[]>([]);
  useEffect(() => {
    const completedIds = Object.entries(progressMap)
      .filter(([, done]) => done)
      .map(([id]) => Number(id));
    if (completedIds.length === 0) { setLearnedTermsList([]); return; }
    Promise.all(completedIds.map((id) => api.get(`/content/lesson/${id}`)))
      .then((results) => setLearnedTermsList(results.flatMap((r) => r.data)))
      .catch(() => {});
  }, [progressMap]);

  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const diff = lesson.difficulty?.charAt(0).toUpperCase() + lesson.difficulty?.slice(1).toLowerCase();
      const matchesTag = selectedTag === "All" || diff === selectedTag;
      return matchesSearch && matchesTag;
    });
  }, [lessons, searchQuery, selectedTag]);

  const sidebarW = sidebarExpanded ? "w-72" : "w-16";
  const contentML = sidebarExpanded ? "ml-72" : "ml-16";

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const sidebar = (
    <aside
      className={`fixed top-0 left-0 h-full z-40 bg-card border-r border-border flex flex-col transition-all duration-300 ${sidebarW}`}
    >
      {sidebarExpanded ? (
        <div className="flex items-center h-16 px-4 border-b border-border shrink-0 gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <BridgeIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-sidebar text-xl font-bold text-foreground whitespace-nowrap flex-1">
            GenBridge
          </span>
          <button
            onClick={() => setSidebarExpanded(false)}
            title="Unpin sidebar"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          >
            <KeepIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setSidebarExpanded(true)}
          title="Pin sidebar"
          className="flex items-center justify-center h-16 w-full border-b border-border shrink-0 hover:bg-muted transition-colors"
        >
          <KeepIcon className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      <nav className="flex-1 p-3 space-y-1 overflow-hidden">
        {([
          { icon: HomeIcon,       label: "Home",  page: "home"  as const },
          { icon: DictionaryIcon, label: "Learn", page: "learn" as const },
        ]).map(({ icon: Icon, label, page }) => {
          const isActive = currentPage === page && !selectedLesson;
          return (
            <button
              key={label}
              onClick={() => { changePage(page); setSelectedLesson(null); setLessonContent([]); setLessonQuiz([]); setShowQuiz(false); }}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-sidebar text-xl font-semibold transition-colors ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              } ${!sidebarExpanded ? "justify-center" : ""}`}
            >
              <Icon className="w-6 h-6 shrink-0" />
              {sidebarExpanded && <span className="whitespace-nowrap">{label}</span>}
            </button>
          );
        })}
        <Link
          to="/forum"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sidebar text-xl font-semibold transition-colors text-muted-foreground hover:bg-muted hover:text-foreground ${!sidebarExpanded ? "justify-center" : ""}`}
        >
          <ForumIcon className="w-6 h-6 shrink-0" />
          {sidebarExpanded && <span className="whitespace-nowrap">Forum</span>}
        </Link>
        <Link
          to="/quests"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sidebar text-xl font-semibold transition-colors text-muted-foreground hover:bg-muted hover:text-foreground ${!sidebarExpanded ? "justify-center" : ""}`}
        >
          <Trophy className="w-6 h-6 shrink-0" />
          {sidebarExpanded && <span className="whitespace-nowrap">Quests</span>}
        </Link>
        <Link
          to="/profile"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sidebar text-xl font-semibold transition-colors text-muted-foreground hover:bg-muted hover:text-foreground ${!sidebarExpanded ? "justify-center" : ""}`}
        >
          <AccountIcon className="w-6 h-6 shrink-0" />
          {sidebarExpanded && <span className="whitespace-nowrap">Profile</span>}
        </Link>
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sidebar text-xl font-semibold transition-colors text-muted-foreground hover:bg-muted hover:text-foreground ${!sidebarExpanded ? "justify-center" : ""}`}
        >
          <SettingsIcon className="w-6 h-6 shrink-0" />
          {sidebarExpanded && <span className="whitespace-nowrap">Settings</span>}
        </Link>
      </nav>

      <div className="p-3 border-t border-border space-y-1 shrink-0">
        {sidebarExpanded ? (
          <div className="flex items-center gap-2 px-3 py-1.5">
            {streak > 0 && (
              <span className="flex items-center gap-1 text-orange-500 text-xs font-bold">
                <Flame className="w-4 h-4" />{streak}
              </span>
            )}
            <span className="flex items-center gap-1 text-primary text-xs font-bold ml-auto">
              <Star className="w-4 h-4" />{xp} XP
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            {streak > 0 && <Flame className="w-5 h-5 text-orange-500" />}
            <Star className="w-5 h-5 text-primary" />
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-sidebar text-xl font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${!sidebarExpanded ? "justify-center" : ""}`}
        >
          <LogOut className="w-6 h-6 shrink-0" />
          {sidebarExpanded && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );

  // ── Quiz view ──────────────────────────────────────────────────────────────
  if (selectedLesson && showQuiz) {
    const allAnswered = lessonQuiz.length > 0 && lessonQuiz.every((q) => quizAnswers[q.id] !== undefined);
    return (
      <div className="flex min-h-screen bg-background">
        {sidebar}
        <AnimatePresence>
          {xpPop !== null && <XPCelebration xp={xpPop} onClose={() => setXpPop(null)} />}
        </AnimatePresence>
        <div className={`flex-1 transition-all duration-300 ${contentML}`}>
          <div className="py-12 px-8 max-w-2xl mx-auto">
            <button
              onClick={() => setShowQuiz(false)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to lesson
            </button>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="font-display text-2xl font-bold text-foreground mb-1">
                Quiz — {selectedLesson.title}
              </h1>
              <p className="text-sm text-muted-foreground mb-8">
                Answer all questions correctly to mark the lesson as complete.
              </p>

              {lessonQuiz.length === 0 ? (
                <p className="text-muted-foreground text-center py-16">No quiz questions for this lesson yet.</p>
              ) : (
                <div className="space-y-8">
                  {lessonQuiz.map((q, qi) => {
                    const options = [q.optionA, q.optionB, q.optionC, q.optionD];
                    const chosen = quizAnswers[q.id];
                    return (
                      <div key={q.id} className="rounded-2xl border border-border bg-card p-6">
                        <p className="font-semibold text-foreground mb-4">
                          {qi + 1}. {q.questionText}
                        </p>
                        <div className="space-y-3">
                          {options.map((opt, idx) => {
                            let cls = "w-full text-left rounded-xl border px-5 py-3.5 text-sm transition-all ";
                            if (!quizSubmitted) {
                              cls += chosen === idx
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-border hover:border-primary hover:bg-primary/5 cursor-pointer";
                            } else {
                              if (idx === q.correctIndex) {
                                cls += "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400";
                              } else if (chosen === idx) {
                                cls += "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400";
                              } else {
                                cls += "border-border opacity-40";
                              }
                            }
                            return (
                              <button
                                key={idx}
                                disabled={quizSubmitted}
                                onClick={() => setQuizAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                                className={cls}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                        {quizSubmitted && q.explanation && (
                          <p className="text-xs text-muted-foreground mt-3 italic">{q.explanation}</p>
                        )}
                      </div>
                    );
                  })}

                  {!quizSubmitted ? (
                    <Button
                      size="lg"
                      className="w-full"
                      disabled={!allAnswered}
                      onClick={handleQuizSubmit}
                    >
                      Submit Quiz
                    </Button>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-2xl border border-border bg-card p-6 text-center"
                    >
                      {quizScore && (
                        <>
                          <p className="font-display text-3xl font-bold text-foreground mb-1">
                            {quizScore.score}%
                          </p>
                          <p className="text-muted-foreground text-sm mb-4">
                            {quizScore.score === 100
                              ? "Perfect! Lesson marked as complete."
                              : `${Math.round((quizScore.score / 100) * quizScore.total)}/${quizScore.total} correct — try again to complete the lesson.`}
                          </p>
                        </>
                      )}
                      <div className="flex gap-3 justify-center">
                        <Button variant="outline" onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); setQuizScore(null); }}>
                          Retry
                        </Button>
                        <Button onClick={() => setShowQuiz(false)}>
                          Back to lesson
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ── Lesson detail view ─────────────────────────────────────────────────────
  if (selectedLesson) {
    const isComplete = progressMap[selectedLesson.id] === true;
    return (
      <div className="flex min-h-screen bg-background">
        {sidebar}
        <AnimatePresence>
          {xpPop !== null && <XPCelebration xp={xpPop} onClose={() => setXpPop(null)} />}
        </AnimatePresence>
        <div className={`flex-1 transition-all duration-300 ${contentML}`}>
          <div className="py-12 px-8 max-w-3xl mx-auto">
            <button
              onClick={() => { setSelectedLesson(null); setLessonContent([]); setLessonQuiz([]); }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> All lessons
            </button>

            {loadingDetail ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant="outline" className={badgeColorMap[selectedLesson.difficulty] ?? ""}>
                    {selectedLesson.difficulty}
                  </Badge>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Zap className="w-3.5 h-3.5 text-primary" />
                    {XP_MAP[selectedLesson.difficulty]} XP
                  </span>
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                  {selectedLesson.title}
                </h1>
                {selectedLesson.objective && (
                  <p className="text-muted-foreground mb-10">{selectedLesson.objective}</p>
                )}

                {/* Content terms */}
                {lessonContent.length > 0 && (
                  <div className="space-y-6 mb-12">
                    {lessonContent.map((term, i) => (
                      <motion.div
                        key={term.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.07 }}
                        className="rounded-2xl border border-border bg-card p-6"
                      >
                        <h2 className="font-display text-xl font-semibold text-foreground mb-1">
                          {term.title || term.term}
                        </h2>
                        <p className="text-sm font-bold text-primary mb-3">{term.term}</p>
                        <p className="text-foreground/80 leading-relaxed mb-3">{term.description}</p>
                        {term.example && (
                          <p className="text-sm text-muted-foreground pl-4 border-l-2 border-coral/30 italic">
                            {term.example}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}

                {lessonContent.length > 0 && (
                  <div className="rounded-2xl border border-border bg-card p-6 mb-10">
                    <h3 className="font-display text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-primary" /> Key Terms
                    </h3>
                    <div className="space-y-3">
                      {lessonContent.map((term) => (
                        <div key={term.id} className="flex gap-3">
                          <span className="font-semibold text-primary whitespace-nowrap">{term.term}</span>
                          <span className="text-muted-foreground">— {term.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  {isComplete ? (
                    <div className="flex items-center gap-2 text-primary font-medium">
                      <CheckCircle2 className="w-5 h-5" /> Lesson completed!
                    </div>
                  ) : null}
                  {lessonQuiz.length > 0 && (
                    <Button size="lg" onClick={() => setShowQuiz(true)}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {isComplete ? "Retake Quiz" : "Take Quiz"}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Home view ──────────────────────────────────────────────────────────────
  if (currentPage === "home") {
    const nextLesson = lessons.find((l) => !progressMap[l.id]);
    return (
      <div className="flex h-screen overflow-hidden bg-background">
        {sidebar}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${contentML} py-10 px-10`}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-4xl font-bold text-foreground mb-1">Home</h1>
                <p className="text-sm text-muted-foreground">Welcome back — let's keep learning.</p>
              </div>
              <button
                onClick={() => changePage("learn")}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Continue learning <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* My Progress */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold text-card-foreground">My progress</h2>
                  <span className="text-sm font-bold text-primary">{xp} XP</span>
                </div>
                <div className="rounded-xl bg-muted/40 p-4 mb-4">
                  <p className="text-sm text-muted-foreground font-medium mb-2">
                    Current level — {currentLevel.label}
                  </p>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
                    {LEVELS.map((l) => (
                      <span
                        key={l.label}
                        className={`font-medium ${l.label === currentLevel.label ? "text-primary" : ""}`}
                      >
                        {l.label}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1 mb-1.5">
                    {LEVELS.map((l) => {
                      const isPast = xp >= l.max;
                      const isCurrent = l.label === currentLevel.label;
                      return (
                        <div key={l.label} className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: isPast ? "100%" : isCurrent ? `${levelProgressPct}%` : "0%" }}
                          />
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isMaxLevel
                      ? "You've reached the top level!"
                      : `${xpToNext} XP to ${LEVELS[LEVELS.findIndex((l) => l.label === currentLevel.label) + 1].label}`}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-muted/40 p-3 text-center">
                    <p className="font-bold text-2xl text-foreground">{completedCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Lessons done</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 text-center">
                    <p className="font-bold text-2xl text-foreground">{streak}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Day streak</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 text-center">
                    <p className="font-bold text-2xl text-primary">{xp}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Total XP</p>
                  </div>
                </div>
              </div>

              {/* My Words + Activities */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <NoteStackIcon className="w-6 h-6 text-primary" />
                    <span className="font-display text-xl font-semibold text-card-foreground">My Words</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <button
                      onClick={() => learnedTermsList.length > 0 && setLearnedWordsOpen(true)}
                      className={`rounded-xl bg-primary/5 p-3 text-center w-full transition-colors ${learnedTermsList.length > 0 ? "hover:bg-primary/10 cursor-pointer" : "cursor-default"}`}
                    >
                      <Star className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="font-bold text-2xl text-foreground leading-none">{learnedTermsList.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Learned</p>
                    </button>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <BookOpen className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                      <p className="font-bold text-2xl text-foreground leading-none">
                        {totalCount - completedCount}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Left</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                      <p className="font-bold text-2xl text-foreground leading-none">{totalCount}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChartIcon className="w-6 h-6 text-primary" />
                    <span className="font-display text-xl font-semibold text-card-foreground">My Activities</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Overall progress</p>
                  <div className="flex items-end gap-2 mb-3">
                    <span className="font-display text-4xl font-bold text-foreground leading-none">
                      {completedCount}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">/ {totalCount} lessons</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              </div>
            </div>

            {/* Slang of the Day — pulled from first uncompleted lesson's first content term */}
            {lessons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-6"
              >
                <div className="flex items-center gap-2 text-primary mb-3">
                  <EmojiObjectsIcon className="w-4 h-4" />
                  <span className="text-base font-bold uppercase tracking-widest">Did you know?</span>
                </div>
                <p className="font-display text-3xl font-bold text-foreground mb-2">
                  {lessons[0].title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {lessons[0].description}
                </p>
              </motion.div>
            )}

            {/* Up Next */}
            {nextLesson && (
              <button
                onClick={() => handleLessonClick(nextLesson)}
                className="w-full rounded-2xl border border-border bg-card p-5 flex items-center justify-between hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">
                      Up Next
                    </p>
                    <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                      {nextLesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{nextLesson.difficulty}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
              </button>
            )}

          </motion.div>
        </main>

        {/* Learned Words Dialog */}
        <Dialog open={learnedWordsOpen} onOpenChange={setLearnedWordsOpen}>
          <DialogContent className="max-w-md max-h-[70vh] flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                Learned Words ({learnedTermsList.length})
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {learnedTermsList.map((t) => (
                <div key={t.id} className="rounded-xl border border-border bg-muted/30 px-4 py-3">
                  <p className="font-semibold text-sm text-foreground">{t.term}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                </div>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ── Learn view (lessons list) ──────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebar}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${contentML} py-10 px-8`}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

          <div className="mb-6">
            <h1 className="font-display text-4xl font-bold text-foreground mb-1">Learn</h1>
            <p className="text-muted-foreground">Explore Gen Alpha language, memes, and culture.</p>
          </div>

          {/* Overall progress bar */}
          <div className="rounded-2xl border border-border bg-card p-5 mb-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Star className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">Overall Progress</p>
              <Progress value={overallProgress} className="h-2 mt-1.5" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">
              {completedCount}/{totalCount} lessons
            </span>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or description"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {(["All", "Beginner", "Intermediate", "Advanced"] as const).map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    selectedTag === tag
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Lessons list */}
          {loadingLessons ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredLessons.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">
              {lessons.length === 0 ? "No lessons available yet." : "No lessons match your search."}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredLessons.map((lesson, i) => {
                const isCompleted = progressMap[lesson.id] === true;
                return (
                  <motion.button
                    key={lesson.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    onClick={() => handleLessonClick(lesson)}
                    className="w-full text-left rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow group"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          isCompleted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Clock className="w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="font-display text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">
                            {lesson.title}
                          </h2>
                          <Badge variant="outline" className={badgeColorMap[lesson.difficulty] ?? ""}>
                            {lesson.difficulty}
                          </Badge>
                          <span className="flex items-center gap-0.5 text-xs text-primary font-medium ml-auto shrink-0">
                            <Zap className="w-3 h-3" /> {XP_MAP[lesson.difficulty]} XP
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{lesson.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Learn;
