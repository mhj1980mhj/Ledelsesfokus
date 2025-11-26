import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Settings, Plus, X } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import PageHeader from "@/components/page-header";
import ProjectTimeline from "@/components/project-timeline";
import { useToast } from "@/hooks/use-toast";

type PinnedLink = {
  id: string;
  name: string;
  url: string;
  type: "power-bi" | "microsoft-lists" | "sharepoint-folder";
};

interface ManagementFocusProps {
  onLogout: () => void;
  pinnedLinks: PinnedLink[];
  setPinnedLinks: (links: PinnedLink[]) => void;
}

export default function ManagementFocus({ onLogout, pinnedLinks, setPinnedLinks }: ManagementFocusProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [ansvarligFilter, setAnsvarligFilter] = useState("all");
  const [isAreasDialogOpen, setIsAreasDialogOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaColor, setNewAreaColor] = useState("#9c9387");
  const { toast } = useToast();

  const { data: projects = [] } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const { data: areas = [] } = useQuery<any[]>({
    queryKey: ["/api/areas"],
  });

  const createAreaMutation = useMutation({
    mutationFn: async (data: { name: string; color: string }) => {
      const response = await fetch("/api/areas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create area");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/areas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setNewAreaName("");
      setNewAreaColor("#9c9387");
      toast({ description: "Område oprettet" });
    },
    onError: () => {
      toast({ description: "Kunne ikke oprette område", variant: "destructive" });
    },
  });

  const deleteAreaMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/areas/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete area");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/areas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({ description: "Område slettet" });
    },
    onError: () => {
      toast({ description: "Kunne ikke slette område", variant: "destructive" });
    },
  });

  const uniqueAnsvarlige = useMemo(() => {
    const ansvarlige = projects
      .map(p => p.ansvarlig)
      .filter(ansvarlig => ansvarlig && ansvarlig.trim() !== "");
    return Array.from(new Set(ansvarlige)).sort();
  }, [projects]);

  const handleAddArea = () => {
    if (!newAreaName.trim()) return;
    createAreaMutation.mutate({ name: newAreaName, color: newAreaColor });
  };

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
                  placeholder="Søg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>

              <Select value={ansvarligFilter} onValueChange={setAnsvarligFilter}>
                <SelectTrigger className="w-[200px]" data-testid="select-ansvarlig-filter">
                  <SelectValue placeholder="Alle ansvarlige" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle ansvarlige</SelectItem>
                  {uniqueAnsvarlige.map(ansvarlig => (
                    <SelectItem key={ansvarlig} value={ansvarlig}>
                      {ansvarlig}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Dialog open={isAreasDialogOpen} onOpenChange={setIsAreasDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" data-testid="button-manage-areas">
                    <Settings className="h-4 w-4 mr-2" />
                    Områder
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Administrer områder</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {areas.map(area => (
                        <div key={area.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded" style={{ backgroundColor: area.color }} />
                            <span className="text-sm font-medium">{area.name}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAreaMutation.mutate(area.id)}
                            data-testid={`button-delete-area-${area.id}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <Input
                        placeholder="Området navn"
                        value={newAreaName}
                        onChange={(e) => setNewAreaName(e.target.value)}
                        data-testid="input-area-name"
                      />
                      <div className="flex gap-2">
                        <input
                          type="color"
                          value={newAreaColor}
                          onChange={(e) => setNewAreaColor(e.target.value)}
                          className="w-10 h-10 rounded cursor-pointer"
                          data-testid="input-area-color"
                        />
                        <Button
                          onClick={handleAddArea}
                          disabled={createAreaMutation.isPending || !newAreaName.trim()}
                          className="flex-1 bg-[#9c9387] hover:bg-[#8a816d] text-white"
                          data-testid="button-add-area"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Tilføj
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger className="w-[200px]" data-testid="select-area-filter">
                  <SelectValue placeholder="Alle områder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle områder</SelectItem>
                  {areas.map(area => (
                    <SelectItem key={area.id} value={area.name}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: area.color }} />
                        {area.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <ProjectTimeline searchQuery={searchQuery} areaFilter={areaFilter} ansvarligFilter={ansvarligFilter} areas={areas} />
        </div>
      </main>
    </div>
  );
}
