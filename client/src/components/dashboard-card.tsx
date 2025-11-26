import { ReactNode } from "react";
import { Download, ExternalLink, Settings, BarChart3, List, Folder, Pin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  showDownload?: boolean;
  showExpand?: boolean;
  showSettings?: boolean;
  dashboardUrl?: string;
  type?: "power-bi" | "microsoft-lists" | "sharepoint-folder";
  onSettings?: () => void;
  onExpand?: () => void;
  onPin?: () => void;
  isPinned?: boolean;
  "data-testid"?: string;
}

export default function DashboardCard({ 
  title, 
  children, 
  showDownload = false, 
  showExpand = false,
  showSettings = false,
  dashboardUrl,
  type = "power-bi",
  onSettings,
  onExpand,
  onPin,
  isPinned = false,
  "data-testid": testId
}: DashboardCardProps) {
  
  const handleMaximize = () => {
    if (dashboardUrl && onExpand) {
      onExpand();
    }
  };

  const typeIcon = type === "microsoft-lists" ? 
    <List className="h-7 w-7 text-[#107C10]" data-testid="icon-microsoft-lists" /> :
    type === "sharepoint-folder" ?
    <Folder className="h-7 w-7 text-[#ED7D31]" data-testid="icon-sharepoint-folder" /> :
    <BarChart3 className="h-7 w-7 text-[#0078D4]" data-testid="icon-power-bi" />;

  return (
    <div 
      className="dashboard-card bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg"
      data-testid={testId}
    >
      <div className="flex items-center justify-between mb-4" data-testid="card-header">
        <div className="flex items-center gap-2 min-w-0">
          {typeIcon}
          <h3 className="text-xl font-semibold text-gray-800 line-clamp-1" data-testid="card-title" title={title}>
            {title}
          </h3>
        </div>
        
        {(showDownload || showExpand || showSettings || onPin) && (
          <div className="flex space-x-2" data-testid="card-actions">
            {onPin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onPin}
                className={`h-8 w-8 p-0 transition-colors ${isPinned ? "text-[#9c9387] hover:text-[#8a816d]" : "text-gray-400 hover:text-[#9c9387]"}`}
                data-testid="button-pin"
              >
                <Pin className={`h-4 w-4 ${isPinned ? "fill-current" : ""}`} />
              </Button>
            )}
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
