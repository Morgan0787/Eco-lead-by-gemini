import express from "express";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { Groq } from "groq-sdk";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Groq client initialization
  const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "Eco-Lead API is running" });
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const completion = await groq.chat.completions.create({
        messages: [{ role: "user", content: message }],
        model: "llama3-8b-8192",
      });
      res.json({ response: completion.choices[0]?.message?.content });
    } catch (error) {
      console.error("Groq API error:", error);
      res.status(500).json({ error: "Failed to communicate with Groq" });
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
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
