import http from "http";
import { config } from "dotenv";
import path from "path";
import { runGeminiTest } from "./gemini";
import { case001 } from "./cases/case001";

config({ path: path.resolve(__dirname, "../.env") });

const PORT = Number(process.env.PORT) || 3000;

function setCorsHeaders(res: http.ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(
  res: http.ServerResponse,
  statusCode: number,
  body: unknown
) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function getPathname(url: string | undefined): string {
  if (!url) return "/";
  const raw = url.split("?")[0] ?? "/";
  // Browsers may request /api/gemini-test/ — normalize trailing slash
  if (raw.length > 1 && raw.endsWith("/")) {
    return raw.slice(0, -1);
  }
  return raw;
}

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const pathname = getPathname(req.url);

  if (req.method === "GET" && pathname === "/health") {
    sendJson(res, 200, { status: "ok" });
    return;
  }

  if (req.method === "GET" && pathname === "/api/gemini-test") {
    try {
      const text = await runGeminiTest();
      sendJson(res, 200, { text });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected Gemini error.";

      const statusCode = message.includes("GEMINI_API_KEY") ? 500 : 502;
      sendJson(res, statusCode, { error: message });
    }
    return;
  }

  if (req.method === "GET" && pathname === "/api/cases/case-001") {
    sendJson(res, 200, case001);
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
