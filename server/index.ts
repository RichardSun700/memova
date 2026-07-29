import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const server = createServer(app);
  const waitlistApiUrl = new URL(
    "/api/waitlist",
    process.env.WAITLIST_API_ORIGIN || "https://memova.ai"
  );

  app.post(
    "/api/waitlist",
    express.text({ type: "application/json", limit: "16kb" }),
    async (req, res) => {
      try {
        const upstream = await fetch(waitlistApiUrl, {
          method: "POST",
          headers: {
            accept: "application/json",
            "content-type": "application/json",
            "user-agent": req.get("user-agent") || "memova-website",
          },
          body: typeof req.body === "string" ? req.body : "",
          signal: AbortSignal.timeout(10_000),
        });
        const responseBody = await upstream.text();

        res.status(upstream.status);
        res.set(
          "content-type",
          upstream.headers.get("content-type") ||
            "application/json; charset=utf-8"
        );
        res.set("cache-control", "no-store");
        res.send(responseBody);
      } catch {
        res
          .status(502)
          .set("cache-control", "no-store")
          .json({ ok: false, error: "waitlist_unavailable" });
      }
    }
  );

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
