import http from "http";
import { config } from "dotenv";
import path from "path";
import { runGeminiTest } from "./gemini";
import { case001 } from "./cases/case001";
import { getSupportedCase, runInterrogation } from "./interrogation";
import { checkContradiction } from "./contradictions";

config({ path: path.resolve(__dirname, "../.env") });

const PORT = Number(process.env.PORT) || 3000;

function setCorsHeaders(res: http.ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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
  if (raw.length > 1 && raw.endsWith("/")) {
    return raw.slice(0, -1);
  }
  return raw;
}

function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
      if (Buffer.concat(chunks).length > 1_000_000) {
        reject(new Error("İstek gövdesi çok büyük."));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8").trim();
        if (!raw) {
          resolve({});
          return;
        }
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error("Geçersiz JSON gövdesi."));
      }
    });
    req.on("error", reject);
  });
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

  if (req.method === "POST" && pathname === "/api/interrogation") {
    try {
      const body = (await readJsonBody(req)) as {
        caseId?: string;
        suspectId?: string;
        playerQuestion?: string;
        evidenceId?: string;
      };

      const result = await runInterrogation({
        caseId: body.caseId ?? "",
        suspectId: body.suspectId ?? "",
        playerQuestion: body.playerQuestion,
        evidenceId: body.evidenceId,
      });

      sendJson(res, 200, result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected interrogation error.";

      let statusCode = 502;
      if (message.includes("GEMINI_API_KEY")) statusCode = 500;
      else if (
        message.includes("zorunludur") ||
        message.includes("Geçersiz JSON") ||
        message.includes("çok uzun") ||
        message.includes("çok büyük")
      ) {
        statusCode = 400;
      } else if (
        message.includes("desteklenmiyor") ||
        message.includes("bulunamadı")
      ) {
        statusCode = 404;
      }

      sendJson(res, statusCode, { error: message });
    }
    return;
  }

  if (req.method === "POST" && pathname === "/api/contradiction/check") {
    try {
      const body = (await readJsonBody(req)) as {
        caseId?: string;
        suspectId?: string;
        evidenceId?: string;
      };

      const caseId = body.caseId?.trim() ?? "";
      const suspectId = body.suspectId?.trim() ?? "";
      const evidenceId = body.evidenceId?.trim() ?? "";

      if (!caseId || !suspectId || !evidenceId) {
        throw new Error("caseId, suspectId ve evidenceId zorunludur.");
      }

      const caseData = getSupportedCase(caseId);
      if (!caseData) {
        throw new Error("Bu vaka henüz desteklenmiyor. Şimdilik yalnızca case-001.");
      }

      const suspectExists = caseData.suspects.some((s) => s.id === suspectId);
      if (!suspectExists) {
        throw new Error("Şüpheli bu vakada bulunamadı.");
      }

      const evidenceExists = caseData.evidence.some((e) => e.id === evidenceId);
      if (!evidenceExists) {
        throw new Error("Delil bu vakada bulunamadı.");
      }

      const result = checkContradiction(caseId, suspectId, evidenceId);
      sendJson(res, 200, result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected contradiction error.";

      let statusCode = 500;
      if (
        message.includes("zorunludur") ||
        message.includes("Geçersiz JSON") ||
        message.includes("çok büyük")
      ) {
        statusCode = 400;
      } else if (
        message.includes("desteklenmiyor") ||
        message.includes("bulunamadı")
      ) {
        statusCode = 404;
      }

      sendJson(res, statusCode, { error: message });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
