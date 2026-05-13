const BASE = "/api/langgraph";

export async function createThread(): Promise<{ id: string; createdAt: string }> {
  const res = await fetch(`${BASE}/threads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error("Failed to create thread");
  const data = await res.json();
  return { id: data.thread_id, createdAt: data.created_at };
}

export async function getThreadState(
  threadId: string,
): Promise<{ messages: { role: string; content: string }[] }> {
  const res = await fetch(`${BASE}/threads/${threadId}/state`);
  if (!res.ok) throw new Error("Failed to get thread state");
  const data = await res.json();
  const messages: { role: string; content: string }[] =
    data.values?.messages?.map((m: { type?: string; content?: string }) => ({
      role: m.type === "human" ? "user" : "assistant",
      content: m.content ?? "",
    })) ?? [];
  return { messages };
}

export async function streamChat(
  threadId: string,
  messages: { role: string; content: string }[],
  signal: AbortSignal,
  onValue: (fullContent: string) => void,
): Promise<void> {
  const res = await fetch(`${BASE}/threads/${threadId}/runs/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
    body: JSON.stringify({
      assistant_id: "base",
      input: { messages },
      stream_mode: ["values"],
    }),
    signal,
  });

  if (!res.ok) throw new Error("Failed to stream chat");
  if (!res.body) throw new Error("No response body");

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      buffer = buffer.replace(/\r\n/g, "\n");
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const lines = event.split("\n");
        let dataLine = "";

        for (const line of lines) {
          if (line.startsWith("event: ") && line.slice(7) !== "values") {
            dataLine = "";
            break;
          }
          if (line.startsWith("data: ")) {
            dataLine = line.slice(6);
          }
        }

        if (!dataLine) continue;

        try {
          const state = JSON.parse(dataLine);
          const msgs: Array<{ type?: string; content?: string }> = state.messages ?? [];
          const last = msgs[msgs.length - 1];
          if (last && last.type === "ai" && last.content) {
            onValue(last.content);
          }
        } catch {
          // skip
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
