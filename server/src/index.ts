import http from "http";
import { config } from "dotenv";
import path from "path";
import { runGeminiTest } from "./gemini";
import { getSupportedCase, runInterrogation } from "./interrogation";
import { toPlayerSafeCase } from "./cases/toPlayerSafeCase";
import { checkContradiction } from "./contradictions";
import {
  discoverContradiction,
  discoverEvidence,
  getInvestigationState,
  markSuspectInterrogated,
  resetInvestigationState,
} from "./investigation";
import { solveCase } from "./solve";
import { testSupabaseConnection } from "./supabase";

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

function mapRouteError(message: string): number {
  if (
    message.includes("zorunludur") ||
    message.includes("Geçersiz JSON") ||
    message.includes("çok uzun") ||
    message.includes("çok büyük")
  ) {
    return 400;
  }
  if (message.includes("desteklenmiyor") || message.includes("bulunamadı")) {
    return 404;
  }
  if (
    message.includes("kotası") ||
    message.includes("quota") ||
    message.includes("429") ||
    message.includes("meşgul")
  ) {
    return 429;
  }
  if (message.includes("GEMINI_API_KEY") || message.includes("API anahtarı")) {
    return 500;
  }
  return 500;
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

  if (req.method === "GET" && pathname === "/api/supabase-test") {
    try {
      const status = await testSupabaseConnection();
      if (!status.configured || !status.connected) {
        sendJson(res, 503, {
          configured: status.configured,
          connected: false,
          error: status.error ?? "Supabase kullanılamıyor.",
        });
        return;
      }
      sendJson(res, 200, { configured: true, connected: true });
    } catch {
      sendJson(res, 503, {
        configured: false,
        connected: false,
        error: "Supabase bağlantı testi başarısız.",
      });
    }
    return;
  }

  if (req.method === "GET" && pathname === "/api/gemini-test") {
    try {
      const text = await runGeminiTest();
      sendJson(res, 200, { text });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected Gemini error.";
      sendJson(res, mapRouteError(message) === 500 && message.includes("GEMINI") ? 500 : 502, {
        error: message,
      });
    }
    return;
  }

  // GET /api/cases/:caseId — oyuncu güvenli (canon yok)
  const caseGetMatch = pathname.match(/^\/api\/cases\/([^/]+)$/);
  if (req.method === "GET" && caseGetMatch) {
    const caseId = decodeURIComponent(caseGetMatch[1] ?? "");
    const caseData = getSupportedCase(caseId);
    if (!caseData) {
      sendJson(res, 404, { error: "Bu vaka henüz desteklenmiyor." });
      return;
    }
    sendJson(res, 200, toPlayerSafeCase(caseData));
    return;
  }

  // GET /api/investigation/:caseId
  const investigationGetMatch = pathname.match(
    /^\/api\/investigation\/([^/]+)$/
  );
  if (req.method === "GET" && investigationGetMatch) {
    try {
      const caseId = decodeURIComponent(investigationGetMatch[1] ?? "");
      const state = getInvestigationState(caseId);
      sendJson(res, 200, state);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Investigation state error.";
      sendJson(res, mapRouteError(message), { error: message });
    }
    return;
  }

  // POST /api/investigation/:caseId/evidence
  const evidenceDiscoverMatch = pathname.match(
    /^\/api\/investigation\/([^/]+)\/evidence$/
  );
  if (req.method === "POST" && evidenceDiscoverMatch) {
    try {
      const caseId = decodeURIComponent(evidenceDiscoverMatch[1] ?? "");
      const body = (await readJsonBody(req)) as { evidenceId?: string };
      const evidenceId = body.evidenceId?.trim() ?? "";
      if (!evidenceId) {
        throw new Error("evidenceId zorunludur.");
      }
      const state = discoverEvidence(caseId, evidenceId);
      sendJson(res, 200, state);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Evidence discover error.";
      sendJson(res, mapRouteError(message), { error: message });
    }
    return;
  }

  // POST /api/investigation/:caseId/reset
  const investigationResetMatch = pathname.match(
    /^\/api\/investigation\/([^/]+)\/reset$/
  );
  if (req.method === "POST" && investigationResetMatch) {
    try {
      const caseId = decodeURIComponent(investigationResetMatch[1] ?? "");
      const state = resetInvestigationState(caseId);
      sendJson(res, 200, state);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Investigation reset error.";
      sendJson(res, mapRouteError(message), { error: message });
    }
    return;
  }

  // POST /api/cases/:caseId/solve
  const solveMatch = pathname.match(/^\/api\/cases\/([^/]+)\/solve$/);
  if (req.method === "POST" && solveMatch) {
    try {
      const caseId = decodeURIComponent(solveMatch[1] ?? "");
      const body = (await readJsonBody(req)) as {
        suspectId?: string;
        motive?: string;
        evidenceIds?: string[];
      };

      const result = solveCase(caseId, {
        suspectId: body.suspectId ?? "",
        motive: body.motive ?? "",
        evidenceIds: body.evidenceIds ?? [],
      });

      sendJson(res, 200, result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected solve error.";
      sendJson(res, mapRouteError(message), { error: message });
    }
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

      // Investigation state yan etkisi — response sözleşmesi değişmez
      markSuspectInterrogated(result.caseId, result.suspectId);
      if (result.evidenceId) {
        discoverEvidence(result.caseId, result.evidenceId);
      }

      sendJson(res, 200, result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected interrogation error.";

      let statusCode = 502;
      if (message.includes("GEMINI_API_KEY") || message.includes("API anahtarı")) {
        statusCode = 500;
      } else if (
        message.includes("kotası") ||
        message.includes("meşgul") ||
        message.includes("429")
      ) {
        statusCode = 429;
      } else if (
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
        throw new Error("Bu vaka henüz desteklenmiyor.");
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

      // Çelişki bulunduysa state'e kaydet (tekrarsız)
      if (result.found && result.contradiction) {
        discoverContradiction(caseId, result.contradiction.id);
        // Delil de keşfedilmiş sayılır
        discoverEvidence(caseId, evidenceId);
      }

      sendJson(res, 200, result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unexpected contradiction error.";
      sendJson(res, mapRouteError(message), { error: message });
    }
    return;
  }

  sendJson(res, 404, { error: "Not found" });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${PORT} (LAN erişimine açık)`);
});
