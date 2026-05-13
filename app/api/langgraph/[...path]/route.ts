import { NextRequest } from "next/server";

const LANGGRAPH_HOST = process.env.LANGGRAPH_HOST ?? "localhost";
const LANGGRAPH_PORT = process.env.LANGGRAPH_PORT ?? "8123";
const BASE = `http://${LANGGRAPH_HOST}:${LANGGRAPH_PORT}`;

async function handler(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = `${BASE}/${path.join("/")}`;

  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    // strip hop-by-hop headers that shouldn't be forwarded
    if (["host", "connection", "keep-alive", "transfer-encoding"].includes(key)) return;
    headers[key] = value;
  });

  const res = await fetch(target, {
    method: request.method,
    headers,
    body: request.method !== "GET" && request.method !== "HEAD" ? await request.blob() : undefined,
  });

  // forward SSE streaming for the runs/stream endpoint
  const responseHeaders: Record<string, string> = {
    "content-type": res.headers.get("content-type") ?? "",
  };

  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers: responseHeaders,
  });
}

export const GET = handler;
export const POST = handler;
