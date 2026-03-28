import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  MessageCircle,
  TrendingUp,
  Gamepad2,
  Music,
  ChevronRight,
  CheckCircle2,
  Clock,
  Star,
  ArrowLeft,
  Sparkles,
  HelpCircle,
  Zap,
  Search,
  Flame,
  LogOut,
  Trophy,
} from "lucide-react";
import HomeIcon from "@/assets/icons/home.svg?react";
import DictionaryIcon from "@/assets/icons/dictionary.svg?react";
import AccountIcon from "@/assets/icons/account.svg?react";
import NoteStackIcon from "@/assets/icons/note_stack.svg?react";
import BarChartIcon from "@/assets/icons/bar_chart.svg?react";
import KeepIcon from "@/assets/icons/keep.svg?react";
import SettingsIcon from "@/assets/icons/settings.svg?react";
import BridgeIcon from "@/assets/icons/bridge.svg?react";
import { useUserProgress } from "@/hooks/useUserProgress";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  completed: boolean;
  content: {
    sections: { heading: string; body: string }[];
    keyTerms: { term: string; definition: string }[];
    examples: string[];
  };
}

interface Module {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: "primary" | "coral" | "lavender" | "lime";
  lessons: Lesson[];
}

interface QuizData {
  question: string;
  correct: string;
  options: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const XP_MAP: Record<string, number> = { Beginner: 10, Intermediate: 15, Advanced: 20 };

const iconColorMap = {
  primary: "bg-primary/10 text-primary",
  coral: "bg-coral/10 text-coral",
  lavender: "bg-lavender/10 text-lavender",
  lime: "bg-lime/10 text-lime",
};

const headerColorMap = {
  primary: "bg-primary",
  coral: "bg-coral",
  lavender: "bg-lavender",
  lime: "bg-lime",
};

const badgeColorMap = {
  Beginner: "bg-lime/15 text-lime border-lime/30",
  Intermediate: "bg-primary/15 text-primary border-primary/30",
  Advanced: "bg-coral/15 text-coral border-coral/30",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const modules: Module[] = [
  {
    id: "slang",
    title: "Slang & Vocabulary",
    description: "Master the words and phrases that define Gen Alpha's digital lexicon.",
    icon: MessageCircle,
    color: "primary",
    lessons: [
      {
        id: "slang-1",
        title: "Rizz, Sigma & Skibidi",
        description: "The holy trinity of Gen Alpha vocabulary — what they mean and how they're used.",
        duration: "5 min",
        difficulty: "Beginner",
        completed: false,
        content: {
          sections: [
            {
              heading: "What is Rizz?",
              body: "\"Rizz\" refers to someone's ability to charm or attract others, particularly in romantic contexts. It originated from internet personality Kai Cenat and has since become one of the most widely used Gen Alpha terms. You can have \"W rizz\" (good charm) or \"L rizz\" (bad charm). The word can also be used as a verb: \"He rizzed her up.\""
            },
            {
              heading: "The Sigma Male",
              body: "\"Sigma\" describes someone who operates outside traditional social hierarchies — a lone wolf who is self-reliant and quietly confident. The term comes from the concept of a \"sigma male\" as an alternative to \"alpha\" or \"beta\" archetypes. Gen Alpha uses it both seriously and ironically, often paired with edgy memes featuring dramatic music."
            },
            {
              heading: "Skibidi — From Toilet to Everywhere",
              body: "\"Skibidi\" originated from the YouTube series \"Skibidi Toilet\" by DaFuq!?Boom!, which features singing heads emerging from toilets battling humanoid figures with cameras and speakers for heads. The term has evolved into a general-purpose adjective meaning cool, weird, or just used for fun. It's a perfect example of how Gen Alpha creates meaning from absurdist content."
            },
          ],
          keyTerms: [
            { term: "Rizz", definition: "Charm or charisma, especially in attracting romantic interest" },
            { term: "W Rizz", definition: "Having great charm — a 'win' in the rizz department" },
            { term: "Sigma", definition: "A self-reliant, independent person who doesn't follow the crowd" },
            { term: "Skibidi", definition: "Originally from Skibidi Toilet; now a playful, all-purpose word" },
          ],
          examples: [
            "\"Bro's got unspoken rizz\" — He's effortlessly charming without even trying.",
            "\"That's such a sigma move\" — Acting independently and not caring what others think.",
            "\"This song is skibidi\" — This song is catchy/weird/fun (context-dependent).",
          ],
        },
      },
      {
        id: "slang-2",
        title: "GYAT, Bussin & No Cap",
        description: "Explore expressions of excitement, authenticity, and approval in Gen Alpha speak.",
        duration: "4 min",
        difficulty: "Beginner",
        completed: false,
        content: {
          sections: [
            {
              heading: "GYAT — The Exclamation",
              body: "\"GYAT\" (sometimes \"gyatt\") is an exclamation used to express surprise or admiration, often in reaction to someone's physical appearance. It's derived from \"god damn\" and was popularized by streamers like YourRAGE. While it started in specific contexts, Gen Alpha now uses it broadly as a general exclamation of amazement."
            },
            {
              heading: "Bussin — The Ultimate Compliment",
              body: "When something is \"bussin,\" it means it's exceptionally good. Originally used to describe delicious food, it's now applied to anything impressive — music, outfits, experiences. \"This pizza is bussin\" or \"Your fit is bussin\" are both common usage. The word gained mainstream traction through TikTok food reviews."
            },
            {
              heading: "No Cap / Capping",
              body: "\"No cap\" means \"no lie\" or \"for real\" — it's used to emphasize that you're being completely honest. \"Capping\" means lying. These terms have roots in African American Vernacular English (AAVE) and were popularized through hip-hop culture before being widely adopted by Gen Alpha online."
            },
          ],
          keyTerms: [
            { term: "GYAT", definition: "An exclamation of surprise or admiration" },
            { term: "Bussin", definition: "Extremely good, impressive, or delicious" },
            { term: "No Cap", definition: "For real, no lie — used to emphasize truthfulness" },
            { term: "Capping", definition: "Lying or being dishonest" },
          ],
          examples: [
            "\"GYAT! Did you see that play?\" — Expressing amazement at something impressive.",
            "\"This beat is bussin no cap\" — This music is genuinely great, I'm not lying.",
            "\"He's capping fr\" — He's definitely lying, for real.",
          ],
        },
      },
      {
        id: "slang-3",
        title: "Slay, Era & Main Character",
        description: "Identity-driven language and how Gen Alpha expresses self and status.",
        duration: "6 min",
        difficulty: "Intermediate",
        completed: false,
        content: {
          sections: [
            {
              heading: "Slay — More Than a Compliment",
              body: "\"Slay\" means to do something exceptionally well or to look amazing. Rooted in LGBTQ+ ballroom culture, it crossed into mainstream Gen Alpha usage through social media. \"She slayed that presentation\" or simply \"slay\" as a standalone reaction are both common. It represents a culture of hyping up peers and celebrating confidence."
            },
            {
              heading: "The Era Framework",
              body: "\"I'm in my _____ era\" is a framing device Gen Alpha uses to describe their current phase of life or mindset. Popularized by Taylor Swift's Eras Tour, it's become a way to narrativize personal growth. \"I'm in my villain era\" (embracing selfishness), \"I'm in my healing era\" (prioritizing mental health), or \"I'm in my gym era\" (fitness focus) are common examples."
            },
            {
              heading: "Main Character Syndrome",
              body: "\"Main character energy\" or being the \"main character\" means living life as though you're the protagonist of a movie — confident, intentional, and unapologetically yourself. It can be used positively (self-empowerment) or negatively (being self-centered). The concept reflects Gen Alpha's deep connection to narrative and storytelling through content creation."
            },
          ],
          keyTerms: [
            { term: "Slay", definition: "To do something brilliantly or look stunning" },
            { term: "Era", definition: "A personal phase or chapter of life you're currently in" },
            { term: "Main Character", definition: "Living confidently as the protagonist of your own story" },
            { term: "NPC", definition: "Someone who seems to lack original thought (opposite of main character)" },
          ],
          examples: [
            "\"You absolutely slayed that outfit\" — You look incredible.",
            "\"I'm in my productive era\" — I'm currently focused on being productive.",
            "\"She's giving main character energy\" — She's radiating confidence and presence.",
          ],
        },
      },
    ],
  },
  {
    id: "memes",
    title: "Meme Culture",
    description: "Understand the viral content formats that shape Gen Alpha humor.",
    icon: TrendingUp,
    color: "coral",
    lessons: [
      {
        id: "memes-1",
        title: "Brainrot & Internet Absurdism",
        description: "Why Gen Alpha humor is weird, layered, and intentionally chaotic.",
        duration: "7 min",
        difficulty: "Intermediate",
        completed: false,
        content: {
          sections: [
            {
              heading: "What is Brainrot?",
              body: "\"Brainrot\" refers to the effect of consuming so much niche internet content that your humor and references become incomprehensible to outsiders. It's both a self-aware critique and a badge of honor. Gen Alpha embraces brainrot as a shared identity — if you understand the reference, you're part of the in-group."
            },
            {
              heading: "Layers of Irony",
              body: "Gen Alpha memes often operate on multiple layers of irony simultaneously. A meme might be funny on the surface, ironic in its delivery, and meta-ironic in its context. This layered approach makes Gen Alpha humor inaccessible to outsiders but deeply bonding for those who get it. It's humor as a social filter."
            },
            {
              heading: "The Absurdist Tradition",
              body: "From Skibidi Toilet to random object worship, Gen Alpha's humor draws from internet absurdism — content that is deliberately nonsensical. This isn't random for the sake of random; it's a creative rebellion against the polished, brand-friendly content that dominates their media landscape. The weirder it is, the more authentic it feels."
            },
          ],
          keyTerms: [
            { term: "Brainrot", definition: "When excessive internet consumption makes your humor incomprehensible to outsiders" },
            { term: "Irony poisoning", definition: "Being so ironic that sincerity becomes difficult" },
            { term: "Shitposting", definition: "Deliberately posting low-quality or absurd content for humor" },
          ],
          examples: [
            "\"My brainrot is terminal\" — I've consumed so much internet content, there's no going back.",
            "\"This video gave me brainrot\" — This content is so absurd it's rewiring my brain.",
          ],
        },
      },
    ],
  },
  {
    id: "gaming",
    title: "Gaming & Digital Life",
    description: "Explore the platforms, games, and digital behaviors that define daily life.",
    icon: Gamepad2,
    color: "lavender",
    lessons: [
      {
        id: "gaming-1",
        title: "Roblox, Fortnite & Digital Identity",
        description: "How virtual worlds shape real-world identity for Gen Alpha.",
        duration: "6 min",
        difficulty: "Beginner",
        completed: false,
        content: {
          sections: [
            {
              heading: "Roblox as a Social Platform",
              body: "For Gen Alpha, Roblox isn't just a game — it's a social platform where they hang out, express creativity, and form communities. With millions of user-created experiences, it functions like a metaverse where social skills, economic thinking (through Robux), and creativity are constantly developed. Understanding Roblox is key to understanding Gen Alpha's digital socialization."
            },
            {
              heading: "Fortnite Beyond Battle Royale",
              body: "Fortnite has evolved far beyond a shooting game. Its in-game concerts (Travis Scott, Ariana Grande), movie screenings, and collaborative brand events have made it a cultural venue. Gen Alpha uses Fortnite dances and references as shared cultural touchpoints — the \"default dance\" and \"floss\" transcended gaming into schoolyard culture."
            },
            {
              heading: "Digital-First Identity",
              body: "Gen Alpha is the first generation where digital identity often precedes physical identity. Avatar customization, skin collections, and online personas are treated as genuine forms of self-expression. A child's Roblox avatar outfit can carry the same social weight as their real-world clothing choices."
            },
          ],
          keyTerms: [
            { term: "Robux", definition: "Roblox's virtual currency, often treated as real money by young users" },
            { term: "Skin", definition: "A cosmetic character appearance in games, often a status symbol" },
            { term: "Default", definition: "Using the basic/free character skin — can imply being a beginner or uncool" },
          ],
          examples: [
            "\"He's such a default\" — He's basic or hasn't invested effort into customization.",
            "\"Meet me in Roblox\" — Let's hang out in this virtual space (genuinely social).",
          ],
        },
      },
    ],
  },
  {
    id: "music",
    title: "Music & Audio Trends",
    description: "From TikTok sounds to genre-blending — the audio landscape of Gen Alpha.",
    icon: Music,
    color: "lime",
    lessons: [
      {
        id: "music-1",
        title: "TikTok Sounds & Virality",
        description: "How 15-second clips reshape the music industry.",
        duration: "5 min",
        difficulty: "Beginner",
        completed: false,
        content: {
          sections: [
            {
              heading: "The TikTok Sound Economy",
              body: "Music discovery for Gen Alpha happens primarily through TikTok sounds. A 15-second clip can turn an unknown artist into a global star overnight. Songs are valued for their \"TikTokability\" — how well they work as background audio for trends, dances, or storytelling formats. This has fundamentally shifted how music is created and marketed."
            },
            {
              heading: "Sound as Meme",
              body: "On TikTok, sounds aren't just music — they're meme templates. A dramatic voice clip, a movie quote, or a funny audio snippet becomes a format that thousands of creators reinterpret. Understanding popular sounds is essential to understanding Gen Alpha communication, because the audio carries context and meaning beyond the words."
            },
          ],
          keyTerms: [
            { term: "Sound", definition: "An audio clip on TikTok that can be reused by any creator" },
            { term: "Trending sound", definition: "An audio clip currently being widely used in new TikTok content" },
            { term: "Original sound", definition: "Audio created by the poster rather than reused from another video" },
          ],
          examples: [
            "\"Use this sound\" — Participate in a trend by creating content with this specific audio.",
            "\"This sound lives in my head rent free\" — I can't stop thinking about this audio clip.",
          ],
        },
      },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDailyTerm = (): { term: string; definition: string; moduleName: string } => {
  const all = modules.flatMap((m) =>
    m.lessons.flatMap((l) =>
      l.content.keyTerms.map((kt) => ({ ...kt, moduleName: m.title }))
    )
  );
  const idx = Math.floor(Date.now() / 86_400_000) % all.length;
  return all[idx];
};

const generateQuiz = (lesson: Lesson): QuizData | null => {
  const { keyTerms } = lesson.content;
  if (keyTerms.length === 0) return null;
  const correct = keyTerms[Math.floor(Math.random() * keyTerms.length)];
  const pool = modules
    .flatMap((m) => m.lessons.flatMap((l) => l.content.keyTerms))
    .filter((t) => t.definition !== correct.definition);
  const distractors = [...pool]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((t) => t.definition);
  const options = [correct.definition, ...distractors].sort(() => Math.random() - 0.5);
  return { question: `What does "${correct.term}" mean?`, correct: correct.definition, options };
};

// ─── XP Celebration Overlay ───────────────────────────────────────────────────

function XPCelebration({ xp, onClose }: { xp: number; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: "spring", bounce: 0.45 }}
        className="bg-card rounded-3xl p-12 text-center shadow-2xl border border-primary/20 max-w-xs w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ rotate: [0, -12, 12, -8, 8, 0], scale: [1, 1.25, 1] }}
          transition={{ duration: 0.7 }}
          className="text-6xl mb-4 select-none"
        >
          🏆
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">Lesson Complete!</h2>
        <p className="text-muted-foreground text-sm mb-4">Keep the streak alive!</p>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.25, type: "spring", bounce: 0.6 }}
          className="flex items-center justify-center gap-2 mb-6"
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

const LEVELS = [
  { label: "Beginner",     min: 0,  max: 30  },
  { label: "Intermediate", min: 30, max: 80  },
  { label: "Advanced",     min: 80, max: 999 },
] as const;

const Learn = () => {
  const { xp, completedLessons, completeLesson } = useUserProgress();
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [showLesson, setShowLesson] = useState(false);
  const [xpPop, setXpPop] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<"All" | "Beginner" | "Intermediate" | "Advanced">("All");
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [currentPage, setCurrentPage] = useState<"home" | "learn">("home");
  const [streak] = useState(() => parseInt(localStorage.getItem("gb_streak") ?? "0"));

  const dailyTerm = useMemo(() => getDailyTerm(), []);
  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const overallProgress = totalLessons > 0 ? (completedLessons.size / totalLessons) * 100 : 0;

  const filteredModules = useMemo(() => {
    return modules.filter((mod) => {
      const matchesSearch =
        searchQuery.trim() === "" ||
        mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mod.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag =
        selectedTag === "All" ||
        mod.lessons.some((l) => l.difficulty === selectedTag);
      return matchesSearch && matchesTag;
    });
  }, [searchQuery, selectedTag]);

  // Derived stats
  const currentLevel = [...LEVELS].reverse().find((l) => xp >= l.min) ?? LEVELS[0];
  const isMaxLevel = currentLevel.label === "Advanced";
  const levelProgressPct = isMaxLevel
    ? 100
    : Math.min(((xp - currentLevel.min) / (currentLevel.max - currentLevel.min)) * 100, 100);
  const xpToNext = isMaxLevel ? null : currentLevel.max - xp;
  const termsLearned = modules
    .flatMap((m) => m.lessons)
    .filter((l) => completedLessons.has(l.id))
    .reduce((sum, l) => sum + l.content.keyTerms.length, 0);
  const totalTerms = modules.flatMap((m) => m.lessons).reduce((sum, l) => sum + l.content.keyTerms.length, 0);
  const completedModulesCount = modules.filter((m) => m.lessons.every((l) => completedLessons.has(l.id))).length;

  const handleLessonClick = (lesson: Lesson) => {
    const q = generateQuiz(lesson);
    setSelectedLesson(lesson);
    setQuiz(q);
    setQuizAnswer(null);
    setShowLesson(!q);
  };

  const handleComplete = () => {
    if (!selectedLesson) return;
    const earned = completeLesson(selectedLesson.id, XP_MAP[selectedLesson.difficulty] ?? 10);
    if (earned > 0) setXpPop(earned);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const sidebarW = sidebarExpanded ? "w-72" : "w-16";
  const contentML = sidebarExpanded ? "ml-72" : "ml-16";

  // ── Sidebar ────────────────────────────────────────────────────────────────
  const sidebar = (
    <aside className={`fixed top-0 left-0 h-full z-40 bg-card border-r border-border flex flex-col transition-all duration-300 ${sidebarW}`}>

      {/* Header: logo + name + pin (expanded) OR pin-only (collapsed) */}
      {sidebarExpanded ? (
        <div className="flex items-center h-16 px-4 border-b border-border shrink-0 gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <BridgeIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-sidebar text-xl font-bold text-foreground whitespace-nowrap flex-1">GenBridge</span>
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

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-hidden">
        {([
          { icon: HomeIcon,       label: "Home",  page: "home"  as const },
          { icon: DictionaryIcon, label: "Learn", page: "learn" as const },
        ]).map(({ icon: Icon, label, page }) => {
          const isActive = currentPage === page && !selectedModule && !selectedLesson;
          return (
            <button
              key={label}
              onClick={() => { setCurrentPage(page); setSelectedModule(null); setSelectedLesson(null); setShowLesson(false); }}
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
          <MessageCircle className="w-6 h-6 shrink-0" />
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

      {/* Bottom: streak / XP / logout */}
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
  if (selectedLesson && !showLesson && quiz) {
    return (
      <div className="flex min-h-screen bg-background">
        {sidebar}
        <AnimatePresence>
          {xpPop !== null && <XPCelebration xp={xpPop} onClose={() => setXpPop(null)} />}
        </AnimatePresence>
        <div className={`flex-1 transition-all duration-300 ${contentML}`}>
          <div className="py-12 px-8 max-w-2xl mx-auto">
            <button
              onClick={() => { setSelectedLesson(null); setQuiz(null); }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to module
            </button>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-border bg-card p-8"
            >
              <div className="flex items-center gap-2 text-primary mb-1">
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-semibold uppercase tracking-widest">Quick Check</span>
              </div>
              <p className="text-sm text-muted-foreground mb-8">
                Test yourself before diving in — no pressure!
              </p>

              <h2 className="font-display text-2xl font-bold text-foreground mb-8">
                {quiz.question}
              </h2>

              <div className="space-y-3 mb-8">
                {quiz.options.map((opt) => {
                  const isAnswered = !!quizAnswer;
                  const isCorrect = opt === quiz.correct;
                  const isChosen = opt === quizAnswer;
                  let cls =
                    "w-full text-left rounded-xl border px-5 py-3.5 text-sm transition-all ";
                  if (!isAnswered) {
                    cls += "border-border hover:border-primary hover:bg-primary/5 cursor-pointer";
                  } else if (isCorrect) {
                    cls += "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 cursor-not-allowed";
                  } else if (isChosen) {
                    cls += "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 cursor-not-allowed";
                  } else {
                    cls += "border-border opacity-40 cursor-not-allowed";
                  }
                  return (
                    <button
                      key={opt}
                      disabled={isAnswered}
                      onClick={() => setQuizAnswer(opt)}
                      className={cls}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence>
                {quizAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <p
                      className={`text-sm font-medium ${
                        quizAnswer === quiz.correct
                          ? "text-green-600 dark:text-green-400"
                          : "text-muted-foreground"
                      }`}
                    >
                      {quizAnswer === quiz.correct
                        ? "🎉 Correct! You're already ahead."
                        : `Not quite — the answer is: "${quiz.correct}"`}
                    </p>
                    <Button onClick={() => setShowLesson(true)} className="w-full">
                      Continue to Lesson <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ── Lesson detail view ─────────────────────────────────────────────────────
  if (selectedLesson && showLesson) {
    const isComplete = completedLessons.has(selectedLesson.id);
    return (
      <div className="flex min-h-screen bg-background">
        {sidebar}
        <AnimatePresence>
          {xpPop !== null && <XPCelebration xp={xpPop} onClose={() => setXpPop(null)} />}
        </AnimatePresence>
        <div className={`flex-1 transition-all duration-300 ${contentML}`}>
          <div className="py-12 px-8 max-w-3xl mx-auto">
            <button
              onClick={() => { setSelectedLesson(null); setShowLesson(false); }}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to module
            </button>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className={badgeColorMap[selectedLesson.difficulty]}>
                  {selectedLesson.difficulty}
                </Badge>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> {selectedLesson.duration}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  {XP_MAP[selectedLesson.difficulty]} XP
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                {selectedLesson.title}
              </h1>
              <p className="text-muted-foreground mb-10">{selectedLesson.description}</p>

              <div className="space-y-8 mb-12">
                {selectedLesson.content.sections.map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <h2 className="font-display text-xl font-semibold text-foreground mb-3">
                      {section.heading}
                    </h2>
                    <p className="text-foreground/80 leading-relaxed">{section.body}</p>
                  </motion.div>
                ))}
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 mb-8">
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> Key Terms
                </h3>
                <div className="space-y-3">
                  {selectedLesson.content.keyTerms.map((kt) => (
                    <div key={kt.term} className="flex gap-3">
                      <span className="font-semibold text-primary whitespace-nowrap">{kt.term}</span>
                      <span className="text-muted-foreground">— {kt.definition}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-6 mb-10">
                <h3 className="font-display text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-coral" /> Usage Examples
                </h3>
                <ul className="space-y-3">
                  {selectedLesson.content.examples.map((ex, i) => (
                    <li
                      key={i}
                      className="text-foreground/80 leading-relaxed pl-4 border-l-2 border-coral/30"
                    >
                      {ex}
                    </li>
                  ))}
                </ul>
              </div>

              {isComplete ? (
                <div className="flex items-center gap-2 text-primary font-medium">
                  <CheckCircle2 className="w-5 h-5" /> Lesson completed!
                </div>
              ) : (
                <Button size="lg" onClick={handleComplete}>
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Complete
                </Button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ── Module detail view ─────────────────────────────────────────────────────
  if (selectedModule) {
    const moduleCompleted = selectedModule.lessons.filter((l) => completedLessons.has(l.id)).length;
    const moduleProgress = (moduleCompleted / selectedModule.lessons.length) * 100;
    const Icon = selectedModule.icon;

    return (
      <div className="flex min-h-screen bg-background">
        {sidebar}
        <div className={`flex-1 transition-all duration-300 ${contentML}`}>
          <div className="py-12 px-8 max-w-4xl mx-auto">
            <button
              onClick={() => setSelectedModule(null)}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> All modules
            </button>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex items-center gap-4 mb-2">
                <div
                  className={`w-12 h-12 rounded-xl ${iconColorMap[selectedModule.color]} flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold text-foreground">
                    {selectedModule.title}
                  </h1>
                  <p className="text-muted-foreground">{selectedModule.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6 mb-8">
                <Progress value={moduleProgress} className="h-2 flex-1" />
                <span className="text-sm text-muted-foreground font-medium">
                  {moduleCompleted}/{selectedModule.lessons.length}
                </span>
              </div>

              <div className="space-y-4">
                {selectedModule.lessons.map((lesson, i) => {
                  const done = completedLessons.has(lesson.id);
                  return (
                    <motion.button
                      key={lesson.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleLessonClick(lesson)}
                      className="w-full text-left rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow flex items-center gap-4"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          done ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {done ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <span className="font-display font-bold">{i + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-card-foreground">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">{lesson.description}</p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className={badgeColorMap[lesson.difficulty]}>
                          {lesson.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {lesson.duration}
                        </span>
                        <span className="text-xs text-primary flex items-center gap-0.5 font-medium">
                          <Zap className="w-3 h-3" /> {XP_MAP[lesson.difficulty]}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // ── Home view ──────────────────────────────────────────────────────────────
  if (currentPage === "home") {
    const nextLesson = modules.flatMap((m) => m.lessons).find((l) => !completedLessons.has(l.id));
    const nextModule = modules.find((m) => m.lessons.some((l) => l.id === nextLesson?.id));

    return (
      <div className="flex h-screen overflow-hidden bg-background">
        {sidebar}

        {/* Main content — the only other section */}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ${contentML} py-10 px-10`}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

            {/* Header + Continue Learning */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-display text-4xl font-bold text-foreground mb-1">Home</h1>
                <p className="text-sm text-muted-foreground">Welcome back — let's keep learning.</p>
              </div>
              <button
                onClick={() => setCurrentPage("learn")}
                className="btn-3d flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Continue learning <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* 2-col grid: My Progress | My Words + Activities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* My Progress */}
              <div className="rounded-2xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-semibold text-card-foreground">My progress</h2>
                  <span className="text-sm font-bold text-primary">{xp} XP</span>
                </div>
                <div className="rounded-xl bg-muted/40 p-4 mb-4">
                  <p className="text-sm text-muted-foreground font-medium mb-2">Current level — {currentLevel.label}</p>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1.5">
                    {LEVELS.map((l) => (
                      <span key={l.label} className={`font-medium ${l.label === currentLevel.label ? "text-primary" : ""}`}>
                        {l.label}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-1 mb-1.5">
                    {LEVELS.map((l) => {
                      const isPast    = xp >= l.max;
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
                    {isMaxLevel ? "You've reached the top level!" : `${xpToNext} XP to ${LEVELS[LEVELS.findIndex((l) => l.label === currentLevel.label) + 1].label}`}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-muted/40 p-3 text-center">
                    <p className="font-bold text-2xl text-foreground">{completedLessons.size}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Lessons done</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 text-center">
                    <p className="font-bold text-2xl text-foreground">{completedModulesCount}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Modules done</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3 text-center">
                    <p className="font-bold text-2xl text-primary">{xp}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Total XP</p>
                  </div>
                </div>
              </div>

              {/* My Words + My Activities stacked */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <NoteStackIcon className="w-6 h-6 text-primary" />
                    <span className="font-display text-xl font-semibold text-card-foreground">My Words</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-xl bg-primary/5 p-3">
                      <Star className="w-5 h-5 text-primary mx-auto mb-1" />
                      <p className="font-bold text-2xl text-foreground leading-none">{termsLearned}</p>
                      <p className="text-xs text-muted-foreground mt-1">Learned</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <BookOpen className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                      <p className="font-bold text-2xl text-foreground leading-none">{totalTerms - termsLearned}</p>
                      <p className="text-xs text-muted-foreground mt-1">Left</p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-3">
                      <CheckCircle2 className="w-5 h-5 text-muted-foreground mx-auto mb-1" />
                      <p className="font-bold text-2xl text-foreground leading-none">{totalTerms}</p>
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
                    <span className="font-display text-4xl font-bold text-foreground leading-none">{completedLessons.size}</span>
                    <span className="text-sm text-muted-foreground mb-1">/ {totalLessons} lessons</span>
                  </div>
                  <Progress value={overallProgress} className="h-2" />
                </div>
              </div>
            </div>

            {/* Slang of the Day — full width */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl border border-primary/20 bg-primary/5 p-6 mb-6"
            >
              <div className="flex items-center gap-2 text-primary mb-3">
                <Sparkles className="w-4 h-4" />
                <span className="text-base font-bold uppercase tracking-widest">Slang of the Day</span>
              </div>
              <p className="font-display text-3xl font-bold text-foreground mb-2">{dailyTerm.term}</p>
              <p className="text-sm text-muted-foreground leading-relaxed">{dailyTerm.definition}</p>
              <p className="text-xs text-muted-foreground/60 mt-3">From: {dailyTerm.moduleName}</p>
            </motion.div>

            {/* Up Next — full width */}
            {nextLesson && nextModule && (() => {
              const Icon = nextModule.icon;
              return (
                <button
                  onClick={() => { setCurrentPage("learn"); setSelectedModule(nextModule); }}
                  className="w-full rounded-2xl border border-border bg-card p-5 flex items-center justify-between hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${iconColorMap[nextModule.color]} flex items-center justify-center shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-0.5">Up Next</p>
                      <p className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{nextLesson.title}</p>
                      <p className="text-xs text-muted-foreground">{nextModule.title}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
                </button>
              );
            })()}

          </motion.div>
        </main>
      </div>
    );
  }

  // ── Learn view (modules) ───────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {sidebar}
      <div className={`flex-1 overflow-y-auto transition-all duration-300 ${contentML} py-10 px-8`}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>

          <div className="mb-6">
            <h1 className="font-display text-4xl font-bold text-foreground mb-1">Learn</h1>
            <p className="text-muted-foreground">Your Gen Alpha crash course awaits.</p>
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

          {/* Module Card Grid */}
          {filteredModules.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No modules match your search.</p>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {filteredModules.map((mod, i) => {
                const Icon = mod.icon;
                const done = mod.lessons.filter((l) => completedLessons.has(l.id)).length;
                const total = mod.lessons.length;
                const isComplete = done === total;
                const modProgress = (done / total) * 100;
                return (
                  <motion.button
                    key={mod.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    onClick={() => setSelectedModule(mod)}
                    className="rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg transition-all hover:-translate-y-1 text-left group"
                  >
                    <div className={`${headerColorMap[mod.color]} h-32 flex items-center justify-center relative`}>
                      <Icon className="w-12 h-12 text-white/90" />
                      {isComplete && (
                        <div className="absolute top-3 right-3 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-bold text-card-foreground mb-1 group-hover:text-primary transition-colors">
                        {mod.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2 leading-relaxed">
                        {mod.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{done}/{total} lessons</span>
                        <span>{Math.round(modProgress)}%</span>
                      </div>
                      <Progress value={modProgress} className="h-1.5" />
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
