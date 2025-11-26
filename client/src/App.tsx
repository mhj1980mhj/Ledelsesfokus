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
import PinnedSidebar from "@/components/pinned-sidebar";

type PinnedLink = {
  id: string;
  name: string;
  url: string;
  type: "power-bi" | "microsoft-lists" | "sharepoint-folder";
};

function Router({ isAuthenticated, onLogin, onLogout, pinnedLinks, setPinnedLinks }: { 
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
  pinnedLinks: PinnedLink[];
  setPinnedLinks: (links: PinnedLink[]) => void;
}) {
  if (!isAuthenticated) {
    return <Login onLogin={onLogin} />;
  }

  return (
    <div className="flex">
      <PinnedSidebar pinnedLinks={pinnedLinks} onUnpin={(id) => setPinnedLinks(pinnedLinks.filter(link => link.id !== id))} />
      <div className="flex-grow ml-64">
        <Switch>
          <Route path="/" component={() => <PowerBI onLogout={onLogout} pinnedLinks={pinnedLinks} setPinnedLinks={setPinnedLinks} />} />
          <Route path="/ledelsesfokus" component={() => <ManagementFocus onLogout={onLogout} pinnedLinks={pinnedLinks} setPinnedLinks={setPinnedLinks} />} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinnedLinks, setPinnedLinks] = useState<PinnedLink[]>([]);

  // Load pinned links from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("pinnedLinks");
    if (stored) {
      try {
        setPinnedLinks(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load pinned links:", e);
      }
    }
  }, []);

  // Save pinned links to localStorage
  useEffect(() => {
    localStorage.setItem("pinnedLinks", JSON.stringify(pinnedLinks));
  }, [pinnedLinks]);

  useEffect(() => {
    // Check if user is already authenticated
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
          pinnedLinks={pinnedLinks}
          setPinnedLinks={setPinnedLinks}
        />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
