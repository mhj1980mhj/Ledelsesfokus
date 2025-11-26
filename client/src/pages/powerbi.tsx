import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Settings, Plus, Calendar, ArrowUpDown, Clock, ExternalLink, Trash2, ArrowLeft, ChevronDown, Check, Archive, ArchiveRestore } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPowerBIDashboardSchema } from "@shared/schema";
import { z } from "zod";
import Navigation from "@/components/navigation";
import PageHeader from "@/components/page-header";
import DashboardCard from "@/components/dashboard-card";
import { useToast } from "@/hooks/use-toast";

type PowerBIDashboard = {
  id: string;
  name: string;
  url: string;
  description?: string;
  category: string;
  type?: string;
  createdAt: string;
  isActive: number;
};

type SortOption = "latest" | "alphabetical";

const formSchema = insertPowerBIDashboardSchema.extend({
  url: z.string().url("Indtast venligst en gyldig URL"),
  type: z.enum(["power-bi", "microsoft-lists", "sharepoint-folder"]).default("power-bi"),
});

interface PowerBIProps {
  onLogout: () => void;
}

export default function PowerBI({ onLogout }: PowerBIProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDashboard, setEditingDashboard] = useState<PowerBIDashboard | null>(null);
  const [viewingDashboard, setViewingDashboard] = useState<PowerBIDashboard | null>(null);
  const [selectedType, setSelectedType] = useState<"power-bi" | "microsoft-lists" | "sharepoint-folder">("power-bi");
  const [showArchived, setShowArchived] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: "archive" | "delete" | null, dashboardId?: string }>({ type: null });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      category: "General",
      type: "power-bi"
    }
  });

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      url: "",
      description: "",
      category: "General",
      type: "power-bi"
    }
  });

  const { data: dashboards = [], isLoading, error } = useQuery<PowerBIDashboard[]>({
    queryKey: ["/api/dashboards"],
    retry: 3,
    staleTime: 30000
  });

  // Get unique categories from existing dashboards
  const uniqueCategories = useMemo(() => {
    const categories = dashboards
      .map(d => d.category)
      .filter(category => category && category.trim() !== "");
    return Array.from(new Set(categories)).sort();
  }, [dashboards]);

  const existingCategories = useMemo(() => {
    const categories = dashboards.map(dashboard => dashboard.category).filter(Boolean);
    return Array.from(new Set(categories)).sort();
  }, [dashboards]);

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

  // Helper function to truncate titles to 30 characters
  const truncateTitle = (title: string, maxLength: number = 30) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength).trim() + "...";
  };

  const filteredAndSortedDashboards = useMemo(() => {
    let filtered = dashboards.filter(dashboard => {
      const matchesSearch = 
        dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dashboard.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (dashboard.description && dashboard.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = categoryFilter === "all" || dashboard.category === categoryFilter;
      const isArchivedStatus = dashboard.isActive === 0;
      const matchesArchivedFilter = showArchived ? isArchivedStatus : !isArchivedStatus;
      
      return matchesSearch && matchesCategory && matchesArchivedFilter;
    });

    if (sortBy === "alphabetical") {
      filtered.sort((a, b) => a.name.localeCompare(b.name, "da"));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return filtered;
  }, [dashboards, searchQuery, categoryFilter, sortBy, showArchived]);

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
    // For SharePoint folders and Microsoft Lists, open in new tab instead of embedding
    if (dashboard.type === "microsoft-lists" || dashboard.type === "sharepoint-folder") {
      window.open(dashboard.url, '_blank');
      return;
    }
    // For Power BI, show embedded view
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

  const handleArchiveDashboard = () => {
    if (editingDashboard) {
      updateDashboardMutation.mutate({
        id: editingDashboard.id,
        data: {
          name: editingDashboard.name,
          url: editingDashboard.url,
          description: editingDashboard.description,
          category: editingDashboard.category,
          type: editingDashboard.type as "power-bi" | "microsoft-lists"
        }
      });
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
                <div className="w-8 h-8 bg-[#9c9387] rounded-lg flex items-center justify-center">
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

        {/* Full screen Power BI embed or Microsoft Lists link */}
        <main className="h-[calc(100vh-100px)]">
          {viewingDashboard.url ? (
            viewingDashboard.type === "microsoft-lists" ? (
              <div className="flex items-center justify-center h-full bg-gray-50 flex-col gap-4">
                <div className="text-center">
                  <p className="text-gray-700 mb-4">Microsoft Lists kræver login i en ny side</p>
                  <Button
                    onClick={() => window.open(viewingDashboard.url, "_blank")}
                    className="bg-[#9c9387] hover:bg-[#8a816d] text-white"
                    data-testid="button-open-lists"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Åbn Microsoft Lists
                  </Button>
                </div>
              </div>
            ) : (
              <iframe
                src={viewingDashboard.url}
                className="w-full h-full border-0"
                allowFullScreen
                title={viewingDashboard.name}
                data-testid="powerbi-iframe-fullscreen"
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <p className="text-gray-500 mb-4">Ingen URL tilgængelig for dette dashboard</p>
                <Button
                  onClick={() => handleEditDashboard(viewingDashboard)}
                  className="bg-[#9c9387] hover:bg-[#8a816d] text-white"
                >
                  Tilføj URL
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Edit Dialog for full screen view */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]" data-testid="edit-dialog">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                Rediger Ressource
              </DialogTitle>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">Type</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="bg-white/50" data-testid="select-fullscreen-edit-type">
                            <SelectValue placeholder="Vælg type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="power-bi">Power BI</SelectItem>
                            <SelectItem value="microsoft-lists">Microsoft Lists</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      <FormLabel className="text-gray-700">{editForm.watch("type") === "microsoft-lists" ? "Microsoft Lists URL" : "Power BI URL"}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={editForm.watch("type") === "microsoft-lists" ? "https://..." : "https://app.powerbi.com/..."} 
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
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Skriv eller vælg kategori..."
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            className="bg-white/50"
                            data-testid="input-edit-category-fullscreen"
                          />
                          {existingCategories.length > 0 && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-gray-100"
                                  type="button"
                                >
                                  <ChevronDown className="h-3 w-3" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                  <CommandList>
                                    <CommandGroup>
                                      {existingCategories.map((category) => (
                                        <CommandItem
                                          key={category}
                                          onSelect={() => field.onChange(category)}
                                          className="cursor-pointer"
                                        >
                                          <Check className={`mr-2 h-4 w-4 ${field.value === category ? 'opacity-100' : 'opacity-0'}`} />
                                          {category}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </FormControl>
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
                      className="bg-[#9c9387] hover:bg-[#8a816d] text-white h-10"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader title="Data" subtitle="Analytiske dashboards og Microsoft Lists" onLogout={onLogout} />
      <Navigation />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        <div className="w-full space-y-6">
          <h2 className="text-2xl font-semibold text-gray-900">Ressourcer</h2>
          
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

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px]" data-testid="select-category-filter">
                  <SelectValue placeholder="Alle kategorier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle kategorier</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-[200px]" data-testid="select-sort">
                  <SelectValue placeholder="Sortering" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">Seneste først</SelectItem>
                  <SelectItem value="alphabetical">Alfabetisk</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={showArchived ? "default" : "outline"}
                onClick={() => setShowArchived(!showArchived)}
                className={showArchived ? "bg-[#9c9387] hover:bg-[#8a816d] text-white" : ""}
                data-testid="button-toggle-archived"
              >
                <Archive className="mr-2 h-4 w-4" />
                {showArchived ? "Arkiverede" : "Aktive"}
              </Button>

              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    className="bg-[#9c9387] hover:bg-[#8a816d] text-white h-10 w-10 p-0"
                    data-testid="button-add-dashboard"
                    disabled={showArchived}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]" data-testid="dialog-add-dashboard">
                <DialogHeader>
                  <DialogTitle>Tilføj ny Ressource</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={(value) => {
                              field.onChange(value);
                              setSelectedType(value as "power-bi" | "microsoft-lists" | "sharepoint-folder");
                            }}>
                              <SelectTrigger data-testid="select-dashboard-type">
                                <SelectValue placeholder="Vælg type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="power-bi">Power BI</SelectItem>
                                <SelectItem value="microsoft-lists">Microsoft Lists</SelectItem>
                                <SelectItem value="sharepoint-folder">SharePoint Mappe</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Navn</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Indtast navn..." 
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
                          <FormLabel>
                            {form.watch("type") === "microsoft-lists" 
                              ? "Microsoft Lists URL" 
                              : form.watch("type") === "sharepoint-folder"
                              ? "SharePoint Mappe URL"
                              : "Power BI URL"}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={form.watch("type") === "microsoft-lists" 
                                ? "https://..." 
                                : form.watch("type") === "sharepoint-folder"
                                ? "https://al2bolig.sharepoint.com/:f:/r/sites/..."
                                : "https://app.powerbi.com/view?r=..."} 
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
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Skriv eller vælg kategori..."
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                data-testid="input-category"
                              />
                              {existingCategories.length > 0 && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-gray-100"
                                      type="button"
                                    >
                                      <ChevronDown className="h-3 w-3" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0" align="start">
                                    <Command>
                                      <CommandList>
                                        <CommandGroup>
                                          {existingCategories.map((category) => (
                                            <CommandItem
                                              key={category}
                                              onSelect={() => field.onChange(category)}
                                              className="cursor-pointer"
                                            >
                                              <Check className={`mr-2 h-4 w-4 ${field.value === category ? 'opacity-100' : 'opacity-0'}`} />
                                              {category}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          </FormControl>
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
                        className="bg-[#9c9387] hover:bg-[#8a816d] text-white h-10"
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
                            Gem Ressource
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* Edit Dashboard Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogContent className="sm:max-w-[600px]" data-testid="edit-dialog">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">
                    Rediger Ressource
                  </DialogTitle>
                </DialogHeader>
                <Form {...editForm}>
                  <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-6">
                    <FormField
                      control={editForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700">Type</FormLabel>
                          <FormControl>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="bg-white/50" data-testid="select-edit-dashboard-type">
                                <SelectValue placeholder="Vælg type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="power-bi">Power BI</SelectItem>
                                <SelectItem value="microsoft-lists">Microsoft Lists</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
                          <FormLabel className="text-gray-700">{editForm.watch("type") === "microsoft-lists" ? "Microsoft Lists URL" : "Power BI URL"}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={editForm.watch("type") === "microsoft-lists" ? "https://..." : "https://app.powerbi.com/..."} 
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
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="Skriv eller vælg kategori..."
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="bg-white/50"
                                data-testid="input-edit-category"
                              />
                              {existingCategories.length > 0 && (
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="absolute right-1 top-1 h-6 w-6 p-0 hover:bg-gray-100"
                                      type="button"
                                    >
                                      <ChevronDown className="h-3 w-3" />
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-full p-0" align="start">
                                    <Command>
                                      <CommandList>
                                        <CommandGroup>
                                          {existingCategories.map((category) => (
                                            <CommandItem
                                              key={category}
                                              onSelect={() => field.onChange(category)}
                                              className="cursor-pointer"
                                            >
                                              <Check className={`mr-2 h-4 w-4 ${field.value === category ? 'opacity-100' : 'opacity-0'}`} />
                                              {category}
                                            </CommandItem>
                                          ))}
                                        </CommandGroup>
                                      </CommandList>
                                    </Command>
                                  </PopoverContent>
                                </Popover>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-between gap-3 pt-4">
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setConfirmAction({ type: "archive", dashboardId: editingDashboard?.id })}
                          className={editingDashboard?.isActive === 0 ? "text-blue-600 border-blue-200 hover:bg-blue-50" : "text-orange-600 border-orange-200 hover:bg-orange-50"}
                          data-testid="button-archive-dashboard"
                        >
                          {editingDashboard?.isActive === 0 ? (
                            <>
                              <ArchiveRestore className="mr-2 h-4 w-4" />
                              Gendan
                            </>
                          ) : (
                            <>
                              <Archive className="mr-2 h-4 w-4" />
                              Arkiver
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setConfirmAction({ type: "delete", dashboardId: editingDashboard?.id })}
                          disabled={deleteDashboardMutation.isPending}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          data-testid="button-delete-dashboard"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deleteDashboardMutation.isPending ? "Sletter..." : "Slet"}
                        </Button>
                      </div>
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
                          className="bg-[#9c9387] hover:bg-[#8a816d] text-white h-10"
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

            <AlertDialog open={confirmAction.type === "archive" || confirmAction.type === "delete"} onOpenChange={() => setConfirmAction({ type: null })}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {confirmAction.type === "delete" ? "Slet ressource?" : editingDashboard?.isActive === 0 ? "Gendan ressource?" : "Arkiver ressource?"}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {confirmAction.type === "delete" 
                      ? "Dette kan ikke fortrydes. Ressourcen slettes permanent."
                      : editingDashboard?.isActive === 0 
                      ? "Ressourcen vil blive gjort aktiv igen og vises på siden."
                      : "Ressourcen vil blive arkiveret og skjult fra hovedsiden."}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="flex gap-3 justify-end">
                  <AlertDialogCancel>Annuller</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={async () => {
                      if (confirmAction.type === "delete" && editingDashboard) {
                        handleDeleteDashboard();
                      } else if (confirmAction.type === "archive" && editingDashboard) {
                        try {
                          await fetch(`/api/dashboards/${editingDashboard.id}/archive`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ isActive: editingDashboard.isActive === 0 ? 1 : 0 })
                          });
                          queryClient.invalidateQueries({ queryKey: ["/api/dashboards"] });
                          toast({
                            title: "Succes!",
                            description: editingDashboard.isActive === 0 ? "Ressource gendannet" : "Ressource arkiveret"
                          });
                          setIsEditDialogOpen(false);
                          setEditingDashboard(null);
                          setConfirmAction({ type: null });
                        } catch (error) {
                          toast({
                            title: "Fejl",
                            description: "Kunne ikke arkivere ressource",
                            variant: "destructive"
                          });
                        }
                      }
                    }}
                    className={confirmAction.type === "delete" ? "bg-red-600 hover:bg-red-700" : "bg-[#9c9387] hover:bg-[#8a816d]"}
                  >
                    {confirmAction.type === "delete" ? "Slet" : editingDashboard?.isActive === 0 ? "Gendan" : "Arkiver"}
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>

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
              Ingen ressourcer endnu
            </h3>
            <p className="text-gray-600 mb-4">
              Tilføj din første ressource for at komme i gang.
            </p>
            <Button 
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-[#9c9387] hover:bg-[#8a816d] text-white"
              data-testid="button-add-first"
            >
              <Plus className="mr-2 h-4 w-4" />
              Tilføj Ressource
            </Button>
          </div>
        ) : (
          <div className="space-y-6" data-testid="dashboard-grid">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Alle Ressourcer ({filteredAndSortedDashboards.length})
              </h2>
              <div className="text-sm text-gray-500">
                Sorteret efter {sortBy === "latest" ? "seneste" : "alfabetisk"}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredAndSortedDashboards.map((dashboard) => (
                <DashboardCard
                  key={dashboard.id}
                  title={truncateTitle(dashboard.name)}
                  showExpand
                  showSettings
                  dashboardUrl={dashboard.url || undefined}
                  type={dashboard.type as "power-bi" | "microsoft-lists" | "sharepoint-folder"}
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
                        className="inline-flex items-center justify-center px-4 py-2 bg-[#9c9387] hover:bg-[#8a816d] text-white rounded-lg hover:shadow-lg transition-all duration-300 font-medium h-10"
                        data-testid={`link-${dashboard.id}`}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {truncateTitle(dashboard.name)}
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
        </div>
      </main>
    </div>
  );
}