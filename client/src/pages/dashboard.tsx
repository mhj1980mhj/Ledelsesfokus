import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Settings, Plus, Calendar, ArrowUpDown, Clock, ExternalLink, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPowerBIDashboardSchema } from "@shared/schema";
import { z } from "zod";
// import { apiRequest } from "@/lib/queryClient";
// import PowerBIEmbed from "@/components/power-bi-embed";
import DashboardCard from "@/components/dashboard-card";
import { useToast } from "@/hooks/use-toast";

type PowerBIDashboard = {
  id: string;
  name: string;
  url: string;
  description?: string;
  category: string;
  createdAt: string;
  isActive: number;
};

type SortOption = "latest" | "alphabetical";

const formSchema = insertPowerBIDashboardSchema.extend({
  url: z.string().url("Indtast venligst en gyldig URL")
});

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<PowerBIDashboard | null>(null);
  const [viewingDashboard, setViewingDashboard] = useState<PowerBIDashboard | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      category: "General"
    }
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      category: "General"
    }
  });

  const { data: dashboards = [], isLoading, error } = useQuery<PowerBIDashboard[]>({
    queryKey: ["/api/dashboards"],
    retry: 3,
    staleTime: 30000
  });

  const createDashboardMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await fetch("/api/dashboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create dashboard");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({
        title: "Success!",
        description: "Dashboard er tilføjet med succes"
      });
      setIsAddDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Fejl",
        description: "Kunne ikke tilføje dashboard. Prøv igen.",
        variant: "destructive"
      });
      console.error("Error creating dashboard:", error);
    }
  });

  const updateDashboardMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: z.infer<typeof formSchema> }) => {
      const response = await fetch(`/api/dashboards/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update dashboard");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({
        title: "Opdateret!",
        description: "Dashboard er opdateret med succes"
      });
      setIsEditDialogOpen(false);
      setEditingDashboard(null);
      editForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Fejl",
        description: "Kunne ikke opdatere dashboard. Prøv igen.",
        variant: "destructive"
      });
      console.error("Error updating dashboard:", error);
    }
  });

  const deleteDashboardMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/dashboards/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete dashboard");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
      toast({
        title: "Slettet!",
        description: "Dashboard er fjernet med succes"
      });
      setIsEditDialogOpen(false);
      setEditingDashboard(null);
    },
    onError: (error) => {
      toast({
        title: "Fejl",
        description: "Kunne ikke slette dashboard. Prøv igen.",
        variant: "destructive"
      });
      console.error("Error deleting dashboard:", error);
    }
  });

  const filteredAndSortedDashboards = useMemo(() => {
    let filtered = dashboards.filter(dashboard => 
      dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dashboard.description && dashboard.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (sortBy === "alphabetical") {
      filtered.sort((a, b) => a.name.localeCompare(b.name, "da"));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [dashboards, searchQuery, sortBy]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createDashboardMutation.mutate(data);
  };

  const onEditSubmit = (data: z.infer<typeof formSchema>) => {
    if (editingDashboard) {
      updateDashboardMutation.mutate({ id: editingDashboard.id, data });
    }
  };

  const handleEditDashboard = (dashboard: PowerBIDashboard) => {
    setEditingDashboard(dashboard);
    editForm.reset({
      name: dashboard.name,
      url: dashboard.url,
      description: dashboard.description || "",
      category: dashboard.category
    });
    setIsEditDialogOpen(true);
  };

  const handleEmbedDashboard = (dashboard: PowerBIDashboard) => {
    console.log("Expanding dashboard:", dashboard.name);
    console.log("Current viewingDashboard:", viewingDashboard);
    setViewingDashboard(dashboard);
    console.log("Set viewingDashboard to:", dashboard);
  };

  const handleDeleteDashboard = () => {
    if (editingDashboard) {
      deleteDashboardMutation.mutate(editingDashboard.id);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Kunne ikke indlæse dashboards</h2>
          <p className="text-gray-600">Der opstod en fejl ved indlæsning af data.</p>
        </div>
      </div>
    );
  }

  // If viewing a dashboard, show full screen view
  if (viewingDashboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Header with back button */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 shadow-sm sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingDashboard(null)}
                  className="text-gray-600 hover:text-gray-900"
                  data-testid="button-back"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Tilbage til oversigt
                </Button>
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900" data-testid="dashboard-title">
                    {viewingDashboard.name}
                  </h1>
                  {viewingDashboard.description && (
                    <p className="text-sm text-gray-600">{viewingDashboard.description}</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditDashboard(viewingDashboard)}
                className="text-gray-600 hover:text-gray-900"
                data-testid="button-edit-current"
              >
                <Settings className="mr-2 h-4 w-4" />
                Rediger
              </Button>
            </div>
          </div>
        </header>

        {/* Full screen Power BI embed */}
        <main className="h-[calc(100vh-100px)]">
          {viewingDashboard.url ? (
            <iframe
              src={viewingDashboard.url}
              className="w-full h-full border-0"
              allowFullScreen
              title={viewingDashboard.name}
              data-testid="powerbi-iframe-fullscreen"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <p className="text-gray-500 mb-4">Ingen URL tilgængelig for dette dashboard</p>
                <Button
                  onClick={() => handleEditDashboard(viewingDashboard)}
                  className="bg-primary-600 hover:bg-primary-700"
                >
                  Tilføj URL
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Edit Dialog for full screen view */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md" data-testid="edit-dialog">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                Rediger Dashboard
              </DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Navn</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Dashboard navn..." 
                          {...field} 
                          className="bg-white/50"
                          data-testid="input-edit-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Power BI URL</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://app.powerbi.com/..." 
                          {...field}
                          className="bg-white/50"
                          data-testid="input-edit-url"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Beskrivelse</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Beskriv hvad dette dashboard viser..." 
                          {...field}
                          value={field.value || ""}
                          className="bg-white/50 min-h-[100px]"
                          data-testid="input-edit-description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Kategori</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/50" data-testid="select-edit-category">
                            <SelectValue placeholder="Vælg kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Økonomi">Økonomi</SelectItem>
                          <SelectItem value="Beboeranalyse">Beboeranalyse</SelectItem>
                          <SelectItem value="Vedligeholdelse">Vedligeholdelse</SelectItem>
                          <SelectItem value="Ejendomme">Ejendomme</SelectItem>
                          <SelectItem value="Bæredygtighed">Bæredygtighed</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-between gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDeleteDashboard}
                    disabled={deleteDashboardMutation.isPending}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    data-testid="button-delete-dashboard"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleteDashboardMutation.isPending ? "Sletter..." : "Slet"}
                  </Button>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditDialogOpen(false)}
                      data-testid="button-cancel-edit"
                    >
                      Annuller
                    </Button>
                    <Button
                      type="submit"
                      disabled={updateDashboardMutation.isPending}
                      className="bg-gradient-to-r from-primary-500 to-primary-600 text-white h-10"
                      data-testid="button-save-edit"
                    >
                      {updateDashboardMutation.isPending ? "Gemmer..." : "Gem ændringer"}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-white text-xl font-bold">A2</div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800" data-testid="page-title">
                  al2bolig Power BI Portal
                </h1>
                <p className="text-gray-600" data-testid="page-subtitle">
                  Adgang til alle business intelligence dashboards
                </p>
              </div>
            </div>
            
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 h-10"
                  data-testid="button-settings"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Tilføj Dashboard
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]" data-testid="dialog-add-dashboard">
                <DialogHeader>
                  <DialogTitle>Tilføj nyt Power BI Dashboard</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dashboard Navn</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Indtast dashboard navn..." 
                              {...field} 
                              data-testid="input-dashboard-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Power BI URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://app.powerbi.com/view?r=..." 
                              {...field} 
                              data-testid="input-dashboard-url"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-category">
                                <SelectValue placeholder="Vælg kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Økonomi">Økonomi</SelectItem>
                              <SelectItem value="Beboeranalyse">Beboeranalyse</SelectItem>
                              <SelectItem value="Vedligeholdelse">Vedligeholdelse</SelectItem>
                              <SelectItem value="Ejendomme">Ejendomme</SelectItem>
                              <SelectItem value="Bæredygtighed">Bæredygtighed</SelectItem>
                              <SelectItem value="General">General</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Beskrivelse (valgfri)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Beskriv hvad dette dashboard viser..." 
                              {...field}
                              value={field.value || ""} 
                              data-testid="textarea-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsAddDialogOpen(false)}
                        data-testid="button-cancel"
                      >
                        Annuller
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={createDashboardMutation.isPending}
                        className="bg-gradient-to-r from-primary-500 to-primary-600 text-white h-10"
                        data-testid="button-save"
                      >
                        {createDashboardMutation.isPending ? (
                          <>
                            <Plus className="mr-2 h-4 w-4 animate-spin" />
                            Gemmer...
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Gem Dashboard
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            {/* Edit Dashboard Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-md" data-testid="edit-dialog">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">
                    Rediger Dashboard
                  </DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                    <FormField
                      control={editForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Navn</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Dashboard navn..." 
                              {...field} 
                              className="bg-white/50"
                              data-testid="input-edit-name"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Power BI URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://app.powerbi.com/..." 
                              {...field}
                              className="bg-white/50"
                              data-testid="input-edit-url"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Beskrivelse</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Beskriv hvad dette dashboard viser..." 
                              {...field}
                              value={field.value || ""}
                              className="bg-white/50 min-h-[100px]"
                              data-testid="input-edit-description"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Kategori</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white/50" data-testid="select-edit-category">
                                <SelectValue placeholder="Vælg kategori" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Økonomi">Økonomi</SelectItem>
                              <SelectItem value="Beboeranalyse">Beboeranalyse</SelectItem>
                              <SelectItem value="Vedligeholdelse">Vedligeholdelse</SelectItem>
                              <SelectItem value="Ejendomme">Ejendomme</SelectItem>
                              <SelectItem value="Bæredygtighed">Bæredygtighed</SelectItem>
                              <SelectItem value="General">General</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between gap-3 pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDeleteDashboard}
                        disabled={deleteDashboardMutation.isPending}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        data-testid="button-delete-dashboard"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deleteDashboardMutation.isPending ? "Sletter..." : "Slet"}
                      </Button>
                      <div className="flex gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setIsEditDialogOpen(false)}
                          data-testid="button-cancel-edit"
                        >
                          Annuller
                        </Button>
                        <Button
                          type="submit"
                          disabled={updateDashboardMutation.isPending}
                          className="bg-primary-600 hover:bg-primary-700"
                          data-testid="button-save-edit"
                        >
                          {updateDashboardMutation.isPending ? "Gemmer..." : "Gem ændringer"}
                        </Button>
                      </div>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

          </div>

          {/* Search and Sort Controls */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Søg efter dashboards..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/70 backdrop-blur-xl border border-gray-200/50"
                data-testid="input-search"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">Sorter efter:</span>
              <div className="flex space-x-2">
                <Button
                  variant={sortBy === "latest" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("latest")}
                  className={sortBy === "latest" ? "glossy-btn" : ""}
                  data-testid="button-sort-latest"
                >
                  <Clock className="mr-2 h-3 w-3" />
                  Seneste
                </Button>
                <Button
                  variant={sortBy === "alphabetical" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("alphabetical")}
                  className={sortBy === "alphabetical" ? "glossy-btn" : ""}
                  data-testid="button-sort-alphabetical"
                >
                  <ArrowUpDown className="mr-2 h-3 w-3" />
                  Alfabetisk
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8">
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredAndSortedDashboards.length === 0 ? (
          <div className="text-center py-16" data-testid="no-dashboards">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery ? "Ingen dashboards fundet" : "Ingen dashboards endnu"}
            </h3>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `Din søgning efter "${searchQuery}" gav ingen resultater.`
                : "Tilføj dit første Power BI dashboard for at komme i gang."
              }
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="glossy-btn"
                data-testid="button-add-first"
              >
                <Plus className="mr-2 h-4 w-4" />
                Tilføj Dashboard
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6" data-testid="dashboard-grid">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                {searchQuery 
                  ? `Søgeresultater for "${searchQuery}" (${filteredAndSortedDashboards.length})`
                  : `Alle Dashboards (${filteredAndSortedDashboards.length})`
                }
              </h2>
              <div className="text-sm text-gray-500">
                Sorteret efter {sortBy === "latest" ? "seneste" : "alfabetisk"}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredAndSortedDashboards.map((dashboard) => (
                <DashboardCard
                  key={dashboard.id}
                  title={dashboard.name}
                  showExpand
                  showSettings
                  dashboardUrl={dashboard.url || undefined}
                  onExpand={() => handleEmbedDashboard(dashboard)}
                  onSettings={() => handleEditDashboard(dashboard)}
                  data-testid={`card-dashboard-${dashboard.id}`}
                >
                  <div className="space-y-4">
                    {dashboard.description && (
                      <p className="text-sm text-gray-600 mb-4" data-testid="dashboard-description">
                        {dashboard.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                        {dashboard.category}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(dashboard.createdAt).toLocaleDateString("da-DK")}
                      </span>
                    </div>
                    {dashboard.url ? (
                      <button
                        onClick={() => handleEmbedDashboard(dashboard)}
                        className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium h-10"
                        data-testid={`link-${dashboard.id}`}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Åbn {dashboard.name}
                      </button>
                    ) : (
                      <div className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-500 rounded-lg h-10">
                        <span className="text-sm">URL mangler - klik tandhjulet for at opdatere</span>
                      </div>
                    )}
                  </div>
                </DashboardCard>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}