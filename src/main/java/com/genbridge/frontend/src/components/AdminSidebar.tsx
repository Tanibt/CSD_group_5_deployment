import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Flag, MessageCircle } from "lucide-react";
import BridgeIcon from "@/assets/icons/bridge.svg?react";
import DictionaryIcon from "@/assets/icons/dictionary.svg?react";
import NoteStackIcon from "@/assets/icons/note_stack.svg?react";
import AbcIcon from "@/assets/icons/abc.svg?react";
import KeepIcon from "@/assets/icons/keep.svg?react";

interface AdminSidebarProps {
  activeTab: "lessons" | "content" | "quiz" | "reports" | "forum" | "quests";
  onTabChange: (tab: "lessons" | "content" | "quiz" | "reports" | "forum" | "quests") => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const sidebarW = expanded ? "w-72" : "w-16";

  const navItems = [
    { icon: DictionaryIcon,  label: "Lessons",          tab: "lessons" as const },
    { icon: NoteStackIcon,   label: "Content",          tab: "content" as const },
    { icon: AbcIcon,         label: "Quiz",             tab: "quiz"    as const },
    { icon: Flag,            label: "Reports",          tab: "reports" as const },
    { icon: MessageCircle,   label: "Forum Moderation", tab: "forum"   as const },
    { icon: KeepIcon,        label: "Quests",           tab: "quests"  as const },
  ];

  return (
    <aside className={`fixed top-0 left-0 h-full z-40 bg-card border-r border-border flex flex-col transition-all duration-300 ${sidebarW}`}>

      {/* Header */}
      {expanded ? (
        <div className="flex items-center h-16 px-4 border-b border-border shrink-0 gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <BridgeIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="font-sidebar text-base font-bold text-foreground whitespace-nowrap leading-tight">GenBridge</span>
            <span className="text-xs text-muted-foreground font-medium">Admin</span>
          </div>
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
        {navItems.map(({ icon: Icon, label, tab }) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl font-sidebar text-xl font-semibold transition-colors ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              } ${!expanded ? "justify-center" : ""}`}
            >
              <Icon className="w-6 h-6 shrink-0" />
              {expanded && <span className="whitespace-nowrap">{label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-border shrink-0">
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

export default AdminSidebar;
