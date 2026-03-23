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
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Redirects to /login if no token
const PrivateRoute = ({ element }: { element: JSX.Element }) => {
  return localStorage.getItem("token") ? element : (
      <Navigate to="/login" replace />
    );
};

// Redirects to /learn if already logged in
const PublicOnlyRoute = ({ element }: { element: JSX.Element }) => {
  return localStorage.getItem("token") ?
      <Navigate to="/learn" replace />
    : element;
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
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <TokenExpiryHandler />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route
            path="/login"
            element={<PublicOnlyRoute element={<Login />} />}
          />
          <Route
            path="/register"
            element={<PublicOnlyRoute element={<Register />} />}
          />
          <Route path="/learn" element={<PrivateRoute element={<Learn />} />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute
                element={
                  localStorage.getItem("role") === "ADMIN" ?
                    <Admin />
                  : <Navigate to="/learn" replace />
                }
              />
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
