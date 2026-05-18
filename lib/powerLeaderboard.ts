import { getAllMarkets } from "@/data/markets";
import type { Market, MarketFactor, MarketSource } from "@/data/types";

type LeaderboardApiResponse = {
  ok?: boolean;
  items?: unknown[];
};

type AnyRecord = Record<string, unknown>;

const FIELD = {
  id: ["id", "marketId", "market_id", "slug", "market_slug", "condition_id", "token_id"],
  name: ["name", "title", "question", "market", "market_name", "market_question", "event_title", "description"],
  category: ["category", "topic", "vertical", "market_category", "asset_class", "source"],
  expiry: ["expiry", "expires", "expiration", "expires_at", "endDate", "end_date", "close_time", "clob_end_date", "deadline"],
  price: ["price", "price_cents", "yes_price", "market_price", "current_price", "probability", "probability_cents", "last", "last_price", "midpoint"],
  bid: ["bid", "best_bid", "yes_bid", "bid_price"],
  ask: ["ask", "best_ask", "yes_ask", "ask_price"],
  aiConf: ["aiConf", "ai_conf", "ai_confidence", "confidence", "model_confidence", "ai_probability", "model_probability", "power_probability", "polybot_probability", "fair_value", "target_probability", "estimated_probability"],
  reason: ["aiReason", "ai_reason", "reason", "rationale", "thesis", "summary", "explanation", "edge_reason", "signal"],
  side: ["side", "recommended_side", "recommendation", "best_side", "best_outcome", "trade_side", "best_trade", "direction", "action"],
  sparkline: ["sparkline", "prices", "price_history", "history"],
  volume: ["volume", "liquidity", "open_interest", "bid_size"],
};

function fallbackMarkets(): Market[] {
  return getAllMarkets();
}

function isRecord(value: unknown): value is AnyRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function firstValue(item: AnyRecord, keys: string[]): unknown {
  const scopes = [item, item.market, item.signal, item.leaderboard_response]
    .filter(isRecord);

  for (const scope of scopes) {
    for (const key of keys) {
      const value = scope[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
  }

  return undefined;
}

function readString(item: AnyRecord, keys: string[], fallback: string): string {
  const value = firstValue(item, keys);
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return fallback;
}

function numberFromValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.replace(/,/g, "").match(/-?\d+(\.\d+)?/);
    if (!match) return null;
    const parsed = Number(match[0]);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function centsFromValue(value: unknown): number | null {
  const parsed = numberFromValue(value);
  if (parsed === null) return null;
  const cents = parsed > 0 && parsed <= 1 ? parsed * 100 : parsed;
  return Math.max(1, Math.min(99, Math.round(cents)));
}

function readCents(item: AnyRecord, keys: string[], fallback: number): number {
  return centsFromValue(firstValue(item, keys)) ?? fallback;
}

function readSize(item: AnyRecord): string {
  const value = numberFromValue(firstValue(item, FIELD.volume));
  if (value === null) return "Live";
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(Math.round(value));
}

function readExpiry(item: AnyRecord): { text: string; urgent: boolean } {
  const raw = firstValue(item, FIELD.expiry);
  if (raw instanceof Date) {
    return formatExpiryDate(raw);
  }

  if (typeof raw === "number") {
    return formatExpiryDate(new Date(raw > 10000000000 ? raw : raw * 1000));
  }

  if (typeof raw === "string" && raw.trim()) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) return formatExpiryDate(parsed);
    return { text: raw.trim(), urgent: /hour|minute|\b[0-9]+h\b/i.test(raw) };
  }

  return { text: "Live market", urgent: false };
}

function formatExpiryDate(date: Date): { text: string; urgent: boolean } {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffHours = Math.max(0, Math.round(diffMs / 3600000));
  const urgent = diffMs > 0 && diffMs <= 24 * 3600000;
  const dateText = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  if (diffMs <= 0) return { text: `${dateText} · closing`, urgent: true };
  if (diffHours < 24) return { text: `${dateText} · ${diffHours || 1} hours`, urgent: true };

  const days = Math.round(diffHours / 24);
  return { text: `${dateText} · ${days} days`, urgent };
}

function inferEdgeDir(item: AnyRecord, price: number, aiConf: number): "yes" | "no" {
  const side = String(firstValue(item, FIELD.side) ?? "").toLowerCase();
  if (/\bno\b|sell|short|negative/.test(side)) return "no";
  if (/\byes\b|buy|long|positive/.test(side)) return "yes";
  return aiConf >= price ? "yes" : "no";
}

function confidenceLevel(aiConf: number): Market["aiConfLevel"] {
  if (aiConf >= 70) return "high";
  if (aiConf < 45) return "low";
  return "med";
}

function readSeries(item: AnyRecord, price: number, aiConf: number): number[] {
  const raw = firstValue(item, FIELD.sparkline);
  const values = Array.isArray(raw)
    ? raw.map(centsFromValue).filter((value): value is number => value !== null)
    : [];

  if (values.length >= 4) return values.slice(-14);

  const start = Math.max(1, Math.min(99, price - 8));
  const mid = Math.max(1, Math.min(99, Math.round((price + aiConf) / 2)));
  return [start, start + 2, start - 1, mid - 2, mid, price - 1, price, aiConf - 2, aiConf, price]
    .map(value => Math.max(1, Math.min(99, Math.round(value))));
}

function normalizeFactor(value: unknown): MarketFactor | null {
  if (typeof value === "string" && value.trim()) {
    return { text: value.trim(), signal: "neu" };
  }

  if (!isRecord(value)) return null;

  const text = readString(value, ["text", "label", "name", "reason", "description"], "");
  if (!text) return null;

  const rawSignal = String(firstValue(value, ["signal", "sentiment", "direction"]) ?? "").toLowerCase();
  const signal: MarketFactor["signal"] =
    rawSignal.startsWith("pos") || rawSignal === "bullish" || rawSignal === "support" ? "pos" :
    rawSignal.startsWith("neg") || rawSignal === "bearish" || rawSignal === "against" ? "neg" :
    "neu";

  return { text, signal };
}

function readFactors(item: AnyRecord, edgeDir: "yes" | "no"): MarketFactor[] {
  const raw = firstValue(item, ["factors", "drivers", "reasons"]);
  const factors = Array.isArray(raw)
    ? raw.map(normalizeFactor).filter((factor): factor is MarketFactor => factor !== null)
    : [];

  if (factors.length > 0) return factors.slice(0, 6);

  return [
    { text: "Live leaderboard signal", signal: edgeDir === "yes" ? "pos" : "neg" },
    { text: "Mapped from Power Leaderboard data", signal: "neu" },
  ];
}

function normalizeSource(value: unknown): MarketSource | null {
  if (!isRecord(value)) return null;

  const headline = readString(value, ["headline", "title", "name"], "");
  if (!headline) return null;

  return {
    pub: readString(value, ["pub", "publisher", "source", "site"], "Source"),
    date: readString(value, ["date", "published_at", "time"], "Live"),
    headline,
    snippet: readString(value, ["snippet", "summary", "description"], ""),
    tag: "neutral",
  };
}

function readSources(item: AnyRecord): MarketSource[] | undefined {
  const raw = firstValue(item, ["sources", "news", "articles"]);
  if (!Array.isArray(raw)) return undefined;

  const sources = raw.map(normalizeSource).filter((source): source is MarketSource => source !== null);
  return sources.length > 0 ? sources.slice(0, 5) : undefined;
}

function normalizeMarket(item: unknown, index: number): Market | null {
  if (!isRecord(item)) return null;

  const price = readCents(item, FIELD.price, 50);
  const aiConf = readCents(item, FIELD.aiConf, price);
  const bid = readCents(item, FIELD.bid, Math.max(1, price - 1));
  const ask = readCents(item, FIELD.ask, Math.min(99, price + 1));
  const edgeDir = inferEdgeDir(item, price, aiConf);
  const expiry = readExpiry(item);
  const chart = readSeries(item, price, aiConf);

  return {
    id: readString(item, FIELD.id, `live-${index + 1}`),
    name: readString(item, FIELD.name, `Live market ${index + 1}`),
    category: readString(item, FIELD.category, "Live"),
    expiry: expiry.text,
    expiryUrgent: expiry.urgent,
    price,
    side: "YES",
    aiConf,
    aiConfLevel: confidenceLevel(aiConf),
    edgeDir,
    sparkline: chart.slice(-10),
    bid,
    bidSize: readSize(item),
    ask,
    askSize: readSize(item),
    last: price,
    chart,
    aiReason: readString(item, FIELD.reason, "Live leaderboard signal mapped from scanner output."),
    factors: readFactors(item, edgeDir),
    sources: readSources(item),
  };
}

export async function fetchPowerLeaderboardMarkets(): Promise<Market[]> {
  try {
    const response = await fetch("/api/leaderboard", { cache: "no-store" });
    if (!response.ok) return fallbackMarkets();

    const envelope = await response.json() as LeaderboardApiResponse;
    if (!envelope.ok || !Array.isArray(envelope.items) || envelope.items.length === 0) {
      return fallbackMarkets();
    }

    const markets = envelope.items
      .map(normalizeMarket)
      .filter((market): market is Market => market !== null);

    return markets.length > 0 ? markets : fallbackMarkets();
  } catch {
    return fallbackMarkets();
  }
}
