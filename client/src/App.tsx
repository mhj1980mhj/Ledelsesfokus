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

function Router({ isAuthenticated, onLogin, onLogout }: { 
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}) {
  if (!isAuthenticated) {
    return <Login onLogin={onLogin} />;
  }

  return (
    <Switch>
      <Route path="/" component={() => <PowerBI onLogout={onLogout} />} />
      <Route path="/ledelsesfokus" component={() => <ManagementFocus onLogout={onLogout} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const authStatus = localStorage.getItem("al2bolig_authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("al2bolig_authenticated");
    setIsAuthenticated(false);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router 
          isAuthenticated={isAuthenticated} 
          onLogin={handleLogin} 
          onLogout={handleLogout}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
