import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, ChevronLeft, ChevronRight, Trash2, X, Calendar as CalendarIcon, GripVertical } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CELL_W = 56;
const FIRST_COL_W = 260;
const ROW_H = 44;

function ymIndex(date = new Date()) {
  const d = new Date(date);
  return d.getFullYear() * 12 + d.getMonth();
}

function ymFromIndex(idx: number) {
  const y = Math.floor(idx / 12);
  const m = idx % 12;
  return { y, m };
}

function ymLabel(idx: number) {
  const { y, m } = ymFromIndex(idx);
  const d = new Date(y, m, 1);
  const month = new Intl.DateTimeFormat("da-DK", { month: "short" }).format(d).toLowerCase().replace('.', '');
  const year = y.toString().slice(-2);
  return `${month} '${year}`;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function clampToGaps(segments: any[], segId: string, start: number, end: number) {
  const others = segments.filter(s => s.id !== segId).sort((a, b) => a.startMonth - b.startMonth);
  let minStart = 0;
  let maxEnd = Infinity;

  for (let i = 0; i < others.length; i++) {
    const s = others[i];
    if (s.endMonth < start) minStart = Math.max(minStart, s.endMonth + 1);
    if (s.startMonth > end) {
      maxEnd = Math.min(maxEnd, s.startMonth - 1);
      break;
    }
  }
  const width = Math.max(0, end - start);
  let sClamped = clamp(start, minStart, Math.max(minStart, maxEnd - width));
  let eClamped = sClamped + width;
  eClamped = Math.min(eClamped, maxEnd);
  if (eClamped < sClamped) eClamped = sClamped;
  return [sClamped, eClamped];
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[80vh] w-[min(720px,92vw)] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {children}
      </div>
    </div>
  );
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b px-5 py-3">
      <div className="flex items-center gap-2 text-lg font-semibold">
        <CalendarIcon className="h-5 w-5 opacity-60" /> {title}
      </div>
      <button onClick={onClose} className="rounded-full p-2 hover:bg-black/5" data-testid="button-close-modal">
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="px-1 text-xs font-medium uppercase tracking-wide text-gray-500">{label}</span>
      {children}
    </label>
  );
}

interface ProjectTimelineProps {
  searchQuery?: string;
  areaFilter?: string;
  ansvarligFilter?: string;
  onProjectCreated?: () => void;
}

export default function ProjectTimeline({ searchQuery = "", areaFilter = "all", ansvarligFilter = "all" }: ProjectTimelineProps) {
  const { toast } = useToast();
  const todayIdx = ymIndex(new Date());
  const [startIdx, setStartIdx] = useState(todayIdx);
  const [visibleMonths] = useState(14);

  const { data: projects = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/projects"],
  });

  const [projectDialog, setProjectDialog] = useState({ open: false, id: null as string | null, name: "", color: "#9c9387", area: "", ansvarlig: "" });
  const [segmentDialog, setSegmentDialog] = useState({ open: false, projectId: null as string | null, id: null as string | null, label: "", start: todayIdx, end: todayIdx, description: "" });
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: null as React.ReactNode | null });
  const [drag, setDrag] = useState(null as any);
  const gridRef = useRef<HTMLDivElement>(null);

  const months = useMemo(() => Array.from({ length: visibleMonths }, (_, i) => startIdx + i), [startIdx, visibleMonths]);
  const totalW = months.length * CELL_W;

  function idxToX(idx: number) {
    return (idx - startIdx) * CELL_W;
  }

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/projects", data),
    onMutate: async (newProject) => {
      await queryClient.cancelQueries({ queryKey: ["/api/projects"] });
      const previousProjects = queryClient.getQueryData(["/api/projects"]);
      const optimisticProject = { id: `temp-${Date.now()}`, ...newProject, segments: [] };
      queryClient.setQueryData(["/api/projects"], (old: any[] = []) => [...old, optimisticProject]);
      return { previousProjects };
    },
    onSuccess: () => {
      setProjectDialog({ ...projectDialog, open: false });
      toast({ title: "Projekt oprettet", description: "Dit projekt er blevet oprettet succesfuldt." });
    },
    onError: (_error, _variables, context: any) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["/api/projects"], context.previousProjects);
      }
      toast({ title: "Fejl", description: "Kunne ikke oprette projekt.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/projects/${id}`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/projects"] });
      const previousProjects = queryClient.getQueryData(["/api/projects"]);
      queryClient.setQueryData(["/api/projects"], (old: any[] = []) =>
        old.map(p => p.id === id ? { ...p, ...data } : p)
      );
      return { previousProjects };
    },
    onSuccess: () => {
      setProjectDialog({ ...projectDialog, open: false });
      toast({ title: "Projekt opdateret", description: "Projektet er blevet opdateret succesfuldt." });
    },
    onError: (_error, _variables, context: any) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["/api/projects"], context.previousProjects);
      }
      toast({ title: "Fejl", description: "Kunne ikke opdatere projekt.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/projects/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["/api/projects"] });
      const previousProjects = queryClient.getQueryData(["/api/projects"]);
      queryClient.setQueryData(["/api/projects"], (old: any[] = []) => old.filter(p => p.id !== id));
      return { previousProjects };
    },
    onSuccess: () => {
      setProjectDialog({ ...projectDialog, open: false });
      toast({ title: "Projekt slettet", description: "Projektet er blevet slettet succesfuldt." });
    },
    onError: (_error, _variables, context: any) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["/api/projects"], context.previousProjects);
      }
      toast({ title: "Fejl", description: "Kunne ikke slette projekt.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const createSegmentMutation = useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
      apiRequest("POST", `/api/projects/${projectId}/segments`, data),
    onMutate: async ({ projectId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/projects"] });
      const previousProjects = queryClient.getQueryData(["/api/projects"]);
      const optimisticSegment = { id: `temp-${Date.now()}`, ...data };
      queryClient.setQueryData(["/api/projects"], (old: any[] = []) =>
        old.map(p => p.id === projectId ? { ...p, segments: [...p.segments, optimisticSegment] } : p)
      );
      return { previousProjects };
    },
    onSuccess: () => {
      setSegmentDialog({ ...segmentDialog, open: false });
      toast({ title: "Segment oprettet", description: "Segmentet er blevet oprettet succesfuldt." });
    },
    onError: (error: any, _variables, context: any) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["/api/projects"], context.previousProjects);
      }
      toast({ title: "Fejl", description: error.message || "Kunne ikke oprette segment.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const updateSegmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => apiRequest("PUT", `/api/segments/${id}`, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/projects"] });
      const previousProjects = queryClient.getQueryData(["/api/projects"]);
      queryClient.setQueryData(["/api/projects"], (old: any[] = []) =>
        old.map(p => ({
          ...p,
          segments: p.segments.map((s: any) => s.id === id ? { ...s, ...data } : s)
        }))
      );
      return { previousProjects };
    },
    onSuccess: () => {
      setSegmentDialog({ ...segmentDialog, open: false });
      toast({ title: "Segment opdateret", description: "Segmentet er blevet opdateret succesfuldt." });
    },
    onError: (error: any, _variables, context: any) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["/api/projects"], context.previousProjects);
      }
      toast({ title: "Fejl", description: error.message || "Kunne ikke opdatere segment.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  const deleteSegmentMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/segments/${id}`),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["/api/projects"] });
      const previousProjects = queryClient.getQueryData(["/api/projects"]);
      queryClient.setQueryData(["/api/projects"], (old: any[] = []) =>
        old.map(p => ({
          ...p,
          segments: p.segments.filter((s: any) => s.id !== id)
        }))
      );
      return { previousProjects };
    },
    onSuccess: () => {
      setSegmentDialog({ ...segmentDialog, open: false });
      toast({ title: "Segment slettet", description: "Segmentet er blevet slettet succesfuldt." });
    },
    onError: (_error, _variables, context: any) => {
      if (context?.previousProjects) {
        queryClient.setQueryData(["/api/projects"], context.previousProjects);
      }
      toast({ title: "Fejl", description: "Kunne ikke slette segment.", variant: "destructive" });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    },
  });

  function openProjectEdit(prj: any) {
    setProjectDialog({ open: true, id: prj.id, name: prj.name, color: prj.color, area: prj.area || "", ansvarlig: prj.ansvarlig || "" });
  }

  function saveProject() {
    if (!projectDialog.name.trim()) return;
    if (!projectDialog.ansvarlig.trim()) {
      toast({ title: "Fejl", description: "Ansvarlig skal udfyldes.", variant: "destructive" });
      return;
    }
    if (projectDialog.ansvarlig.length > 3) {
      toast({ title: "Fejl", description: "Ansvarlig må højst være 3 tegn.", variant: "destructive" });
      return;
    }
    
    const data = {
      name: projectDialog.name,
      color: projectDialog.color,
      area: projectDialog.area || null,
      ansvarlig: projectDialog.ansvarlig,
    };

    if (projectDialog.id) {
      updateProjectMutation.mutate({ id: projectDialog.id, data });
    } else {
      createProjectMutation.mutate(data);
    }
  }

  function deleteProject(id: string) {
    if (window.confirm("Er du sikker på, at du vil slette dette projekt og alle dets segmenter?")) {
      deleteProjectMutation.mutate(id);
    }
  }

  function addProject() {
    setProjectDialog({ open: true, id: null, name: "Nyt projekt", color: "#9c9387", area: "", ansvarlig: "" });
  }

  function openSegmentEdit(prjId: string, seg: any) {
    setSegmentDialog({ 
      open: true, 
      projectId: prjId, 
      id: seg.id, 
      label: seg.label, 
      start: seg.startMonth, 
      end: seg.endMonth, 
      description: seg.description || "" 
    });
  }

  function createSegment(prjId: string, defaults?: any) {
    setSegmentDialog({ 
      open: true, 
      projectId: prjId, 
      id: null, 
      label: defaults?.label ?? "Nyt segment", 
      start: defaults?.start ?? todayIdx, 
      end: defaults?.end ?? todayIdx, 
      description: "" 
    });
  }

  function saveSegment() {
    if (!segmentDialog.label.trim()) return;
    
    const data = {
      projectId: segmentDialog.projectId,
      label: segmentDialog.label,
      startMonth: Math.min(segmentDialog.start, segmentDialog.end),
      endMonth: Math.max(segmentDialog.start, segmentDialog.end),
      description: segmentDialog.description || null,
    };

    if (segmentDialog.id) {
      updateSegmentMutation.mutate({ id: segmentDialog.id, data });
    } else if (segmentDialog.projectId) {
      createSegmentMutation.mutate({ projectId: segmentDialog.projectId, data });
    }
  }

  function deleteSegment(segId: string) {
    if (window.confirm("Er du sikker på, at du vil slette dette segment?")) {
      deleteSegmentMutation.mutate(segId);
    }
  }

  function onSegmentMouseDown(e: React.MouseEvent, prj: any, seg: any, mode: string) {
    e.stopPropagation();
    if (!gridRef.current) return;
    const bounds = gridRef.current.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left - FIRST_COL_W;
    setDrag({ projectId: prj.id, segId: seg.id, mode, startMouseX: mouseX, startSnapshot: seg.startMonth, endSnapshot: seg.endMonth });
    document.body.style.userSelect = "none";
  }

  function onMouseMove(e: MouseEvent) {
    if (!drag || !gridRef.current) return;
    const bounds = gridRef.current.getBoundingClientRect();
    const mouseX = e.clientX - bounds.left - FIRST_COL_W;
    const dx = mouseX - drag.startMouseX;
    const dIdx = Math.round(dx / CELL_W);

    const project = projects.find(p => p.id === drag.projectId);
    if (!project) return;

    const segment = project.segments.find((s: any) => s.id === drag.segId);
    if (!segment) return;

    let start = segment.startMonth;
    let end = segment.endMonth;

    if (drag.mode === "move") {
      start = drag.startSnapshot + dIdx;
      end = drag.endSnapshot + dIdx;
    } else if (drag.mode === "resize-start") {
      start = drag.startSnapshot + dIdx;
      if (start > end) start = end;
    } else if (drag.mode === "resize-end") {
      end = drag.endSnapshot + dIdx;
      if (end < start) end = start;
    }

    [start, end] = clampToGaps(project.segments, segment.id, start, end);

    if (start !== segment.startMonth || end !== segment.endMonth) {
      updateSegmentMutation.mutate({
        id: segment.id,
        data: { startMonth: start, endMonth: end },
      });
    }
  }

  function onMouseUp() {
    if (drag) {
      setDrag(null);
      document.body.style.userSelect = "auto";
    }
  }

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  });

  function showSegTooltip(e: React.MouseEvent, prj: any, seg: any) {
    const content = (
      <div className="max-w-[360px]">
        <div className="mb-1 text-xs uppercase tracking-wide text-gray-500">{prj.name}</div>
        <div className="font-medium">{seg.label}</div>
        <div className="text-xs text-gray-500">{ymLabel(seg.startMonth)} → {ymLabel(seg.endMonth)}</div>
        <div className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap text-sm leading-relaxed">{seg.description || "Ingen beskrivelse"}</div>
      </div>
    );
    setTooltip({ show: true, x: e.clientX + 14, y: e.clientY + 14, content });
  }

  function moveTooltip(e: React.MouseEvent) {
    setTooltip(t => (t.show ? { ...t, x: e.clientX + 14, y: e.clientY + 14 } : t));
  }

  function hideTooltip() {
    setTooltip({ show: false, x: 0, y: 0, content: null });
  }

  const filteredProjects = projects.filter(prj => {
    const matchesSearch = prj.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prj.segments.some((s: any) => s.label.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesArea = areaFilter === "all" || prj.area === areaFilter;
    const matchesAnsvarlig = ansvarligFilter === "all" || prj.ansvarlig === ansvarligFilter;
    return matchesSearch && matchesArea && matchesAnsvarlig;
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 shadow-lg min-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9c9387] mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Indlæser projekter...</p>
          </div>
        </div>
      );
    }

    if (filteredProjects.length === 0 && !searchQuery && areaFilter === "all") {
      return (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-8 border border-gray-200/50 shadow-lg min-h-[500px] flex items-center justify-center">
          <div className="text-center">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Ingen projekter endnu</h3>
            <p className="text-sm text-gray-500 mb-6">Kom i gang ved at oprette dit første projekt</p>
            <button
              onClick={addProject}
              className="bg-[#9c9387] hover:bg-[#8a816d] text-white px-6 py-3 rounded-xl transition shadow-sm"
              data-testid="button-add-first-project"
            >
              <Plus className="inline mr-2 h-4 w-4" />
              Opret projekt
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 shadow-lg overflow-hidden">
        <div className="border-b bg-white/90 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button 
              className="rounded-lg p-2 hover:bg-black/5" 
              onClick={() => setStartIdx(s => s - 1)} 
              title="Forrige måned"
              data-testid="button-prev-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              className="rounded-lg px-3 py-1.5 text-sm hover:bg-black/5" 
              onClick={() => setStartIdx(todayIdx)} 
              title="Gå til i dag"
              data-testid="button-today"
            >
              I dag
            </button>
            <button 
              className="rounded-lg p-2 hover:bg-black/5" 
              onClick={() => setStartIdx(s => s + 1)} 
              title="Næste måned"
              data-testid="button-next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <button
            onClick={addProject}
            className="bg-[#9c9387] hover:bg-[#8a816d] text-white px-4 py-2 rounded-xl text-sm shadow-sm transition"
            data-testid="button-add-project"
          >
            <Plus className="inline mr-2 h-4 w-4" />
            Nyt projekt
          </button>
        </div>

        <div ref={gridRef} className="overflow-x-auto">
          <div className="sticky top-0 z-10 grid" style={{ gridTemplateColumns: `${FIRST_COL_W}px ${totalW}px` }}>
            <div className="border-b bg-white px-4 py-2 text-sm font-medium">Projekter</div>
            <div className="relative border-b bg-white/90">
              <div className="flex">
                {months.map((mIdx) => (
                  <div key={mIdx} className="flex h-full w-[56px] items-center justify-center border-l text-xs text-slate-600 font-medium first:border-l-0 whitespace-nowrap overflow-hidden">
                    {ymLabel(mIdx)}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid" style={{ gridTemplateColumns: `${FIRST_COL_W}px ${totalW}px` }}>
            {filteredProjects.map((prj: any) => (
              <div key={prj.id} className="contents group">
                <div className="relative border-t bg-white px-4 py-2">
                  <div className="flex items-center gap-3">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: prj.color }} />
                    <button
                      className="truncate rounded-lg px-2 py-1 text-left text-sm hover:bg-black/5"
                      onDoubleClick={() => openProjectEdit(prj)}
                      title="Dobbeltklik for at redigere projekt"
                      data-testid={`button-project-${prj.id}`}
                    >
                      {prj.name}
                      <span className="ml-2 text-xs text-gray-400">
                        {prj.area && `(${prj.area})`}
                        {prj.area && prj.ansvarlig && " - "}
                        {prj.ansvarlig && <span className="font-semibold text-gray-600">{prj.ansvarlig}</span>}
                        {!prj.area && prj.ansvarlig && <span className="font-semibold text-gray-600">({prj.ansvarlig})</span>}
                      </span>
                    </button>
                  </div>
                  <button
                    onClick={() => createSegment(prj.id)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 opacity-0 shadow-sm transition hover:scale-105 hover:bg-black/5 group-hover:opacity-100"
                    title="Tilføj segment"
                    data-testid={`button-add-segment-${prj.id}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="relative border-t overflow-hidden">
                  <div className="pointer-events-none absolute inset-0 flex">
                    {months.map((m) => (
                      <div key={m} className="h-full w-[56px] border-l first:border-l-0" />
                    ))}
                  </div>

                  <div className="relative h-[44px]">
                    {prj.segments.map((seg: any) => {
                      const left = idxToX(seg.startMonth);
                      const width = Math.max(0, (seg.endMonth - seg.startMonth + 1) * CELL_W - 8);
                      const inView = left + width > -CELL_W && left < totalW + CELL_W;
                      if (!inView) return null;
                      return (
                        <div
                          key={seg.id}
                          className="group/seg absolute top-1/2 -translate-y-1/2 select-none"
                          style={{ left: left + 4, width }}
                          onMouseMove={moveTooltip}
                          onMouseEnter={(e) => showSegTooltip(e, prj, seg)}
                          onMouseLeave={hideTooltip}
                          onDoubleClick={() => openSegmentEdit(prj.id, seg)}
                          data-testid={`segment-${seg.id}`}
                        >
                          <div
                            className="relative flex items-center overflow-hidden rounded-2xl shadow-sm ring-1 ring-black/5 transition group-hover/seg:shadow-md"
                            style={{ backgroundColor: prj.color }}
                          >
                            <div
                              className="flex-1 truncate px-3 py-2 text-sm/none text-white/90"
                              onMouseDown={(e) => onSegmentMouseDown(e, prj, seg, "move")}
                              title="Træk for at flytte"
                            >
                              <span className="inline-flex items-center gap-2">
                                <GripVertical className="h-3.5 w-3.5 opacity-70" />
                                {seg.label}
                              </span>
                            </div>
                            <button
                              className="absolute -right-2 top-1/2 hidden -translate-y-1/2 rounded-full border bg-white p-1 shadow-sm transition group-hover/seg:block hover:scale-105"
                              onClick={() => createSegment(prj.id, { start: seg.endMonth + 1, end: seg.endMonth + 1 })}
                              title="Nyt segment efter"
                              data-testid={`button-add-segment-after-${seg.id}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                            <div
                              className="absolute left-0 top-0 h-full w-2 cursor-ew-resize"
                              onMouseDown={(e) => onSegmentMouseDown(e, prj, seg, "resize-start")}
                              title="Juster start"
                            />
                            <div
                              className="absolute right-0 top-0 h-full w-2 cursor-ew-resize"
                              onMouseDown={(e) => onSegmentMouseDown(e, prj, seg, "resize-end")}
                              title="Juster slut"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}

      {tooltip.show && (
        <div
          className="pointer-events-none fixed z-[60] max-w-sm rounded-xl border bg-white/95 p-3 text-sm shadow-xl"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          {tooltip.content}
        </div>
      )}

      <Modal open={projectDialog.open} onClose={() => setProjectDialog(p => ({ ...p, open: false }))}>
        <ModalHeader title={projectDialog.id ? "Rediger projekt" : "Nyt projekt"} onClose={() => setProjectDialog(p => ({ ...p, open: false }))} />
        <div className="flex max-h-[70vh] flex-col gap-4 overflow-auto p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Navn">
              <input 
                value={projectDialog.name} 
                onChange={(e) => setProjectDialog({ ...projectDialog, name: e.target.value })} 
                className="w-full rounded-xl border px-3 py-2 outline-none ring-0 focus:border-slate-400" 
                data-testid="input-project-name"
              />
            </Field>
            <Field label="Farve">
              <input 
                type="color" 
                value={projectDialog.color} 
                onChange={(e) => setProjectDialog({ ...projectDialog, color: e.target.value })} 
                className="h-10 w-14 cursor-pointer rounded-xl border bg-white p-1" 
                data-testid="input-project-color"
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Område (valgfrit)">
              <input 
                value={projectDialog.area} 
                onChange={(e) => setProjectDialog({ ...projectDialog, area: e.target.value })} 
                placeholder="F.eks. Sekretariat, Drift, IT" 
                className="w-full rounded-xl border px-3 py-2 outline-none ring-0 focus:border-slate-400" 
                data-testid="input-project-area"
              />
            </Field>
            <Field label="Ansvarlig">
              <input 
                value={projectDialog.ansvarlig} 
                onChange={(e) => setProjectDialog({ ...projectDialog, ansvarlig: e.target.value.toUpperCase() })} 
                placeholder="F.eks. M, MH, MHC" 
                maxLength={3}
                className="w-full rounded-xl border px-3 py-2 outline-none ring-0 focus:border-slate-400 uppercase" 
                data-testid="input-project-ansvarlig"
              />
            </Field>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t px-5 py-3">
          {projectDialog.id && (
            <button 
              onClick={() => projectDialog.id && deleteProject(projectDialog.id)} 
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
              data-testid="button-delete-project"
            >
              <Trash2 className="h-4 w-4" />
              Slet
            </button>
          )}
          {!projectDialog.id && <div />}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setProjectDialog(p => ({ ...p, open: false }))} 
              className="rounded-xl border bg-white px-3 py-2"
              data-testid="button-cancel-project"
            >
              Annuller
            </button>
            <button 
              onClick={saveProject} 
              className="rounded-xl bg-[#9c9387] px-4 py-2 text-white shadow-sm hover:bg-[#8a816d]"
              data-testid="button-save-project"
            >
              Gem
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={segmentDialog.open} onClose={() => setSegmentDialog(s => ({ ...s, open: false }))}>
        <ModalHeader title={segmentDialog.id ? "Rediger segment" : "Nyt segment"} onClose={() => setSegmentDialog(s => ({ ...s, open: false }))} />
        <div className="flex max-h-[72vh] flex-col gap-4 overflow-auto p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Label">
              <input 
                value={segmentDialog.label} 
                onChange={(e) => setSegmentDialog({ ...segmentDialog, label: e.target.value })} 
                className="w-full rounded-xl border px-3 py-2 outline-none ring-0 focus:border-slate-400" 
                data-testid="input-segment-label"
              />
            </Field>
            <Field label="Start måned">
              <input
                type="month"
                value={(() => {
                  const { y, m } = ymFromIndex(segmentDialog.start);
                  const pad = String(m + 1).padStart(2, "0");
                  return `${y}-${pad}`;
                })()}
                onChange={(e) => {
                  const [y, mm] = e.target.value.split("-").map(Number);
                  setSegmentDialog(s => ({ ...s, start: y * 12 + (mm - 1) }));
                }}
                className="w-full rounded-xl border px-3 py-2"
                data-testid="input-segment-start"
              />
            </Field>
            <Field label="Slut måned">
              <input
                type="month"
                value={(() => {
                  const { y, m } = ymFromIndex(segmentDialog.end);
                  const pad = String(m + 1).padStart(2, "0");
                  return `${y}-${pad}`;
                })()}
                onChange={(e) => {
                  const [y, mm] = e.target.value.split("-").map(Number);
                  setSegmentDialog(s => ({ ...s, end: y * 12 + (mm - 1) }));
                }}
                className="w-full rounded-xl border px-3 py-2"
                data-testid="input-segment-end"
              />
            </Field>
          </div>
          <Field label="Beskrivelse">
            <textarea 
              value={segmentDialog.description} 
              onChange={(e) => setSegmentDialog({ ...segmentDialog, description: e.target.value })} 
              className="min-h-[120px] w-full resize-y rounded-xl border px-3 py-2 leading-relaxed" 
              data-testid="textarea-segment-description"
            />
          </Field>
        </div>
        <div className="flex items-center justify-between gap-3 border-t px-5 py-3">
          {segmentDialog.id && (
            <button 
              onClick={() => segmentDialog.id && deleteSegment(segmentDialog.id)} 
              className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-red-600 hover:bg-red-100"
              data-testid="button-delete-segment"
            >
              <Trash2 className="h-4 w-4" />
              Slet
            </button>
          )}
          {!segmentDialog.id && <div />}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setSegmentDialog(s => ({ ...s, open: false }))} 
              className="rounded-xl border bg-white px-3 py-2"
              data-testid="button-cancel-segment"
            >
              Annuller
            </button>
            <button 
              onClick={saveSegment} 
              className="rounded-xl bg-[#9c9387] px-4 py-2 text-white shadow-sm hover:bg-[#8a816d]"
              data-testid="button-save-segment"
            >
              Gem
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
