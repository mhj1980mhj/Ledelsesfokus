import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import Navigation from "@/components/navigation";
import PageHeader from "@/components/page-header";
import ProjectTimeline from "@/components/project-timeline";

interface ManagementFocusProps {
  onLogout: () => void;
}

export default function ManagementFocus({ onLogout }: ManagementFocusProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader title="Ledelsesfokus" subtitle="Projektoverblik" onLogout={onLogout} />
      <Navigation />

      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="w-full space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Projekter</h2>
          
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 border border-gray-200/50 shadow-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Søg efter projektnavn, segment eller beskrivelse..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>

              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="w-[200px]" data-testid="select-area-filter">
                  <SelectValue placeholder="Alle områder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle områder</SelectItem>
                  <SelectItem value="Sekretariat">Sekretariat</SelectItem>
                  <SelectItem value="Drift">Drift</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <ProjectTimeline searchQuery={searchQuery} areaFilter={areaFilter} />
        </div>
      </main>
    </div>
  );
}
