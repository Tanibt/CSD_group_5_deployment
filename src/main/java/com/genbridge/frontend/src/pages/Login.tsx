import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/components/AuthLayout";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api"; // ✅ ADD THIS

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Login clicked");
      console.log("Email:", email);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      console.log("API success:", res.data);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      toast({
        title: "Welcome back!",
        description: "Login successful.",
      });

      navigate(res.data.role === "ADMIN" ? "/admin" : "/lessons");
    } catch (err: any) {
      console.error("Login error:", err);

      toast({
        title: "Login failed",
        description: err.response?.data || "Could not reach the server.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue your learning journey."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label
            htmlFor="email"
            className="text-sm font-semibold text-foreground"
          >
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-13 px-4 py-3.5 text-base rounded-xl border-2 border-border bg-white shadow-sm focus-visible:ring-primary/30"
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="password"
            className="text-sm font-semibold text-foreground"
          >
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-13 px-4 py-3.5 text-base rounded-xl border-2 border-border bg-white shadow-sm focus-visible:ring-primary/30"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ?
                <EyeOff className="w-4 h-4" />
              : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="btn-3d w-full text-base rounded-xl font-semibold"
          style={{ height: "3.25rem", fontSize: "1.05rem" }}
        >
          {loading ? "Logging in..." : "Log in"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;
