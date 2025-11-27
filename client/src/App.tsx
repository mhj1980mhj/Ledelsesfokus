import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import ManagementFocus from "@/pages/management-focus";
import PowerBI from "@/pages/powerbi";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router({ isAuthenticated, isAdmin, onLogin, onLogout }: { 
  isAuthenticated: boolean;
  isAdmin: boolean;
  onLogin: (isAdmin: boolean) => void;
  onLogout: () => void;
}) {
  if (!isAuthenticated) {
    return <Login onLogin={onLogin} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <PowerBI onLogout={onLogout} isAdmin={isAdmin} />} />
      <Route path="/ledelsesfokus" component={() => <ManagementFocus onLogout={onLogout} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem("al2bolig_authenticated");
    const userRole = localStorage.getItem("al2bolig_user_role");
    if (authStatus === "true") {
      setIsAuthenticated(true);
      setIsAdmin(userRole === "admin");
    }
  }, []);

  const handleLogin = (adminStatus: boolean) => {
    setIsAuthenticated(true);
    setIsAdmin(adminStatus);
  };

  const handleLogout = () => {
    localStorage.removeItem("al2bolig_authenticated");
    localStorage.removeItem("al2bolig_user_role");
    setIsAuthenticated(false);
    setIsAdmin(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router 
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          onLogin={handleLogin} 
          onLogout={handleLogout}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
