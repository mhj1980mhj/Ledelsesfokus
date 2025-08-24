import { ReactNode } from "react";
import { Download, ExternalLink, Trash2, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardCardProps {
  title: string;
  children: ReactNode;
  showDownload?: boolean;
  showExpand?: boolean;
  showDelete?: boolean;
  dashboardUrl?: string;
  onDelete?: () => void;
  "data-testid"?: string;
}

export default function DashboardCard({ 
  title, 
  children, 
  showDownload = false, 
  showExpand = false,
  showDelete = false,
  dashboardUrl,
  onDelete,
  "data-testid": testId
}: DashboardCardProps) {
  
  const handleMaximize = () => {
    if (dashboardUrl) {
      window.open(dashboardUrl, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
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
        
        {(showDownload || showExpand || showDelete) && (
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
                size="icon"
                onClick={handleMaximize}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                data-testid="button-expand"
                disabled={!dashboardUrl}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            {showDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="text-gray-400 hover:text-red-600 transition-colors"
                data-testid="button-delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        
        {!showDownload && !showExpand && !showDelete && (
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
