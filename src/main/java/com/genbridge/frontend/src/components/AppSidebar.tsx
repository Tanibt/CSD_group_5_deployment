import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Flame, Star, LogOut, Trophy } from "lucide-react";
import BridgeIcon from "@/assets/icons/bridge.svg?react";
import ForumIcon from "@/assets/icons/forum.svg?react";
import HomeIcon from "@/assets/icons/home.svg?react";
import DictionaryIcon from "@/assets/icons/dictionary.svg?react";
import AccountIcon from "@/assets/icons/account.svg?react";
import KeepIcon from "@/assets/icons/keep.svg?react";
import SettingsIcon from "@/assets/icons/settings.svg?react";
import { useUserProgress } from "@/hooks/useUserProgress";

interface AppSidebarProps {
  activePage: "home" | "learn" | "forum" | "quests" | "profile" | "settings";
}

const AppSidebar = ({ activePage }: AppSidebarProps) => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  const { xp } = useUserProgress();
  const streak = parseInt(localStorage.getItem("gb_streak") ?? "0");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const sidebarW = expanded ? "w-72" : "w-16";

  const navItems = [
    { icon: HomeIcon,       label: "Home",     href: "/lessons",  page: "home"     },
    { icon: DictionaryIcon, label: "Learn",    href: "/lessons",  page: "learn"    },
    { icon: ForumIcon,      label: "Forum",    href: "/forum",    page: "forum"    },
    { icon: Trophy,         label: "Quests",   href: "/quests",   page: "quests"   },
    { icon: AccountIcon,    label: "Profile",  href: "/profile",  page: "profile"  },
    { icon: SettingsIcon,   label: "Settings", href: "/settings", page: "settings" },
  ] as const;

  return (
    <aside className={`fixed top-0 left-0 h-full z-40 bg-card border-r border-border flex flex-col transition-all duration-300 ${sidebarW}`}>

      {/* Header */}
      {expanded ? (
        <div className="flex items-center h-16 px-4 border-b border-border shrink-0 gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <BridgeIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-sidebar text-xl font-bold text-foreground whitespace-nowrap flex-1">GenBridge</span>
          <button
            onClick={() => setExpanded(false)}
            title="Collapse sidebar"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
          >
            <KeepIcon className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => setExpanded(true)}
          title="Expand sidebar"
          className="flex items-center justify-center h-16 w-full border-b border-border shrink-0 hover:bg-muted transition-colors"
        >
          <KeepIcon className="w-4 h-4 text-muted-foreground" />
        </button>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-hidden">
        {navItems.map(({ icon: Icon, label, href, page }) => {
          const isActive = activePage === page;
          return (
            <Link
              key={label}
              to={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sidebar text-xl font-semibold transition-colors ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              } ${!expanded ? "justify-center" : ""}`}
            >
              <Icon className="w-6 h-6 shrink-0" />
              {expanded && <span className="whitespace-nowrap">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border space-y-1 shrink-0">
        {expanded ? (
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
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-sidebar text-xl font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors ${!expanded ? "justify-center" : ""}`}
        >
          <LogOut className="w-6 h-6 shrink-0" />
          {expanded && <span>Log out</span>}
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
