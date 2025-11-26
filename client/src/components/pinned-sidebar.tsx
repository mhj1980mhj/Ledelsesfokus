import { X, ExternalLink, Pin, Folder, List, BarChart3, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PinnedLink {
  id: string;
  name: string;
  url: string;
  type: "power-bi" | "microsoft-lists" | "sharepoint-folder";
}

interface PinnedSidebarProps {
  pinnedLinks: PinnedLink[];
  onUnpin: (id: string) => void;
  isMinimized: boolean;
  onToggleMinimize: () => void;
}

export default function PinnedSidebar({ pinnedLinks, onUnpin, isMinimized, onToggleMinimize }: PinnedSidebarProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "microsoft-lists":
        return <List className="h-5 w-5 text-[#107C10]" />;
      case "sharepoint-folder":
        return <Folder className="h-5 w-5 text-[#ED7D31]" />;
      case "power-bi":
      default:
        return <BarChart3 className="h-5 w-5 text-[#0078D4]" />;
    }
  };

  const handleOpenLink = (link: PinnedLink) => {
    if (link.type === "microsoft-lists" || link.type === "sharepoint-folder") {
      window.open(link.url, "_blank");
    } else {
      // For Power BI, just open in new tab
      window.open(link.url, "_blank");
    }
  };

  return (
    <div className={`bg-white/70 backdrop-blur-xl border-r border-gray-200/50 shadow-lg h-screen fixed left-0 top-0 flex flex-col overflow-hidden transition-all duration-300 ${isMinimized ? "w-16" : "w-64"}`}>
      <div className="p-3 border-b border-gray-200/50 flex items-center justify-between">
        <div className={`flex items-center gap-2 ${isMinimized ? "hidden" : ""}`}>
          <Pin className="h-5 w-5 text-[#9c9387] flex-shrink-0" />
          <h2 className="text-sm font-bold text-gray-800 truncate">Fastgjort</h2>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onToggleMinimize}
          className="h-7 w-7 p-0 ml-auto"
          data-testid="button-toggle-sidebar"
        >
          {isMinimized ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex-grow overflow-y-auto">
        {pinnedLinks.length === 0 ? (
          <div className={`p-3 text-center ${isMinimized ? "hidden" : ""}`}>
            <Pin className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">
              Fastgør links ved at klikke på stiften
            </p>
          </div>
        ) : (
          <div className={`space-y-2 p-2 ${isMinimized ? "p-1" : "p-3"}`}>
            {pinnedLinks.map((link) => (
              <Tooltip key={link.id}>
                <TooltipTrigger asChild>
                  <div className={`group relative bg-gradient-to-r from-[#9c9387]/10 to-transparent hover:from-[#9c9387]/20 rounded-lg transition-all duration-200 border border-[#9c9387]/20 hover:border-[#9c9387]/40 ${isMinimized ? "p-2" : "p-3"}`}>
                    <div className={`flex items-start gap-2 ${isMinimized ? "mb-0 justify-center" : "mb-2"}`}>
                      {getTypeIcon(link.type)}
                      {!isMinimized && (
                        <div className="flex-grow min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">
                            {link.name}
                          </p>
                        </div>
                      )}
                    </div>
                    {!isMinimized && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleOpenLink(link)}
                          className="h-7 px-2 text-xs flex-grow bg-[#9c9387]/20 hover:bg-[#9c9387]/40 text-[#9c9387] transition-all"
                          data-testid={`button-open-pinned-${link.id}`}
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Åbn
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUnpin(link.id)}
                          className="h-7 px-2 text-gray-400 hover:text-red-600 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                          data-testid={`button-unpin-${link.id}`}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-gray-900 text-white text-xs px-2 py-1">
                  {link.name}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
