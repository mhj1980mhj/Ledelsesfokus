import { Request, Response, Router } from "express";
import { insertPowerBIDashboardSchema } from "@shared/schema";
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

export default router;