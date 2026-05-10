import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { initializeApp, cert, getApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import firebaseConfig from "./firebase-applet-config.json" assert { type: "json" };
import { startDiscordBot, getBotStatus } from "./src/bot/index.js";

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

  // Standard API Response Helper
  const sendRes = (res: express.Response, data: any, status = 200) => {
    return res.status(status).json({
      success: status < 400,
      data,
      timestamp: new Date().toISOString()
    });
  };

  // API Routes
  app.get("/api/health", (req, res) => {
    sendRes(res, { status: "ok" });
  });

  // Get public config (Developer use)
  app.get("/api/config", (req, res) => {
    sendRes(res, { 
      robloxApiKey: process.env.ROBLOX_API_KEY ? "CONFIGURED" : "NOT_SET",
      environment: process.env.NODE_ENV || "development"
    });
  });

  // Get vehicle data by plate
  app.get("/api/vehicle/:plate", checkApiKey, async (req, res) => {
    try {
      const { plate } = req.params;
      const vehicleDoc = await getDb().collection("vehicles").doc(plate).get();

      if (!vehicleDoc.exists) {
        return sendRes(res, { error: "Vehicle not found" }, 404);
      }

      sendRes(res, vehicleDoc.data());
    } catch (error) {
      console.error("API Error (Vehicle):", error);
      sendRes(res, { error: "Internal server error" }, 500);
    }
  });

  // Request garage door open
  app.post("/api/garage/request", checkApiKey, async (req, res) => {
    try {
      const { plate, driverId, garageOwnerId } = req.body;

      if (!plate || !driverId || !garageOwnerId) {
        return sendRes(res, { error: "Missing required fields" }, 400);
      }

      const vehicleDoc = await getDb().collection("vehicles").doc(plate).get();
      if (!vehicleDoc.exists) {
        return sendRes(res, { error: "Vehicle record not found" }, 404);
      }

      const vehicleData = vehicleDoc.data();

      // Logic: 
      // 1. Driver must be the vehicle owner
      // 2. Driver must be the garage owner (or garageOwnerId must match vehicle owner)
      const isOwner = vehicleData.ownerId === driverId || vehicleData.ownerRobloxId === driverId;
      const isGarageOwner = driverId === garageOwnerId;

      if (isOwner && isGarageOwner) {
        sendRes(res, { 
          allowed: true, 
          message: "Access granted",
          action: "open_door" 
        });
      } else {
        sendRes(res, { 
          allowed: false, 
          message: "Identity mismatch",
          debug: { isOwner, isGarageOwner } 
        }, 403);
      }
    } catch (error) {
      console.error("API Error (Garage):", error);
      sendRes(res, { error: "Internal server error" }, 500);
    }
  });

  // Get user info by Roblox ID
  app.get("/api/user/:robloxId", checkApiKey, async (req, res) => {
    try {
      const { robloxId } = req.params;
      const usersRef = getDb().collection("users");
      const snapshot = await usersRef.where("robloxId", "==", robloxId).limit(1).get();

      if (snapshot.empty) {
        return sendRes(res, { error: "User not found" }, 404);
      }

      const userData = snapshot.docs[0].data();
      sendRes(res, userData);
    } catch (error) {
      console.error("API Error (User):", error);
      sendRes(res, { error: "Internal server error" }, 500);
    }
  });

  // Get Discord Bot Status
  app.get("/api/bot/status", (req, res) => {
    res.json(getBotStatus());
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
