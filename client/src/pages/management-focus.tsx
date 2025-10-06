import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Settings as SettingsIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/navigation";
import PageHeader from "@/components/page-header";
import QuarterlyCalendar from "@/components/quarterly-calendar";
import ProjectFormDialog from "@/components/project-form-dialog";
import LoadingShimmer from "@/components/loading-shimmer";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Project } from "@shared/schema";
import { z } from "zod";
import { insertProjectSchema } from "@shared/schema";

interface ManagementFocusProps {
  onLogout: () => void;
}

const projectFormSchema = insertProjectSchema.extend({
  startDate: z.string().min(1, "Start dato er påkrævet"),
  endDate: z.string().min(1, "Slut dato er påkrævet"),
});

export default function ManagementFocus({ onLogout }: ManagementFocusProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const { toast } = useToast();

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectFormSchema>) => {
      return await apiRequest("/api/projects", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      setIsProjectDialogOpen(false);
      toast({
        title: "Projekt oprettet",
        description: "Dit nye projekt er blevet tilføjet til tidslinjen",
      });
    },
    onError: () => {
    

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader title="Ledelsesfokus" subtitle="Projektoverblik" onLogout={onLogout} />
      <Navigation />

      {/* Main Content with Tabs */}
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

          {/* Projekter Tab */}
          <TabsContent value="projekter" className="space-y-8">
            {/* Filter and Actions Bar */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
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
          </TabsContent>

          {/* Områder Tab */}
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

              {/* Areas List - Placeholder */}
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
    </div>
  );
}
