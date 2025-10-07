import { Request, Response, Router } from "express";
import { insertPowerBIDashboardSchema, insertProjectSchema, insertSegmentSchema } from "@shared/schema";
import { storage } from "./storage";

const router = Router();

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

// Project Routes
router.get("/api/projects", async (req: Request, res: Response) => {
  try {
    const projectsList = await storage.getAllProjects();
    res.json(projectsList);
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
    res.json(project);
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
    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

router.put("/api/projects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verificationInitials, ...projectData } = req.body;
    
    const validation = insertProjectSchema.partial().safeParse(projectData);
    if (!validation.success) {
      return res.status(400).json({ error: "Invalid project data", details: validation.error });
    }
    
    const existingProject = await storage.getProject(id);
    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    if (!verificationInitials || verificationInitials.toLowerCase() !== existingProject.creatorInitials.toLowerCase()) {
      return res.status(403).json({ error: "Initials verification failed. You must provide the correct creator initials to edit this project." });
    }
    
    const project = await storage.updateProject(id, validation.data);
    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

router.delete("/api/projects/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { verificationInitials } = req.body;
    
    const existingProject = await storage.getProject(id);
    if (!existingProject) {
      return res.status(404).json({ error: "Project not found" });
    }
    
    if (!verificationInitials || verificationInitials.toLowerCase() !== existingProject.creatorInitials.toLowerCase()) {
      return res.status(403).json({ error: "Initials verification failed. You must provide the correct creator initials to delete this project." });
    }
    
    const success = await storage.deleteProject(id);
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
    const segmentsList = await storage.getSegmentsByProject(projectId);
    res.json(segmentsList);
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

export default router;