import { Router } from "express";
import { settingsService } from "../services";
import { requireAdmin } from "../middleware/auth";
import { createAuditLog } from "../utils/createAuditLog";

const router = Router();

// GET /api/settings - Get all settings (admin only)
router.get("/", requireAdmin, async (req, res) => {
  try {
    const settings = await settingsService.getGrouped();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// GET /api/settings/public - Get public settings (site name, description, etc.)
router.get("/public", async (req, res) => {
  try {
    const all = await settingsService.getAll();
    
    // Only return safe public settings
    res.json({
      siteName: all.siteName,
      siteDescription: all.siteDescription,
      postsPerPage: parseInt(all.postsPerPage),
      maintenanceEnabled: all["maintenance.enabled"] === "true",
      maintenanceMessage: all["maintenance.message"],
      commentsEnabled: all["comments.enabled"] === "true",
    });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// PUT /api/settings - Update settings (admin only)
router.put("/", requireAdmin, async (req, res) => {
  try {
    const settings = req.body;

    if (!settings || typeof settings !== "object") {
      return res.status(400).json({ error: "Invalid settings data" });
    }

    // Get current settings for audit log
    const beforeSettings = await settingsService.getGrouped();

    // Flatten grouped settings
    const flatSettings: Record<string, string> = {};
    
    for (const [group, values] of Object.entries(settings)) {
      if (typeof values === "object" && values !== null) {
        for (const [key, value] of Object.entries(values as Record<string, any>)) {
          if (group === "general") {
            flatSettings[key] = String(value);
          } else {
            flatSettings[`${group}.${key}`] = String(value);
          }
        }
      }
    }

    await settingsService.updateMany(flatSettings);
    
    const updated = await settingsService.getGrouped();

    // Create audit log with before/after comparison
    await createAuditLog(req, "UPDATE", "SETTING", "site_config", {
      before: beforeSettings,
      after: updated,
      metadata: { 
        changedKeys: Object.keys(flatSettings),
        changeCount: Object.keys(flatSettings).length 
      }
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating settings:", error);
    res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;

