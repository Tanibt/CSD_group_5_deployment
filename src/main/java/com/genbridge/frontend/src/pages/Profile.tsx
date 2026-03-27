import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Star, BookOpen, CheckCircle2, Pencil, Check, X } from "lucide-react";
import AppSidebar from "@/components/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";

// ─── Temporary lesson lookup (replace with API data once api.ts is ready) ─────

const LESSON_LOOKUP: Record<string, { title: string; module: string; difficulty: "Beginner" | "Intermediate" | "Advanced" }> = {
  "slang-1":  { title: "Rizz, Sigma & Skibidi",     module: "Slang & Vocabulary", difficulty: "Beginner"     },
  "slang-2":  { title: "GYAT, Bussin & No Cap",      module: "Slang & Vocabulary", difficulty: "Beginner"     },
  "slang-3":  { title: "Slay, Era & Main Character", module: "Slang & Vocabulary", difficulty: "Intermediate" },
  "memes-1":  { title: "Brainrot & Internet Absurdism", module: "Meme Culture",    difficulty: "Intermediate" },
  "gaming-1": { title: "Roblox, Fortnite & Digital Identity", module: "Gaming & Digital Life", difficulty: "Beginner" },
  "music-1":  { title: "TikTok Sounds & Virality",   module: "Music & Audio Trends", difficulty: "Beginner"  },
};

const DIFFICULTY_COLORS = {
  Beginner:     "bg-lime/15 text-lime border-lime/30",
  Intermediate: "bg-primary/15 text-primary border-primary/30",
  Advanced:     "bg-coral/15 text-coral border-coral/30",
};

const LEVELS = [
  { label: "Beginner",     min: 0,  max: 30  },
  { label: "Intermediate", min: 30, max: 80  },
  { label: "Advanced",     min: 80, max: 999 },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ─── Component ────────────────────────────────────────────────────────────────

function decodeToken(): { email: string; name: string } {
  try {
    const token = localStorage.getItem("token") ?? "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    const email = payload.sub ?? payload.email ?? "";
    // Derive a display name from the email username part
    const name = email
      ? email.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
      : "Learner";
    return { email, name };
  } catch {
    return { email: "", name: "Learner" };
  }
}

const Profile = () => {
  const { toast } = useToast();
  const decoded = decodeToken();

  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [completedLessons, setCompletedLessons] = useState<{ id: number; title: string; difficulty: string }[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profileRes, progressRes] = await Promise.all([
          api.get("/profile"),
          api.get("/progress"),
        ]);
        setStreak(profileRes.data.currentStreak ?? 0);
        const completed = (progressRes.data.lessons as { lessonId: number; completed: boolean }[])
          .filter((p) => p.completed);
        setXp(completed.length * 10);

        // Fetch lesson details for completed lessons
        const lessonDetails = await Promise.all(
          completed.map((p) => api.get(`/lessons/${p.lessonId}`))
        );
        setCompletedLessons(lessonDetails.map((r) => ({
          id: r.data.id,
          title: r.data.title,
          difficulty: r.data.difficulty,
        })));
      } catch {
        toast({ title: "Error loading profile" });
      }
    };
    fetchStats();
  }, []);

  const [name,  setName]  = useState(decoded.name);
  const [email, setEmail] = useState(decoded.email);

  const [editingName,  setEditingName]  = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [draftName,  setDraftName]  = useState(name);
  const [draftEmail, setDraftEmail] = useState(email);
  const [saving, setSaving] = useState(false);

  const save = (field: "name" | "email") => {
    setSaving(true);
    if (field === "name")  { setName(draftName);   setEditingName(false);  }
    if (field === "email") { setEmail(draftEmail);  setEditingEmail(false); }
    toast({ title: "Saved", description: `${field === "name" ? "Username" : "Email"} updated.` });
    setSaving(false);
  };

  const cancel = (field: "name" | "email") => {
    if (field === "name")  { setDraftName(name);   setEditingName(false);  }
    if (field === "email") { setDraftEmail(email);  setEditingEmail(false); }
  };

  const completedList = completedLessons;

  const current   = [...LEVELS].reverse().find((l) => xp >= l.min) ?? LEVELS[0];
  const isMax     = current.label === "Advanced";
  const progressPct = isMax
    ? 100
    : Math.min(((xp - current.min) / (current.max - current.min)) * 100, 100);
  const xpToNext  = isMax ? null : current.max - xp;
  const nextLevel = isMax ? null : LEVELS[LEVELS.findIndex((l) => l.label === current.label) + 1];

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activePage="profile" />

      <div className="flex-1 ml-72 pt-12 pb-16 px-8">
        <div className="max-w-3xl mx-auto">

          {/* Page title */}
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl font-bold text-foreground mb-6"
          >
            Profile
          </motion.h1>

          {/* Main info card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-card rounded-2xl border border-border mb-6 overflow-hidden"
          >
            {/* Avatar + editable fields */}
            <div className="flex items-start gap-5 p-6 border-b border-border">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shrink-0 shadow">
                <span className="font-display text-xl font-bold text-primary-foreground">
                  {getInitials(name)}
                </span>
              </div>
              <div className="flex-1 space-y-3">
                {/* Username */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Username</p>
                  {editingName ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={draftName}
                        onChange={(e) => setDraftName(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => save("name")} className="text-primary hover:opacity-70"><Check className="w-4 h-4" /></button>
                      <button onClick={() => cancel("name")} className="text-muted-foreground hover:opacity-70"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-xl font-bold text-card-foreground">{name}</h2>
                      <button onClick={() => { setDraftName(name); setEditingName(true); }} className="text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                {/* Email */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  {editingEmail ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={draftEmail}
                        onChange={(e) => setDraftEmail(e.target.value)}
                        autoFocus
                      />
                      <button onClick={() => save("email")} className="text-primary hover:opacity-70"><Check className="w-4 h-4" /></button>
                      <button onClick={() => cancel("email")} className="text-muted-foreground hover:opacity-70"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground">{email}</p>
                      <button onClick={() => { setDraftEmail(email); setEditingEmail(true); }} className="text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 divide-x divide-border">
              <div className="flex flex-col items-center gap-1 py-5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-display text-2xl font-bold text-card-foreground">{streak}</span>
                </div>
                <span className="text-xs text-muted-foreground">Day Streak</span>
              </div>
              <div className="flex flex-col items-center gap-1 py-5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="font-display text-2xl font-bold text-card-foreground">{xp}</span>
                </div>
                <span className="text-xs text-muted-foreground">Total XP</span>
              </div>
              <div className="flex flex-col items-center gap-1 py-5">
                <div className="flex items-center gap-1.5 mb-1">
                  <BookOpen className="w-4 h-4 text-lime" />
                  <span className="font-display text-2xl font-bold text-card-foreground">{completedList.length}</span>
                </div>
                <span className="text-xs text-muted-foreground">Lessons Done</span>
              </div>
            </div>

            {/* Level progress */}
            <div className="p-6 border-t border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-card-foreground">Current Level</span>
                <span className="text-xs font-bold text-primary px-2.5 py-1 rounded-full bg-primary/10">
                  {current.label}
                </span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                {LEVELS.map((l) => (
                  <span key={l.label} className={l.label === current.label ? "text-primary font-medium" : ""}>
                    {l.label}
                  </span>
                ))}
              </div>
              <div className="flex gap-1 mb-2">
                {LEVELS.map((l) => {
                  const isPast    = xp >= l.max;
                  const isCurrent = l.label === current.label;
                  return (
                    <div key={l.label} className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: isPast ? "100%" : isCurrent ? `${progressPct}%` : "0%" }}
                      />
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                {isMax ? "You've reached the top level!" : `${xpToNext} XP to ${nextLevel?.label}`}
              </p>
            </div>
          </motion.div>

          {/* Completed lessons */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-display text-xl font-bold text-foreground mb-4">
              Completed Lessons
            </h2>

            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {completedList.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground">No lessons completed yet.</p>
                  <p className="text-muted-foreground/60 text-sm mt-1">Head to Learn to get started!</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {completedList.map((lesson, i) => (
                    <motion.div
                      key={lesson.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.12 + i * 0.04 }}
                      className="flex items-center gap-4 px-6 py-4"
                    >
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-card-foreground text-sm">{lesson.title}</p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${DIFFICULTY_COLORS[lesson.difficulty as keyof typeof DIFFICULTY_COLORS] ?? ""}`}>
                        {lesson.difficulty}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};


export default Profile;
