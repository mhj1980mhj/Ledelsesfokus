import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Search, Settings, Plus, X, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Navigation from "@/components/navigation";
import PageHeader from "@/components/page-header";
import ProjectTimeline from "@/components/project-timeline";
import { useToast } from "@/hooks/use-toast";

interface ManagementFocusProps {
  onLogout: () => void;
}

export default function ManagementFocus({ onLogout }: ManagementFocusProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [areaFilter, setAreaFilter] = useState("all");
  const [ansvarligFilter, setAnsvarligFilter] = useState("all");
  const [isAreasDialogOpen, setIsAreasDialogOpen] = useState(false);
  const [newAreaName, setNewAreaName] = useState("");
  const [newAreaColor, setNewAreaColor] = useState("#9c9387");
  
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{ open: boolean; areaId: string; areaName: string; projectCount: number }>({ 
    open: false, areaId: "", areaName: "", projectCount: 0 
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  
  const [editDialog, setEditDialog] = useState<{ open: boolean; areaId: string; name: string; color: string }>({ 
    open: false, areaId: "", name: "", color: "#9c9387" 
  });
  const [editConfirmDialog, setEditConfirmDialog] = useState(false);
  
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

  const updateAreaMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name?: string; color?: string } }) => {
      const response = await fetch(`/api/areas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update area");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/areas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setEditDialog({ open: false, areaId: "", name: "", color: "#9c9387" });
      toast({ description: "Område opdateret" });
    },
    onError: () => {
      toast({ description: "Kunne ikke opdatere område", variant: "destructive" });
    },
  });

  const deleteAreaMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/areas/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete area");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/areas"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setDeleteConfirmDialog({ open: false, areaId: "", areaName: "", projectCount: 0 });
      setDeleteConfirmText("");
      const projectMsg = data.deletedProjectCount > 0 
        ? ` og ${data.deletedProjectCount} projekt${data.deletedProjectCount > 1 ? 'er' : ''}` 
        : '';
      toast({ description: `Område${projectMsg} slettet` });
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

  const openDeleteConfirm = (area: any) => {
    const projectCount = projects.filter(p => p.area === area.name).length;
    setDeleteConfirmDialog({ open: true, areaId: area.id, areaName: area.name, projectCount });
    setDeleteConfirmText("");
  };

  const handleDeleteArea = () => {
    if (deleteConfirmText.toLowerCase() !== "slet") return;
    deleteAreaMutation.mutate(deleteConfirmDialog.areaId);
  };

  const openEditDialog = (area: any) => {
    setEditDialog({ open: true, areaId: area.id, name: area.name, color: area.color });
  };

  const handleEditArea = () => {
    setEditConfirmDialog(true);
  };

  const confirmEditArea = () => {
    updateAreaMutation.mutate({ 
      id: editDialog.areaId, 
      data: { name: editDialog.name, color: editDialog.color } 
    });
    setEditConfirmDialog(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-neutral-100">
      <PageHeader title="Ledelsesoverblik" subtitle="Ledelsesfokus" onLogout={onLogout} />
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
                    <DialogDescription>
                      Opret, rediger eller slet områder til dine projekter.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      {areas.map(area => {
                        const areaProjectCount = projects.filter(p => p.area === area.name).length;
                        return (
                          <div key={area.id} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded" style={{ backgroundColor: area.color }} />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{area.name}</span>
                                <span className="text-xs text-gray-500">{areaProjectCount} projekt{areaProjectCount !== 1 ? 'er' : ''}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditDialog(area)}
                                data-testid={`button-edit-area-${area.id}`}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteConfirm(area)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                data-testid={`button-delete-area-${area.id}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
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

          <ProjectTimeline searchQuery={searchQuery} areaFilter={areaFilter} ansvarligFilter={ansvarligFilter} />
        </div>
      </main>

      <Dialog open={deleteConfirmDialog.open} onOpenChange={(open) => {
        if (!open) {
          setDeleteConfirmDialog({ open: false, areaId: "", areaName: "", projectCount: 0 });
          setDeleteConfirmText("");
        }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-red-600">Slet område</DialogTitle>
            <DialogDescription className="space-y-3">
              <span className="block">
                Er du sikker på, at du vil slette området "{deleteConfirmDialog.areaName}"?
              </span>
              {deleteConfirmDialog.projectCount > 0 && (
                <span className="block text-red-600 font-bold text-lg bg-red-50 p-3 rounded-lg border border-red-200">
                  ⚠️ BEMÆRK: Dette vil SLETTE {deleteConfirmDialog.projectCount} PROJEKT{deleteConfirmDialog.projectCount > 1 ? 'ER' : ''} og alle deres segmenter!
                </span>
              )}
              <span className="block">
                Skriv <span className="font-bold">"slet"</span> for at bekræfte.
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder='Skriv "slet" for at bekræfte'
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              data-testid="input-delete-confirm"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteConfirmDialog({ open: false, areaId: "", areaName: "", projectCount: 0 });
                  setDeleteConfirmText("");
                }}
                data-testid="button-cancel-delete"
              >
                Annuller
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteArea}
                disabled={deleteConfirmText.toLowerCase() !== "slet" || deleteAreaMutation.isPending}
                data-testid="button-confirm-delete"
              >
                {deleteAreaMutation.isPending ? "Sletter..." : "Slet område"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialog.open} onOpenChange={(open) => {
        if (!open) {
          setEditDialog({ open: false, areaId: "", name: "", color: "#9c9387" });
        }
      }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Rediger område</DialogTitle>
            <DialogDescription>
              Rediger navn og farve på området.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="Områdenavn"
              value={editDialog.name}
              onChange={(e) => setEditDialog({ ...editDialog, name: e.target.value })}
              data-testid="input-edit-area-name"
            />
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Farve:</span>
              <input
                type="color"
                value={editDialog.color}
                onChange={(e) => setEditDialog({ ...editDialog, color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
                data-testid="input-edit-area-color"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setEditDialog({ open: false, areaId: "", name: "", color: "#9c9387" })}
                data-testid="button-cancel-edit"
              >
                Annuller
              </Button>
              <Button
                onClick={handleEditArea}
                disabled={!editDialog.name.trim() || updateAreaMutation.isPending}
                className="bg-[#9c9387] hover:bg-[#8a816d] text-white"
                data-testid="button-save-edit"
              >
                Gem ændringer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={editConfirmDialog} onOpenChange={setEditConfirmDialog}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Bekræft ændringer</DialogTitle>
            <DialogDescription>
              Er du sikker på, at du vil gemme ændringerne?
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setEditConfirmDialog(false)}
              data-testid="button-cancel-confirm-edit"
            >
              Nej
            </Button>
            <Button
              onClick={confirmEditArea}
              disabled={updateAreaMutation.isPending}
              className="bg-[#9c9387] hover:bg-[#8a816d] text-white"
              data-testid="button-confirm-edit"
            >
              {updateAreaMutation.isPending ? "Gemmer..." : "Ja, gem"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
