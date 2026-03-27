import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogOut, Flame, Star } from "lucide-react";
import BridgeIcon from "@/assets/icons/bridge.svg?react";
import { useToast } from "@/hooks/use-toast";

const Navbar = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isLoggedIn = !!token;
  const navigate = useNavigate();
  const { toast } = useToast();

  const [streak, setStreak] = useState(() => parseInt(localStorage.getItem("gb_streak") ?? "0"));
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem("gb_xp") ?? "0"));

  useEffect(() => {
    const sync = () => {
      setStreak(parseInt(localStorage.getItem("gb_streak") ?? "0"));
      setXp(parseInt(localStorage.getItem("gb_xp") ?? "0"));
    };
    window.addEventListener("gb_progress", sync);
    return () => window.removeEventListener("gb_progress", sync);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    toast({ title: "Logged out", description: "See you next time!" });
    navigate("/login");
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b"
      style={{ backgroundColor: "rgba(239,235,225,0.85)", borderColor: "rgba(0,0,0,0.08)" }}
    >
      <div className="flex items-center justify-between h-16 px-8 w-full">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <BridgeIcon className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display text-2xl font-bold" style={{ color: "#1a2e1a" }}>
            GenBridge
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              {streak > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-bold text-orange-500">{streak}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                <Star className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold text-primary">{xp} XP</span>
              </div>
              <Button variant="ghost" asChild>
                <Link to="/lessons">Lessons</Link>
              </Button>
              <Button variant="ghost" asChild>
                <Link to="/profile">Profile</Link>
              </Button>
              {role === "ADMIN" && (
                <Button variant="ghost" asChild>
                  <Link to="/admin">Admin</Link>
                </Button>
              )}
              <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="w-4 h-4" />
                Log out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="btn-3d text-base" style={{ color: "#1a2e1a", boxShadow: "0 4px 0 rgba(81,144,92,0.35)" }}>
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild className="btn-3d text-base">
                <Link to="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
