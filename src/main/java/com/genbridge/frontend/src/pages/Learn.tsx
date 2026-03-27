import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
import {
  ChevronRight,
  CheckCircle2,
  Clock,
  Star,
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

interface ProgressEntry {
  lessonId: number;
  completed: boolean;
}

const badgeColorMap: Record<string, string> = {
  BEGINNER: "bg-lime/15 text-lime border-lime/30",
  Beginner: "bg-lime/15 text-lime border-lime/30",
  INTERMEDIATE: "bg-primary/15 text-primary border-primary/30",
  Intermediate: "bg-primary/15 text-primary border-primary/30",
  ADVANCED: "bg-coral/15 text-coral border-coral/30",
  Advanced: "bg-coral/15 text-coral border-coral/30",
};

const Learn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(true);
  const [progressMap, setProgressMap] = useState<Record<number, boolean>>({});

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
  }, []);

  const completedCount = Object.values(progressMap).filter(Boolean).length;
  const totalCount = lessons.length;
  const overallProgress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-4xl font-bold text-foreground mb-2">Lessons</h1>
            <p className="text-muted-foreground mb-6">
              Explore lessons on Gen Alpha language, memes, gaming, and more.
            </p>

            {/* Overall progress */}
            <div className="rounded-2xl border border-border bg-card p-5 mb-10 flex items-center gap-4">
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

            {/* Lessons list */}
            {loadingLessons ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : lessons.length === 0 ? (
              <p className="text-muted-foreground text-center py-20">No lessons available yet.</p>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, i) => {
                  const isCompleted = progressMap[lesson.id] === true;
                  return (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      onClick={() => navigate(`/lessons/${lesson.id}`)}
                      className="w-full text-left rounded-2xl border border-border bg-card p-6 hover:shadow-lg transition-shadow group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isCompleted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
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
    </div>
  );
};

export default Learn;
