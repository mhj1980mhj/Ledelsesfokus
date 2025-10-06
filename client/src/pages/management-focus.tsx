import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Settings as SettingsIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/navigation";
import PageHeader from "@/components/page-header";
import QuarterlyCalendar from "@/components/quarterly-calendar";
import ProjectFormDialog from "@/components/project-form-dialog";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Project } from "@shared/schema";

interface ManagementFocusProps {
  onLogout: () => void;
}

export default function ManagementFocus({ onLogout }: ManagementFocusProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("all");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const { data: projects = [], isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      toast({
        title: "Projekt oprettet",
        description: "Dit projekt er blevet oprettet succesfuldt.",
      });
    },
    onError: () => {
      toast({
        title: "Fejl",
        description: "Kunne ikke oprette projekt.",
        variant: "destructive",
      });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest("PUT", `/api/projects/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      setEditingProject(null);
      toast({
        title: "Projekt opdateret",
        description: "Projektet er blevet opdateret succesfuldt.",
      });
    },
    onError: () => {
      toast({
        title: "Fejl",
        description: "Kunne ikke opdatere projekt.",
        variant: "destructive",
      });
    },
  });

  const handleProjectSubmit = (data: any) => {
    if (editingProject) {
      updateProjectMutation.mutate({ id: editingProject.id, data });
    } else {
      createProjectMutation.mutate(data);
    }
  };

  const handleProjectClick = (project: Project) => {
    setEditingProject(project);
    setIsProjectDialogOpen(true);
  };

  const handleCreateClick = () => {
    setEditingProject(null);
    setIsProjectDialogOpen(true);
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      searchQuery === "" ||
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader title="Ledelsesfokus" subtitle="Projektoverblik" onLogout={onLogout} />
      <Navigation />

      <main className="max-w-7xl mx-auto px-8 py-8">
        <Tabs defaultValue="projekter" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="projekter" data-testid="tab-projekter">
              Projekter
            </TabsTrigger>
            <TabsTrigger value="omraader" data-testid="tab-omraader">
              Områder
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projekter" className="space-y-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <div className="flex items-center gap-4">
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

                <Button
                  className="bg-[#9c9387] hover:bg-[#8a816d] text-white"
                  onClick={handleCreateClick}
                  data-testid="button-create-project"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Opret projekt
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 shadow-lg min-h-[500px] flex items-center justify-center">
                <div className="text-gray-500">Indlæser projekter...</div>
              </div>
            ) : filteredProjects.length === 0 && searchQuery === "" ? (
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
            ) : (
              <QuarterlyCalendar projects={filteredProjects} onProjectClick={handleProjectClick} />
            )}
          </TabsContent>

          <TabsContent value="omraader">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Områder</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Administrer organisationens områder
                  </p>
                </div>
                <Button
                  className="bg-[#9c9387] hover:bg-[#8a816d] text-white"
                  data-testid="button-create-area"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Opret område
                </Button>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Sekretariat</h3>
                      <p className="text-sm text-gray-500">Oprettet af: AB</p>
                    </div>
                    <SettingsIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Drift</h3>
                      <p className="text-sm text-gray-500">Oprettet af: CD</p>
                    </div>
                    <SettingsIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">IT</h3>
                      <p className="text-sm text-gray-500">Oprettet af: EF</p>
                    </div>
                    <SettingsIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <ProjectFormDialog
        open={isProjectDialogOpen}
        onOpenChange={setIsProjectDialogOpen}
        onSubmit={handleProjectSubmit}
        project={editingProject}
        isPending={createProjectMutation.isPending || updateProjectMutation.isPending}
      />
    </div>
  );
}
