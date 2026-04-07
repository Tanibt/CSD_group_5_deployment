import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Learn from "./pages/Learn";
import LessonDetail from "./pages/LessonDetail";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./context/ThemeContext";
import Quests from "./pages/Quests";
import QuestDetail from "./pages/QuestDetail";
const queryClient = new QueryClient();

// Redirects to /login if no token
const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  return localStorage.getItem("token") ? element : (
      <Navigate to="/login" replace />
    );
};

// Redirects to /admin or /lessons if already logged in
const PublicOnlyRoute = ({ element }: { element: JSX.Element }) => {
  if (!localStorage.getItem("token")) return element;
  return localStorage.getItem("role") === "ADMIN"
    ? <Navigate to="/admin" replace />
    : <Navigate to="/lessons" replace />;
};

// Home: dashboard for logged-in users, landing page otherwise
const HomeRoute = () => {
  if (!localStorage.getItem("token")) return <Index />;
  return localStorage.getItem("role") === "ADMIN"
    ? <Navigate to="/admin" replace />
    : <Navigate to="/lessons" replace />;
};

// Intercepts 401 responses anywhere in the app and logs the user out
const TokenExpiryHandler = () => {
  const navigate = useNavigate();
  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/login");
      }
      return response;
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, [navigate]);
  return null;
};

const App = () => (
  <ThemeProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TokenExpiryHandler />
        <Routes>
          <Route path="/" element={<HomeRoute />} />
          <Route
            path="/login"
            element={<PublicOnlyRoute element={<Login />} />}
          />
          <Route
            path="/register"
            element={<PublicOnlyRoute element={<Register />} />}
          />
          <Route path="/lessons" element={<PrivateRoute element={<Learn />} />} />
          <Route path="/lessons/:id" element={<PrivateRoute element={<LessonDetail />} />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute
                element={
                  localStorage.getItem("role") === "ADMIN" ?
                    <Admin />
                  : <Navigate to="/lessons" replace />
                }
              />
            }
          />

          <Route path="/forum" element={<PrivateRoute element={<div>Forum coming soon</div>} />} />
          <Route path="/forum/:id" element={<PrivateRoute element={<div>Post detail coming soon</div>} />} />
          <Route path="/quests" element={<PrivateRoute element={<Quests />} />} />
<Route path="/quests/:id" element={<PrivateRoute element={<QuestDetail />} />} />
          <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
          <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </ThemeProvider>
);

export default App;
