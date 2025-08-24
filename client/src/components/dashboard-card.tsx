import { ReactNode } from "react";
import { Download, ExternalLink, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  showDownload?: boolean;
  showExpand?: boolean;
  showSettings?: boolean;
  dashboardUrl?: string;
  onSettings?: () => void;
  onExpand?: () => void;
  "data-testid"?: string;
}

export default function DashboardCard({ 
  title, 
  children, 
  showDownload = false, 
  showExpand = false,
  showSettings = false,
  dashboardUrl,
  onSettings,
  onExpand,
  "data-testid": testId
}: DashboardCardProps) {
  
  const handleMaximize = () => {
    if (dashboardUrl && onExpand) {
      onExpand();
    }
  };
  return (
    <div 
      className="dashboard-card bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg"
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-4" data-testid="card-header">
        <h3 className="text-xl font-semibold text-gray-800" data-testid="card-title">
          {title}
        </h3>
        
        {(showDownload || showExpand || showSettings) && (
          <div className="flex space-x-2" data-testid="card-actions">
            {showDownload && (
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                data-testid="button-download"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            {showExpand && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dashboardUrl && window.open(dashboardUrl, '_blank')}
                className="text-gray-400 hover:text-gray-600 transition-colors h-8 w-8 p-0"
                data-testid="button-expand"
                disabled={!dashboardUrl}
              >
                <ExternalLink className="h-3 w-3" />
              </Button>
            )}
            {showSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSettings}
                className="text-gray-400 hover:text-gray-600 transition-colors h-8 w-8 p-0"
                data-testid="button-settings"
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
        
        {!showDownload && !showExpand && !showSettings && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMaximize}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            data-testid="button-expand-default"
            disabled={!dashboardUrl}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div data-testid="card-content">
        {children}
      </div>
    </div>
  );
}
