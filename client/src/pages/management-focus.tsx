import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, LogOut } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/navigation";
import logoImage from "@assets/ChatGPT Image 24. aug. 2025, 16.38.56_1756046355129.png";

interface ManagementFocusProps {
  onLogout: () => void;
}

export default function ManagementFocus({ onLogout }: ManagementFocusProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("all");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img src={logoImage} alt="AL2bolig Logo" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900" data-testid="page-title">
                  Ledelsesfokus
                </h1>
                <p className="text-sm text-gray-600">Projektoverblik</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="text-gray-600 hover:text-gray-900"
              data-testid="button-logout"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log ud
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Filter and Actions Bar */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg mb-8">
          <div className="flex items-center gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Søg efter projektnavn eller ansvarlig..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>

            {/* Area Filter */}
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger className="w-[200px]" data-testid="select-area">
                <SelectValue placeholder="Vælg område" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle områder</SelectItem>
                <SelectItem value="sekretariat">Sekretariat</SelectItem>
                <SelectItem value="drift">Drift</SelectItem>
                <SelectItem value="it">IT</SelectItem>
              </SelectContent>
            </Select>

            {/* Create Project Button */}
            <Button
              className="bg-[#9c9387] hover:bg-[#8a816d] text-white"
              data-testid="button-create-project"
            >
              <Plus className="mr-2 h-4 w-4" />
              Opret projekt
            </Button>
          </div>
        </div>

        {/* Timeline Area - Placeholder for now */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 shadow-lg min-h-[500px]">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Ingen projekter endnu
              </h3>
              <p className="text-sm text-gray-500">
                Klik på "Opret projekt" for at tilføje dit første projekt til tidslinjen
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
