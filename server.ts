import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp, cert, getApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };
import { startDiscordBot } from "./src/bot/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Firebase Admin Initialization (Lazy)
  let db: any;
  function getDb() {
    if (!db) {
      if (getApps().length === 0) {
        // In local dev, we might not have applicationDefault credentials
        // but it should work in the AI Studio environment
        initializeApp({
           projectId: firebaseConfig.projectId
        });
      }
      db = getFirestore();
    }
    return db;
  }

  // Middleware to check Roblox API Key
  const checkApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const apiKey = req.headers["x-api-key"] || req.query.apiKey;
    if (process.env.ROBLOX_API_KEY && apiKey !== process.env.ROBLOX_API_KEY) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    next();
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get public config (Developer use)
  app.get("/api/config", (req, res) => {
    res.json({ 
      robloxApiKey: process.env.ROBLOX_API_KEY || "NOT_SET",
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Get vehicle data by plate
  app.get("/api/vehicle/:plate", checkApiKey, async (req, res) => {
    try {
      const { plate } = req.params;
      const vehicleDoc = await getDb().collection("vehicles").doc(plate).get();

      if (!vehicleDoc.exists) {
        return res.status(404).json({ error: "Vehicle not found" });
      }

      res.json(vehicleDoc.data());
    } catch (error) {
      console.error("API Error (Vehicle):", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Request garage door open
  app.post("/api/garage/request", checkApiKey, async (req, res) => {
    try {
      const { plate, driverId, garageOwnerId } = req.body;

      if (!plate || !driverId || !garageOwnerId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const vehicleDoc = await getDb().collection("vehicles").doc(plate).get();
      if (!vehicleDoc.exists) {
        return res.status(404).json({ error: "Vehicle record not found" });
      }

      const vehicleData = vehicleDoc.data();

      // Logic: 
      // 1. Driver must be the vehicle owner
      // 2. Driver must be the garage owner (or garageOwnerId must match vehicle owner)
      const isOwner = vehicleData.ownerId === driverId;
      const isGarageOwner = driverId === garageOwnerId;

      if (isOwner && isGarageOwner) {
        res.json({ 
          allowed: true, 
          message: "Access granted",
          action: "open_door" 
        });
      } else {
        res.json({ 
          allowed: false, 
          message: "Identity mismatch",
          debug: { isOwner, isGarageOwner } 
        });
      }
    } catch (error) {
      console.error("API Error (Garage):", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user info by Roblox ID
  app.get("/api/user/:robloxId", checkApiKey, async (req, res) => {
    try {
      const { robloxId } = req.params;
      const usersRef = getDb().collection("users");
      const snapshot = await usersRef.where("robloxId", "==", robloxId).limit(1).get();

      if (snapshot.empty) {
        return res.status(404).json({ error: "User not found" });
      }

      const userData = snapshot.docs[0].data();
      res.json(userData);
    } catch (error) {
      console.error("API Error (User):", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  // Start Discord Bot if token exists
  startDiscordBot(getDb).catch(err => console.error("Failed to start Discord Bot:", err));
}

startServer();
