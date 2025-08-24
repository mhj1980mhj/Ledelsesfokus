import { RefreshCw, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  subtitle: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  "data-testid"?: string;
}

export default function Header({ title, subtitle, onRefresh, isRefreshing, "data-testid": testId }: HeaderProps) {
  return (
    <header 
      className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-10"
      data-testid={testId}
    >
      <div className="px-8 py-6">
        <div className="flex items-center justify-between">
          <div data-testid="header-titles">
            <h2 className="text-3xl font-bold text-gray-800" data-testid="page-title">
              {title}
            </h2>
            <p className="text-gray-600 mt-1" data-testid="page-subtitle">
              {subtitle}
            </p>
          </div>
          
          <div className="flex items-center space-x-4" data-testid="header-actions">
            <Button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="glossy-btn text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              data-testid="button-refresh"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Opdaterer...' : 'Opdater Data'}
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="bg-white/70 backdrop-blur-xl border border-gray-200 rounded-xl hover:bg-white transition-all duration-300"
              data-testid="button-notifications"
            >
              <Bell className="h-4 w-4 text-gray-600" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
