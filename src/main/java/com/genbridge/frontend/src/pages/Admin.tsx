import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import AdminSidebar from "@/components/AdminSidebar";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

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
  term: string;
  description: string;
  example: string;
  orderIndex: number;
}

interface Quest {
  id: number;
  title: string;
  description: string;
  instruction: string;
  published: boolean;
}

const difficultyOptions = ["Beginner", "Intermediate", "Advanced"];

export default function Admin() {
  const role = localStorage.getItem("role");
  const { toast } = useToast();
  const topRef = useRef<HTMLDivElement>(null);

  if (role !== "ADMIN") return <Navigate to="/lessons" replace />;

  const [tab, setTab] = useState<"lessons" | "content" | "quiz" | "reports" | "forum" | "quests">("lessons");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [contentTerms, setContentTerms] = useState<ContentTerm[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<{ type: "lesson" | "content" | "quiz"; id: number; title: string } | null>(null);

  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingContent, setEditingContent] = useState<ContentTerm | null>(
    null,
  );

  const [savingLesson, setSavingLesson] = useState(false);
  const [savingContent, setSavingContent] = useState(false);

  const emptyLessonForm = {
    title: "",
    description: "",
    difficulty: "",
    objective: "",
  };

  const emptyContentForm = {
    term: "",
    description: "",
    example: "",
    orderIndex: 0,
  };

  const [lessonForm, setLessonForm] = useState(emptyLessonForm);
  const [contentForm, setContentForm] = useState(emptyContentForm);

  // ================= QUIZ STATE =================
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [quizLessonId, setQuizLessonId] = useState<number | null>(null);

  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [savingQuiz, setSavingQuiz] = useState(false);

  const emptyQuizForm = {
    questionText: "",
    options: ["", "", "", ""],
    correctIndex: 0,
    explanation: "",
  };

  const [quizForm, setQuizForm] = useState(emptyQuizForm);
  const [editingQuestion, setEditingQuestion] = useState<any | null>(null);
  // ==============================================

  // ================= REPORTS STATE =================
  const [reports, setReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  // =================================================

  // ================= QUESTS STATE =================
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const [questModalOpen, setQuestModalOpen] = useState(false);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [savingQuest, setSavingQuest] = useState(false);
  const emptyQuestForm = { title: "", description: "", instruction: "", published: false };
  const [questForm, setQuestForm] = useState(emptyQuestForm);
  // =================================================

  // Scroll to top when tab changes
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tab]);

  // Reset state when switching tabs
  useEffect(() => {
    if (tab === "lessons") {
      setSelectedLesson(null);
      setContentTerms([]);
    }
    if (tab === "reports") {
      loadReports();
    }
    if (tab === "quests") {
      loadQuests();
    }
  }, [tab]);

  // Load lessons
  const loadLessons = async () => {
    setLoadingLessons(true);
    try {
      const res = await api.get("/admin/lessons");
      setLessons(res.data);
    } catch {
      toast({ title: "Error loading lessons" });
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  // Load content
  const loadContent = async (lessonId: number) => {
    setLoadingContent(true);
    try {
      const res = await api.get(`/content/lesson/${lessonId}`);
      setContentTerms(res.data);
    } catch {
      toast({ title: "Error loading content" });
    } finally {
      setLoadingContent(false);
    }
  };

  // ================= LOAD QUIZ =================
  const loadQuiz = async (lessonId: number) => {
    setLoadingQuiz(true);
    try {
      const res = await api.get(`/lessons/${lessonId}/quiz`);
      setQuizQuestions(res.data);
    } catch {
      toast({ title: "Error loading quiz" });
    } finally {
      setLoadingQuiz(false);
    }
  };
  // =============================================

  // ================= LOAD REPORTS =================
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const res = await api.get("/admin/reports");
      setReports(res.data);
    } catch {
      toast({ title: "Error loading reports" });
    } finally {
      setLoadingReports(false);
    }
  };

  const resolveReport = async (reportId: number) => {
    try {
      await api.put(`/admin/reports/${reportId}/resolve`);
      toast({ title: "Report resolved" });
      loadReports();
    } catch {
      toast({ title: "Error resolving report" });
    }
  };
  // =================================================

  // ================= QUESTS CRUD =================
  const loadQuests = async () => {
    setLoadingQuests(true);
    try {
      const res = await api.get("/admin/quests");
      setQuests(res.data);
    } catch {
      toast({ title: "Error loading quests" });
    } finally {
      setLoadingQuests(false);
    }
  };

  const saveQuest = async () => {
    if (!questForm.title.trim()) { toast({ title: "Title required" }); return; }
    if (!questForm.instruction.trim()) { toast({ title: "Instruction required" }); return; }
    setSavingQuest(true);
    try {
      if (editingQuest) {
        await api.put(`/quests/${editingQuest.id}`, questForm);
      } else {
        await api.post("/quests", questForm);
      }
      toast({ title: "Quest saved" });
      setQuestModalOpen(false);
      setEditingQuest(null);
      setQuestForm(emptyQuestForm);
      loadQuests();
    } catch {
      toast({ title: "Error saving quest" });
    } finally {
      setSavingQuest(false);
    }
  };

  const deleteQuest = async (id: number) => {
    try {
      await api.delete(`/quests/${id}`);
      toast({ title: "Quest deleted" });
      loadQuests();
    } catch {
      toast({ title: "Error deleting quest" });
    }
  };

  const toggleQuestPublish = async (quest: Quest) => {
    try {
      await api.put(`/quests/${quest.id}`, { title: quest.title, description: quest.description, instruction: quest.instruction, published: !quest.published });
      toast({ title: "Quest updated" });
      loadQuests();
    } catch {
      toast({ title: "Error updating quest" });
    }
  };
  // ================================================

  // Validate lesson
  const validateLesson = () => {
    if (!lessonForm.title.trim()) {
      toast({ title: "Title required" });
      return false;
    }
    if (!difficultyOptions.includes(lessonForm.difficulty)) {
      toast({ title: "Select difficulty" });
      return false;
    }
    if (!lessonForm.objective.trim()) {
      toast({ title: "Objective required" });
      return false;
    }
    return true;
  };

  const saveLesson = async () => {
    if (!validateLesson()) return;
    setSavingLesson(true);

    try {
      if (editingLesson) {
        await api.put(`/lessons/${editingLesson.id}`, lessonForm);
      } else {
        await api.post("/lessons", lessonForm);
      }

      toast({ title: "Lesson saved successfully" });
      setLessonModalOpen(false);
      setEditingLesson(null);
      setLessonForm(emptyLessonForm);
      loadLessons();
    } catch {
      toast({ title: "Error saving lesson" });
    } finally {
      setSavingLesson(false);
    }
  };

  const saveContent = async () => {
    if (!selectedLesson) return;

    const duplicate = contentTerms.some(
      (term) =>
        term.orderIndex === contentForm.orderIndex &&
        term.id !== editingContent?.id,
    );

    if (duplicate) {
      toast({ title: "Order index already used in this lesson" });
      return;
    }

    setSavingContent(true);

    try {
      if (editingContent) {
        await api.put(`/content/${editingContent.id}`, {
          ...contentForm,
          lessonId: selectedLesson.id,
        });
      } else {
        await api.post("/content", {
          ...contentForm,
          lessonId: selectedLesson.id,
        });
      }

      toast({ title: "Content saved successfully" });
      setContentModalOpen(false);
      setEditingContent(null);

      setContentForm({
        term: "",
        description: "",
        example: "",
        orderIndex: contentTerms.length + 1,
      });

      loadContent(selectedLesson.id);
    } catch {
      toast({ title: "Error saving content" });
    } finally {
      setSavingContent(false);
    }
  };

  // ================= SAVE QUIZ =================
  const saveQuiz = async () => {
    if (!quizLessonId) {
      toast({ title: "Select a lesson first" });
      return;
    }
    if (!quizForm.questionText.trim()) {
      toast({ title: "Question text required" });
      return;
    }
    if (quizForm.options.some((o) => !o.trim())) {
      toast({ title: "All 4 options required" });
      return;
    }
    setSavingQuiz(true);
    try {
      if (editingQuestion) {
        await api.put(`/lessons/${quizLessonId}/quiz/${editingQuestion.id}`, quizForm);
        toast({ title: "Question updated successfully" });
      } else {
        await api.post(`/lessons/${quizLessonId}/quiz`, quizForm);
        toast({ title: "Question added successfully" });
      }
      setQuizModalOpen(false);
      setQuizForm(emptyQuizForm);
      setEditingQuestion(null);
      loadQuiz(quizLessonId);
    } catch {
      toast({ title: "Error saving question" });
    } finally {
      setSavingQuiz(false);
    }
  };
  // =============================================

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === "lesson") {
        await api.delete(`/lessons/${deleteTarget.id}`);
        toast({ title: "Lesson deleted" });
        loadLessons();
      } else if (deleteTarget.type === "content") {
        await api.delete(`/content/${deleteTarget.id}`);
        toast({ title: "Content deleted" });
        if (selectedLesson) loadContent(selectedLesson.id);
      } else {
        await api.delete(`/lessons/${quizLessonId}/quiz/${deleteTarget.id}`);
        toast({ title: "Question deleted" });
        if (quizLessonId) loadQuiz(quizLessonId);
      }
    } catch {
      toast({ title: "Error deleting" });
    } finally {
      setDeleteTarget(null);
    }
  };

  const togglePublish = async (id: number) => {
    await api.put(`/lessons/${id}/publish`);
    toast({ title: "Publish status updated" });
    loadLessons();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeTab={tab} onTabChange={setTab} />
      <div ref={topRef} />

      <div className="flex-1 ml-72 pt-12 pb-16 px-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            {tab === "lessons" ? "Lessons" : tab === "content" ? "Content" : tab === "quiz" ? "Quiz" : tab === "reports" ? "Reports" : tab === "quests" ? "Quests" : "Forum Moderation"}
          </h1>

          {/* LESSONS TAB */}
          {tab === "lessons" && (
            <>
              <Button
                className="mb-6"
                onClick={() => {
                  setEditingLesson(null);
                  setLessonForm(emptyLessonForm);
                  setLessonModalOpen(true);
                }}
              >
                + Create Lesson
              </Button>

              {loadingLessons ?
                <p>Loading lessons...</p>
              : <div className="space-y-4">
                  {lessons.map((lesson) => (
                    <motion.div
                      key={lesson.id}
                      whileHover={{ scale: 1.01 }}
                      className={`border rounded-xl p-6 bg-card shadow-sm ${
                        selectedLesson?.id === lesson.id ?
                          "ring-2 ring-primary"
                        : ""
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h2 className="font-semibold">{lesson.title}</h2>
                        <Badge
                          className={
                            lesson.published ?
                              "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {lesson.published ? "Published" : "Draft"}
                        </Badge>
                      </div>

                      <p className="text-sm text-muted-foreground mb-4">
                        Difficulty: {lesson.difficulty}
                      </p>

                      <div className="flex flex-wrap gap-3">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            setSelectedLesson(lesson);
                            setTab("content");
                            loadContent(lesson.id);
                          }}
                        >
                          Manage Content
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingLesson(lesson);
                            setLessonForm(lesson);
                            setLessonModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>

                        <Button
                          size="sm"
                          onClick={() => togglePublish(lesson.id)}
                        >
                          {lesson.published ? "Unpublish" : "Publish"}
                        </Button>

                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeleteTarget({ type: "lesson", id: lesson.id, title: lesson.title })}
                        >
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              }
            </>
          )}

          {/* CONTENT TAB */}
          {tab === "content" && (
            <>
              <div className="mb-6">
                <select
                  className="w-full border rounded-md p-2"
                  value={selectedLesson?.id ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    const lesson = lessons.find((l) => l.id === id) ?? null;
                    setSelectedLesson(lesson);
                    if (lesson) loadContent(lesson.id);
                  }}
                >
                  <option value="">Select lesson</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              {!selectedLesson ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <h3 className="text-lg font-semibold mb-2">No lesson selected</h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Select a lesson from the dropdown above to manage its content.
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    className="mb-6"
                    onClick={() => {
                      setEditingContent(null);
                      setContentForm({
                        term: "",
                        description: "",
                        example: "",
                        orderIndex: contentTerms.length + 1,
                      });
                      setContentModalOpen(true);
                    }}
                  >
                    + Add Content
                  </Button>

                  {loadingContent ? (
                    <p>Loading content...</p>
                  ) : contentTerms.length === 0 ? (
                    <p className="text-muted-foreground">No content added yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {contentTerms.map((term) => (
                        <motion.div
                          key={term.id}
                          whileHover={{ scale: 1.01 }}
                          className="border rounded-xl p-5 bg-card shadow-sm"
                        >
                          <h3 className="font-semibold">{term.term}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            {term.description}
                          </p>
                          <div className="flex gap-3">
                            <Button
                              size="sm"
                              onClick={() => {
                                setEditingContent(term);
                                setContentForm(term);
                                setContentModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteTarget({ type: "content", id: term.id, title: term.term })}
                            >
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* QUIZ TAB */}
          {tab === "quiz" && (
            <>
              <div className="mb-6">
                <select
                  className="w-full border rounded-md p-2"
                  value={quizLessonId ?? ""}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setQuizLessonId(id);
                    if (id) loadQuiz(id);
                  }}
                >
                  <option value="">Select lesson</option>
                  {lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              {!quizLessonId ?
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    No lesson selected
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Please select a lesson to manage its quiz.
                  </p>
                </div>
              : <>
                  <Button
                    className="mb-6"
                    onClick={() => {
                      setEditingQuestion(null);
                      setQuizForm(emptyQuizForm);
                      setQuizModalOpen(true);
                    }}
                  >
                    + Add Question
                  </Button>

                  {loadingQuiz ? (
                    <p>Loading quiz...</p>
                  ) : quizQuestions.length === 0 ? (
                    <p className="text-muted-foreground">No quiz questions added yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {quizQuestions.map((q) => (
                        <motion.div
                          key={q.id}
                          whileHover={{ scale: 1.01 }}
                          className="border rounded-xl p-5 bg-card shadow-sm"
                        >
                          <h3 className="font-semibold mb-3">{q.questionText}</h3>
                          <ul className="text-sm text-muted-foreground mb-3 space-y-1">
                            {q.options.map((opt: string, i: number) => (
                              <li key={i} className={i === q.correctIndex ? "text-primary font-medium" : ""}>
                                {i + 1}. {opt} {i === q.correctIndex && "✓"}
                              </li>
                            ))}
                          </ul>
                          {q.explanation && (
                            <p className="text-xs text-muted-foreground mb-3">
                              Explanation: {q.explanation}
                            </p>
                          )}
                          <div className="flex gap-3">
                            <Button
                              size="sm"
                              onClick={() => {
                                setEditingQuestion(q);
                                setQuizForm({
                                  questionText: q.questionText,
                                  options: q.options,
                                  correctIndex: q.correctIndex ?? 0,
                                  explanation: q.explanation ?? "",
                                });
                                setQuizModalOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => setDeleteTarget({ type: "quiz", id: q.id, title: q.questionText })}
                            >
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </>
              }
            </>
          )}

          {/* REPORTS TAB */}
          {tab === "reports" && (
            <>
              <p className="text-sm text-muted-foreground mb-6">
                Lessons are automatically unpublished after 3 unique reports. Each user can only report a lesson once.
              </p>
              {loadingReports ? (
                <p>Loading reports...</p>
              ) : reports.length === 0 ? (
                <p className="text-muted-foreground">No reports submitted yet.</p>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => {
                    const lessonTitle = lessons.find((l) => l.id === report.lessonId)?.title ?? `Lesson #${report.lessonId}`;
                    const openCount = reports.filter((r) => r.lessonId === report.lessonId && r.status === "OPEN").length;
                    return (
                      <motion.div
                        key={report.id}
                        whileHover={{ scale: 1.01 }}
                        className="border rounded-xl p-5 bg-card shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                              report.status === "OPEN"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}>
                              {report.status}
                            </span>
                            {report.status === "OPEN" && (
                              <span className="text-xs text-muted-foreground">
                                {openCount}/3 reports
                              </span>
                            )}
                          </div>
                          <span className="text-xs font-medium text-foreground">{lessonTitle}</span>
                        </div>
                        <p className="text-sm text-foreground mb-3">{report.description}</p>
                        <div className="flex gap-3">
                          {report.status === "OPEN" && (
                            <Button size="sm" onClick={() => resolveReport(report.id)}>
                              Mark Resolved
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedLesson(lessons.find((l) => l.id === report.lessonId) ?? null);
                              setTab("lessons");
                            }}
                          >
                            View Lesson
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* LESSON MODAL */}
          <Dialog open={lessonModalOpen} onOpenChange={setLessonModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingLesson ? "Edit Lesson" : "Create Lesson"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Title"
                  value={lessonForm.title}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, title: e.target.value })
                  }
                />

                <select
                  className="w-full border rounded-md p-2"
                  value={lessonForm.difficulty}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, difficulty: e.target.value })
                  }
                >
                  <option value="">Select difficulty</option>
                  {difficultyOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <Textarea
                  placeholder="Description"
                  value={lessonForm.description}
                  onChange={(e) =>
                    setLessonForm({
                      ...lessonForm,
                      description: e.target.value,
                    })
                  }
                />

                <Textarea
                  placeholder="Objective"
                  value={lessonForm.objective}
                  onChange={(e) =>
                    setLessonForm({ ...lessonForm, objective: e.target.value })
                  }
                />

                <Button
                  onClick={saveLesson}
                  disabled={savingLesson}
                  className="w-full"
                >
                  {savingLesson ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* CONTENT MODAL */}
          <Dialog open={contentModalOpen} onOpenChange={setContentModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingContent ? "Edit Content" : "Add Content"}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <Input
                  placeholder="Term"
                  value={contentForm.term}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, term: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Description"
                  value={contentForm.description}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      description: e.target.value,
                    })
                  }
                />
                <Textarea
                  placeholder="Example"
                  value={contentForm.example}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, example: e.target.value })
                  }
                />
                <Input
                  type="number"
                  placeholder="Order Index"
                  value={contentForm.orderIndex}
                  onChange={(e) =>
                    setContentForm({
                      ...contentForm,
                      orderIndex: Number(e.target.value),
                    })
                  }
                />

                <Button
                  onClick={saveContent}
                  disabled={savingContent}
                  className="w-full"
                >
                  {savingContent ? "Saving..." : "Save"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* DELETE CONFIRMATION MODAL */}
          <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-5 h-5" />
                  {deleteTarget?.type === "lesson" ? "Delete Lesson?" : "Delete Content?"}
                </DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted-foreground mt-2">
                This will permanently delete{" "}
                <span className="font-semibold text-foreground">"{deleteTarget?.title}"</span>
                {deleteTarget?.type === "lesson" && " and all its content and quiz questions"}.
                This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-4">
                <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="flex-1" onClick={confirmDelete}>
                  Delete
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* QUIZ MODAL */}
          <Dialog open={quizModalOpen} onOpenChange={setQuizModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingQuestion ? "Edit Quiz Question" : "Add Quiz Question"}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <Textarea
                  placeholder="Question Text"
                  value={quizForm.questionText}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, questionText: e.target.value })
                  }
                />

                {quizForm.options.map((opt, index) => (
                  <Input
                    key={index}
                    placeholder={`Option ${index + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...quizForm.options];
                      newOptions[index] = e.target.value;
                      setQuizForm({ ...quizForm, options: newOptions });
                    }}
                  />
                ))}

                <select
                  className="w-full border rounded-md p-2"
                  value={quizForm.correctIndex}
                  onChange={(e) =>
                    setQuizForm({
                      ...quizForm,
                      correctIndex: Number(e.target.value),
                    })
                  }
                >
                  <option value={0}>Correct: Option 1</option>
                  <option value={1}>Correct: Option 2</option>
                  <option value={2}>Correct: Option 3</option>
                  <option value={3}>Correct: Option 4</option>
                </select>

                <Textarea
                  placeholder="Explanation"
                  value={quizForm.explanation}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, explanation: e.target.value })
                  }
                />

                <Button
                  onClick={saveQuiz}
                  disabled={savingQuiz}
                  className="w-full"
                >
                  {savingQuiz ? "Saving..." : editingQuestion ? "Save Changes" : "Save Question"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          {/* QUESTS TAB */}
          {tab === "quests" && (
            <>
              <Button className="mb-6" onClick={() => { setEditingQuest(null); setQuestForm(emptyQuestForm); setQuestModalOpen(true); }}>
                + Create Quest
              </Button>

              {loadingQuests ? (
                <p>Loading quests...</p>
              ) : quests.length === 0 ? (
                <p className="text-muted-foreground">No quests yet.</p>
              ) : (
                <div className="space-y-4">
                  {quests.map((quest) => (
                    <motion.div key={quest.id} whileHover={{ scale: 1.01 }} className="border rounded-xl p-6 bg-card shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="font-semibold">{quest.title}</h2>
                        <Badge className={quest.published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                          {quest.published ? "Published" : "Draft"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{quest.description}</p>
                      <p className="text-xs text-muted-foreground mb-4 italic">{quest.instruction}</p>
                      <div className="flex flex-wrap gap-3">
                        <Button size="sm" onClick={() => { setEditingQuest(quest); setQuestForm({ title: quest.title, description: quest.description, instruction: quest.instruction, published: quest.published }); setQuestModalOpen(true); }}>
                          Edit
                        </Button>
                        <Button size="sm" onClick={() => toggleQuestPublish(quest)}>
                          {quest.published ? "Unpublish" : "Publish"}
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteQuest(quest.id)}>
                          Delete
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Quest Modal */}
              <Dialog open={questModalOpen} onOpenChange={setQuestModalOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingQuest ? "Edit Quest" : "Create Quest"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input placeholder="Title" value={questForm.title} onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })} />
                    <Textarea placeholder="Description (shown on the quest card)" value={questForm.description} onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })} />
                    <Textarea placeholder="Instruction (what the learner must do offline)" value={questForm.instruction} onChange={(e) => setQuestForm({ ...questForm, instruction: e.target.value })} rows={4} />
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={questForm.published} onChange={(e) => setQuestForm({ ...questForm, published: e.target.checked })} />
                      Publish immediately
                    </label>
                    <Button onClick={saveQuest} disabled={savingQuest} className="w-full">
                      {savingQuest ? "Saving..." : "Save"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}

          {/* FORUM MODERATION TAB */}
          {tab === "forum" && <ForumModerationTab toast={toast} />}

        </div>
      </div>
    </div>
  );
}

// ─── Forum Moderation Tab ────────────────────────────────────────────────────

function ForumModerationTab({ toast }: { toast: ReturnType<typeof import("@/hooks/use-toast").useToast>["toast"] }) {
  const [posts, setPosts] = useState<{ id: number; userName: string; title: string; body: string; createdAt: string; comments: { id: number; userName: string; body: string; createdAt: string }[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPost, setExpandedPost] = useState<number | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/forum/posts");
      const withComments = await Promise.all(
        res.data.map(async (p: { id: number }) => {
          const detail = await api.get(`/forum/posts/${p.id}`);
          return detail.data;
        })
      );
      setPosts(withComments);
    } catch {
      toast({ title: "Failed to load forum posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const deletePost = async (postId: number) => {
    try {
      await api.delete(`/forum/posts/${postId}`);
      toast({ title: "Post deleted" });
      fetchPosts();
    } catch {
      toast({ title: "Failed to delete post", variant: "destructive" });
    }
  };

  const deleteComment = async (commentId: number) => {
    try {
      await api.delete(`/forum/comments/${commentId}`);
      toast({ title: "Comment deleted" });
      fetchPosts();
    } catch {
      toast({ title: "Failed to delete comment", variant: "destructive" });
    }
  };

  if (loading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <p className="text-muted-foreground">No forum posts yet.</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="flex items-start justify-between gap-4 px-6 py-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-card-foreground text-sm">{post.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  by {post.userName} · {new Date(post.createdAt).toLocaleDateString()} · {post.comments.length} comment(s)
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                >
                  {expandedPost === post.id ? "Hide" : "View"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deletePost(post.id)}
                >
                  Delete Post
                </Button>
              </div>
            </div>

            {expandedPost === post.id && (
              <div className="border-t border-border px-6 py-4 space-y-3">
                <p className="text-sm text-card-foreground whitespace-pre-wrap">{post.body}</p>
                {post.comments.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Comments</p>
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start justify-between gap-3 bg-muted rounded-xl px-4 py-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">{comment.userName} · {new Date(comment.createdAt).toLocaleDateString()}</p>
                          <p className="text-sm text-foreground">{comment.body}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteComment(comment.id)}
                          className="shrink-0"
                        >
                          Delete
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

