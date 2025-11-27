import { Request, Response, Router } from "express";
import { insertAreaSchema, insertPowerBIDashboardSchema, insertProjectSchema, insertSegmentSchema } from "@shared/schema";
import { storage } from "./storage";
import { getSharePointSites, getSharePointSite, getSiteDrives, getDriveItems, getSiteLists, getListItems } from "./sharepoint";

const router = Router();

// Area Routes
router.get("/api/areas", async (req: Request, res: Response) => {
  try {
    const areas = await storage.getAllAreas();
    res.json(areas);
  } catch (error) {
    console.error("Error fetching areas:", error);
    res.status(500).json({ error: "Failed to fetch areas" });
  }
});

router.post("/api/areas", async (req: Request, res: Response) => {
  try {
    const validation = insertAreaSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid area data", details: validation.error });
    }
    const area = await storage.createArea(validation.data);
    res.status(201).json(area);
  } catch (error) {
    console.error("Error creating area:", error);
    res.status(500).json({ error: "Failed to create area" });
  }
});

router.put("/api/areas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = insertAreaSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid area data", details: validation.error });
    }
    
    const area = await storage.updateArea(id, validation.data);
    if (!area) {
      return res.status(404).json({ error: "Area not found" });
    }
    res.json(area);
  } catch (error) {
    console.error("Error updating area:", error);
    res.status(500).json({ error: "Failed to update area" });
  }
});

router.delete("/api/areas/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await storage.deleteArea(id);
    if (!result.success) {
      return res.status(404).json({ error: "Area not found" });
    }
    res.json({ success: true, deletedProjectCount: result.deletedProjectCount });
  } catch (error) {
    console.error("Error deleting area:", error);
    res.status(500).json({ error: "Failed to delete area" });
  }
});

// Dashboard Routes
router.get("/api/dashboards", async (req: Request, res: Response) => {
  try {
    const dashboards = await storage.getAllDashboards();
    res.json(dashboards);
  } catch (error) {
    console.error("Error fetching dashboards:", error);
    res.status(500).json({ error: "Failed to fetch dashboards" });
  }
});

router.get("/api/dashboards/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dashboard = await storage.getDashboard(id);
    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    res.json(dashboard);
  } catch (error) {
    console.error("Error fetching dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
});

router.post("/api/dashboards", async (req: Request, res: Response) => {
  try {
    const validation = insertPowerBIDashboardSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid dashboard data", details: validation.error });
    }
    
    const dashboard = await storage.createDashboard(validation.data);
    res.status(201).json(dashboard);
  } catch (error) {
    console.error("Error creating dashboard:", error);
    res.status(500).json({ error: "Failed to create dashboard" });
  }
});

router.put("/api/dashboards/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = insertPowerBIDashboardSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid dashboard data", details: validation.error });
    }
    
    const dashboard = await storage.updateDashboard(id, validation.data);
    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    res.json(dashboard);
  } catch (error) {
    console.error("Error updating dashboard:", error);
    res.status(500).json({ error: "Failed to update dashboard" });
  }
});

router.patch("/api/dashboards/:id/archive", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
    const dashboard = await storage.updateDashboard(id, { isActive } as any);
    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    res.json(dashboard);
  } catch (error) {
    console.error("Error archiving dashboard:", error);
    res.status(500).json({ error: "Failed to archive dashboard" });
  }
});

router.delete("/api/dashboards/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteDashboard(id);
    if (!success) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting dashboard:", error);
    res.status(500).json({ error: "Failed to delete dashboard" });
  }
});

router.delete("/api/dashboards/:id/permanent", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await storage.permanentlyDeleteDashboard(id);
    if (!success) {
      return res.status(404).json({ error: "Dashboard not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error permanently deleting dashboard:", error);
    res.status(500).json({ error: "Failed to permanently delete dashboard" });
  }
});

// Project Routes
router.get("/api/projects", async (req: Request, res: Response) => {
  try {
    const projects = await storage.getAllProjects();
    const projectsWithSegments = await Promise.all(
      projects.map(async (project) => {
        const segments = await storage.getSegmentsByProject(project.id);
        return { ...project, segments };
      })
    );
    res.json(projectsWithSegments);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

router.get("/api/projects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const segments = await storage.getSegmentsByProject(id);
    res.json({ ...project, segments });
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

router.post("/api/projects", async (req: Request, res: Response) => {
  try {
    const validation = insertProjectSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid project data", details: validation.error });
    }
    
    const project = await storage.createProject(validation.data);
    res.status(201).json({ ...project, segments: [] });
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.put("/api/projects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = insertProjectSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid project data", details: validation.error });
    }
    
    const project = await storage.updateProject(id, validation.data);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    const segments = await storage.getSegmentsByProject(id);
    res.json({ ...project, segments });
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/api/projects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteProject(id);
    if (!success) {
      return res.status(404).json({ error: "Project not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

// Segment Routes
router.get("/api/projects/:projectId/segments", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const segments = await storage.getSegmentsByProject(projectId);
    res.json(segments);
  } catch (error) {
    console.error("Error fetching segments:", error);
    res.status(500).json({ error: "Failed to fetch segments" });
  }
});

router.post("/api/projects/:projectId/segments", async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const validation = insertSegmentSchema.safeParse({ ...req.body, projectId });
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid segment data", details: validation.error });
    }
    
    const existingSegments = await storage.getSegmentsByProject(projectId);
    const newStart = validation.data.startMonth;
    const newEnd = validation.data.endMonth;
    
    if (newStart > newEnd) {
      return res.status(400).json({ error: "Start month must be before or equal to end month" });
    }
    
    const hasOverlap = existingSegments.some(seg => {
      const segStart = seg.startMonth;
      const segEnd = seg.endMonth;
      const overlapsStart = newStart <= segEnd && newStart >= segStart;
      const overlapsEnd = newEnd >= segStart && newEnd <= segEnd;
      const contains = newStart <= segStart && newEnd >= segEnd;
      return overlapsStart || overlapsEnd || contains;
    });
    
    if (hasOverlap) {
      return res.status(400).json({ error: "Segmenter kan ikke overlappe samme tidsperiode" });
    }
    
    const segment = await storage.createSegment(validation.data);
    res.status(201).json(segment);
  } catch (error) {
    console.error("Error creating segment:", error);
    res.status(500).json({ error: "Failed to create segment" });
  }
});

router.put("/api/segments/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = insertSegmentSchema.partial().safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid segment data", details: validation.error });
    }
    
    const currentSegment = await storage.getSegment(id);
    if (!currentSegment) {
      return res.status(404).json({ error: "Segment not found" });
    }
    
    if (validation.data.startMonth !== undefined || validation.data.endMonth !== undefined) {
      const projectId = validation.data.projectId || currentSegment.projectId;
      const existingSegments = await storage.getSegmentsByProject(projectId);
      const newStart = validation.data.startMonth ?? currentSegment.startMonth;
      const newEnd = validation.data.endMonth ?? currentSegment.endMonth;
      
      if (newStart > newEnd) {
        return res.status(400).json({ error: "Start month must be before or equal to end month" });
      }
      
      const hasOverlap = existingSegments.some(seg => {
        if (seg.id === id) return false;
        const segStart = seg.startMonth;
        const segEnd = seg.endMonth;
        const overlapsStart = newStart <= segEnd && newStart >= segStart;
        const overlapsEnd = newEnd >= segStart && newEnd <= segEnd;
        const contains = newStart <= segStart && newEnd >= segEnd;
        return overlapsStart || overlapsEnd || contains;
      });
      
      if (hasOverlap) {
        return res.status(400).json({ error: "Segmenter kan ikke overlappe samme tidsperiode" });
      }
    }
    
    const segment = await storage.updateSegment(id, validation.data);
    if (!segment) {
      return res.status(404).json({ error: "Segment not found" });
    }
    res.json(segment);
  } catch (error) {
    console.error("Error updating segment:", error);
    res.status(500).json({ error: "Failed to update segment" });
  }
});

router.delete("/api/segments/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const success = await storage.deleteSegment(id);
    if (!success) {
      return res.status(404).json({ error: "Segment not found" });
    }
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting segment:", error);
    res.status(500).json({ error: "Failed to delete segment" });
  }
});

// SharePoint Routes
router.get("/api/sharepoint/sites", async (req: Request, res: Response) => {
  try {
    const sites = await getSharePointSites();
    res.json(sites);
  } catch (error: any) {
    console.error("Error fetching SharePoint sites:", error);
    res.status(500).json({ error: error.message || "Failed to fetch SharePoint sites" });
  }
});

router.get("/api/sharepoint/sites/:siteId", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const site = await getSharePointSite(siteId);
    res.json(site);
  } catch (error: any) {
    console.error("Error fetching SharePoint site:", error);
    res.status(500).json({ error: error.message || "Failed to fetch SharePoint site" });
  }
});

router.get("/api/sharepoint/sites/:siteId/drives", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const drives = await getSiteDrives(siteId);
    res.json(drives);
  } catch (error: any) {
    console.error("Error fetching site drives:", error);
    res.status(500).json({ error: error.message || "Failed to fetch site drives" });
  }
});

router.get("/api/sharepoint/sites/:siteId/drives/:driveId/items", async (req: Request, res: Response) => {
  try {
    const { siteId, driveId } = req.params;
    const { folderId } = req.query;
    const items = await getDriveItems(siteId, driveId, folderId as string | undefined);
    res.json(items);
  } catch (error: any) {
    console.error("Error fetching drive items:", error);
    res.status(500).json({ error: error.message || "Failed to fetch drive items" });
  }
});

router.get("/api/sharepoint/sites/:siteId/lists", async (req: Request, res: Response) => {
  try {
    const { siteId } = req.params;
    const lists = await getSiteLists(siteId);
    res.json(lists);
  } catch (error: any) {
    console.error("Error fetching site lists:", error);
    res.status(500).json({ error: error.message || "Failed to fetch site lists" });
  }
});

router.get("/api/sharepoint/sites/:siteId/lists/:listId/items", async (req: Request, res: Response) => {
  try {
    const { siteId, listId } = req.params;
    const items = await getListItems(siteId, listId);
    res.json(items);
  } catch (error: any) {
    console.error("Error fetching list items:", error);
    res.status(500).json({ error: error.message || "Failed to fetch list items" });
  }
});

export default router;