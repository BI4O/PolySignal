type LeaderboardEnvelope = {
  ok: boolean;
  source: "live" | "mock";
  error?: string;
  items: unknown[];
};

function mockEnvelope(error: string): LeaderboardEnvelope {
  return { ok: false, source: "mock", error, items: [] };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) throw new Error("Unsupported leaderboard response shape");

  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.signals)) return payload.signals;
  if (Array.isArray(payload.markets)) return payload.markets;
  if (payload.leaderboard_response !== undefined) return extractItems(payload.leaderboard_response);

  throw new Error("Unsupported leaderboard response shape");
}

export async function GET() {
  const url = process.env.POWER_LEADERBOARD_URL ?? process.env.NEXT_PUBLIC_POWER_LEADERBOARD_URL;

  if (!url) {
    return Response.json(mockEnvelope("POWER_LEADERBOARD_URL not configured"));
  }

  try {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Leaderboard request failed with status ${response.status}`);
    }

    const payload = await response.json();
    const items = extractItems(payload);

    return Response.json({ ok: true, source: "live", items });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch leaderboard";
    return Response.json(mockEnvelope(message));
  }
}
