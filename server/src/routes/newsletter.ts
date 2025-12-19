import { Router } from "express";
import { subscriberService } from "../services";
import { requireAdmin } from "../middleware/auth";

const router = Router();

// POST /api/newsletter/subscribe - Subscribe to newsletter (public)
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const result = await subscriberService.subscribe(email);
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error subscribing:", error);
    res.status(500).json({ error: "Failed to subscribe" });
  }
});

// POST /api/newsletter/unsubscribe - Unsubscribe from newsletter (public)
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const result = await subscriberService.unsubscribe(email);
    
    if (result.success) {
      res.json({ message: result.message });
    } else {
      res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error unsubscribing:", error);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
});

// GET /api/newsletter/subscribers - Get all subscribers (admin only)
router.get("/subscribers", requireAdmin, async (req, res) => {
  try {
    const subscribers = await subscriberService.findAll();
    res.json(subscribers);
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ error: "Failed to fetch subscribers" });
  }
});

// GET /api/newsletter/stats - Get subscriber stats (admin only)
router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const stats = await subscriberService.getCount();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching subscriber stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// DELETE /api/newsletter/subscribers/:id - Delete subscriber (admin only)
router.delete("/subscribers/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const subscriber = await subscriberService.delete(id);

    if (!subscriber) {
      return res.status(404).json({ error: "Subscriber not found" });
    }

    res.json({ message: "Subscriber deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    res.status(500).json({ error: "Failed to delete subscriber" });
  }
});

export default router;
