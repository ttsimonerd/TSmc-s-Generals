import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

// Serve frontend in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, "..", "dist");

// Basic rate-limiting placeholder (very small, replace with real limiter in prod)
let lastRequestAt = 0;
const MIN_INTERVAL_MS = 200; // adjust as needed

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

app.post("/api/generate", async (req, res) => {
  try {
    const now = Date.now();
    if (now - lastRequestAt < MIN_INTERVAL_MS) {
      return res.status(429).json({ error: "Too many requests" });
    }
    lastRequestAt = now;

    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing or invalid prompt" });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ error: "Server not configured with GEMINI_API_KEY" });
    }

    // Example REST call to a Gemini-like endpoint.
    // Replace URL and payload with the exact API you use in production.
    const apiUrl = "https://api.generativeai.google/v1beta/models/text-bison-001:generate";

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        prompt: { text: prompt },
        // add other model params here if needed
      })
    });

    const contentType = response.headers.get("content-type") || "";
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).send(text);
    }

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return res.json(data);
    } else {
      const text = await response.text();
      return res.send(text);
    }
  } catch (err) {
    console.error("Error in /api/generate:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Serve static frontend in production
app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
