import { useEffect, useState, useRef } from "react";
import { Navigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
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

const difficultyOptions = ["Beginner", "Intermediate", "Advanced"];

export default function Admin() {
  const role = localStorage.getItem("role");
  const { toast } = useToast();
  const topRef = useRef<HTMLDivElement>(null);

  if (role !== "ADMIN") return <Navigate to="/lessons" replace />;

  const [tab, setTab] = useState<"lessons" | "content" | "quiz">("lessons");
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [contentTerms, setContentTerms] = useState<ContentTerm[]>([]);
  const [loadingContent, setLoadingContent] = useState(false);

  const [lessonModalOpen, setLessonModalOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);

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
    title: "",
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
  // ==============================================

  // Scroll to top when tab changes
  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [tab]);

  // Reset state when switching to lessons tab
  useEffect(() => {
    if (tab === "lessons") {
      setSelectedLesson(null);
      setContentTerms([]);
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
        title: "",
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
      await api.post(`/lessons/${quizLessonId}/quiz`, quizForm);
      toast({ title: "Question added successfully" });
      setQuizModalOpen(false);
      setQuizForm(emptyQuizForm);
      loadQuiz(quizLessonId);
    } catch {
      toast({ title: "Error saving question" });
    } finally {
      setSavingQuiz(false);
    }
  };
  // =============================================

  const deleteLesson = async (id: number) => {
    if (!confirm("Delete this lesson?")) return;
    await api.delete(`/lessons/${id}`);
    toast({ title: "Lesson deleted" });
    loadLessons();
  };

  const deleteContent = async (id: number) => {
    if (!selectedLesson) return;
    await api.delete(`/content/${id}`);
    toast({ title: "Content deleted" });
    loadContent(selectedLesson.id);
  };

  const togglePublish = async (id: number) => {
    await api.put(`/lessons/${id}/publish`);
    toast({ title: "Publish status updated" });
    loadLessons();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div ref={topRef} />

      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

          {/* Tabs */}
          <div className="flex gap-4 mb-10">
            <Button
              variant={tab === "lessons" ? "default" : "outline"}
              onClick={() => setTab("lessons")}
            >
              Lessons
            </Button>
            <Button
              variant={tab === "content" ? "default" : "outline"}
              onClick={() => setTab("content")}
            >
              Content
            </Button>

            <Button
              variant={tab === "quiz" ? "default" : "outline"}
              onClick={() => setTab("quiz")}
            >
              Quiz
            </Button>
          </div>

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
                          onClick={() => deleteLesson(lesson.id)}
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
              {!selectedLesson ?
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <h3 className="text-lg font-semibold mb-2">
                    No lesson selected
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    Please select a lesson from the Lessons tab to manage its
                    content.
                  </p>
                </div>
              : <>
                  <div className="text-sm text-muted-foreground mb-4">
                    Lessons →{" "}
                    <span className="font-medium text-foreground">
                      {selectedLesson.title}
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    className="mb-6"
                    onClick={() => setTab("lessons")}
                  >
                    ← Back to Lessons
                  </Button>

                  <Button
                    className="mb-6"
                    onClick={() => {
                      setEditingContent(null);
                      setContentForm({
                        title: "",
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

                  {loadingContent ?
                    <p>Loading content...</p>
                  : <div className="space-y-4">
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
                              onClick={() => deleteContent(term.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  }
                </>
              }
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
                      setQuizForm(emptyQuizForm);
                      setQuizModalOpen(true);
                    }}
                  >
                    + Add Question
                  </Button>

                  {loadingQuiz ?
                    <p>Loading quiz...</p>
                  : quizQuestions.length === 0 ?
                    <p className="text-muted-foreground">
                      No quiz questions added yet.
                    </p>
                  : <div className="space-y-4">
                      {quizQuestions.map((q) => (
                        <motion.div
                          key={q.id}
                          whileHover={{ scale: 1.01 }}
                          className="border rounded-xl p-5 bg-card shadow-sm"
                        >
                          <h3 className="font-semibold mb-2">
                            {q.questionText}
                          </h3>

                          <ul className="text-sm text-muted-foreground mb-3">
                            {q.options.map((opt: string, i: number) => (
                              <li key={i}>
                                {i}. {opt}
                              </li>
                            ))}
                          </ul>

                          <p className="text-xs text-muted-foreground">
                            Explanation: {q.explanation}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  }
                </>
              }
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
                  placeholder="Title"
                  value={contentForm.title}
                  onChange={(e) =>
                    setContentForm({ ...contentForm, title: e.target.value })
                  }
                />
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

          {/* QUIZ MODAL */}
          <Dialog open={quizModalOpen} onOpenChange={setQuizModalOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Quiz Question</DialogTitle>
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
                  {savingQuiz ? "Saving..." : "Save Question"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
