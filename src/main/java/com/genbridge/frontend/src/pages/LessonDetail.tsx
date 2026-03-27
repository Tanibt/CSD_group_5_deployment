import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import {
  BookOpen,
  MessageCircle,
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
  Loader2,
} from "lucide-react";

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
  lessonId: number;
  title: string;
  term: string;
  description: string;
  example: string;
  orderIndex: number;
}

interface QuizQuestion {
  id: number;
  lessonId: number;
  questionText: string;
  options: string[];
  explanation: string;
}

const badgeColorMap: Record<string, string> = {
  BEGINNER: "bg-lime/15 text-lime border-lime/30",
  Beginner: "bg-lime/15 text-lime border-lime/30",
  INTERMEDIATE: "bg-primary/15 text-primary border-primary/30",
  Intermediate: "bg-primary/15 text-primary border-primary/30",
  ADVANCED: "bg-coral/15 text-coral border-coral/30",
  Advanced: "bg-coral/15 text-coral border-coral/30",
};

const LessonDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [content, setContent] = useState<ContentTerm[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  // quiz state
  const [quizView, setQuizView] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    completed: boolean;
  } | null>(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    if (!id) return;
    const lessonId = parseInt(id);

    const fetchAll = async () => {
      setLoading(true);
      try {
        // Start progress tracking (non-blocking)
        api.post(`/lessons/${lessonId}/start`).catch(() => {});

        const [lessonRes, contentRes, quizRes, progressRes] = await Promise.all([
          api.get(`/lessons/${lessonId}`),
          api.get(`/content/lesson/${lessonId}`),
          api.get(`/lessons/${lessonId}/quiz`),
          api.get("/progress"),
        ]);

        setLesson(lessonRes.data);
        setContent(contentRes.data);
        setQuizQuestions(quizRes.data);

        const completed = (progressRes.data.lessons as { lessonId: number; completed: boolean }[])
          .some((p) => p.lessonId === lessonId && p.completed);
        setIsCompleted(completed);
      } catch {
        toast({ title: "Error loading lesson" });
        navigate("/lessons");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const submitQuiz = async () => {
    if (!lesson) return;
    setSubmittingQuiz(true);
    try {
      const res = await api.post(`/lessons/${lesson.id}/quiz/submit`, { answers });
      setQuizResult(res.data);
      if (res.data.completed) setIsCompleted(true);
    } catch {
      toast({ title: "Error submitting quiz" });
    } finally {
      setSubmittingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex justify-center pt-40">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!lesson) return null;

  // ── Quiz view ────────────────────────────────────────────────────────────

  if (quizView) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="container mx-auto max-w-3xl">
            <button
              onClick={() => { setQuizView(false); setQuizResult(null); setAnswers({}); }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to lesson
            </button>

            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Quiz: {lesson.title}
            </h1>
            <p className="text-muted-foreground mb-8">
              Answer all questions and submit to complete this lesson.
            </p>

            {quizQuestions.length === 0 ? (
              <p className="text-muted-foreground">No quiz questions available for this lesson yet.</p>
            ) : quizResult ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-8 text-center"
              >
                <div className="text-5xl font-bold text-primary mb-2">{quizResult.score}%</div>
                <p className="text-muted-foreground mb-1">
                  {quizResult.correctAnswers} / {quizResult.totalQuestions} correct
                </p>
                {quizResult.completed ? (
                  <div className="flex items-center justify-center gap-2 text-primary font-medium mt-4">
                    <CheckCircle2 className="w-5 h-5" /> Lesson completed!
                  </div>
                ) : (
                  <p className="text-muted-foreground mt-4 text-sm">
                    Answer all questions correctly to complete the lesson.
                  </p>
                )}
                <Button className="mt-6" onClick={() => { setQuizView(false); setQuizResult(null); setAnswers({}); }}>
                  Back to lesson
                </Button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {quizQuestions.map((q, qi) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: qi * 0.05 }}
                    className="rounded-2xl border border-border bg-card p-6"
                  >
                    <p className="font-semibold text-card-foreground mb-4">
                      {qi + 1}. {q.questionText}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => setAnswers({ ...answers, [q.id]: i })}
                          className={`w-full text-left rounded-xl border px-4 py-3 text-sm transition-colors ${
                            answers[q.id] === i
                              ? "border-primary bg-primary/10 text-primary font-medium"
                              : "border-border hover:border-primary/40 text-foreground"
                          }`}
                        >
                          {i + 1}. {opt}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}

                <Button
                  size="lg"
                  className="w-full"
                  disabled={Object.keys(answers).length < quizQuestions.length || submittingQuiz}
                  onClick={submitQuiz}
                >
                  {submittingQuiz ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    "Submit Quiz"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Lesson detail view ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <button
            onClick={() => navigate("/lessons")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" /> All lessons
          </button>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className={badgeColorMap[lesson.difficulty] ?? ""}>
                {lesson.difficulty}
              </Badge>
              {isCompleted && (
                <span className="flex items-center gap-1 text-sm text-primary font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Completed
                </span>
              )}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              {lesson.title}
            </h1>
            <p className="text-muted-foreground mb-2">{lesson.description}</p>
            {lesson.objective && (
              <p className="text-sm text-primary/80 font-medium mb-10">
                Objective: {lesson.objective}
              </p>
            )}

            {/* Content terms */}
            {content.length === 0 ? (
              <p className="text-muted-foreground mb-10">No content available for this lesson yet.</p>
            ) : (
              <div className="space-y-6 mb-12">
                {content.map((term, i) => (
                  <motion.div
                    key={term.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="rounded-2xl border border-border bg-card p-6"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-display text-lg font-bold text-primary">{term.term}</span>
                      {term.title !== term.term && (
                        <span className="text-sm text-muted-foreground">({term.title})</span>
                      )}
                    </div>
                    <p className="text-foreground/80 leading-relaxed mb-3">{term.description}</p>
                    {term.example && (
                      <div className="pl-4 border-l-2 border-primary/30">
                        <p className="text-sm text-muted-foreground flex items-start gap-2">
                          <MessageCircle className="w-4 h-4 text-primary/60 mt-0.5 shrink-0" />
                          {term.example}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* Key Terms summary */}
            {content.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6 mb-8">
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> Key Terms
                </h3>
                <div className="space-y-2">
                  {content.map((term) => (
                    <div key={term.id} className="flex gap-3">
                      <span className="font-semibold text-primary whitespace-nowrap">{term.term}</span>
                      <span className="text-muted-foreground">— {term.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quiz CTA */}
            {quizQuestions.length > 0 && (
              <Button size="lg" onClick={() => setQuizView(true)}>
                {isCompleted ? "Retake Quiz" : "Take Quiz to Complete"}
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {quizQuestions.length === 0 && content.length > 0 && (
              <p className="text-sm text-muted-foreground mt-4">
                No quiz available yet — check back later.
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LessonDetail;
