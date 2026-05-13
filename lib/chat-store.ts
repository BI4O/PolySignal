const KEY = "chat_threads";

export interface ThreadInfo {
  id: string;
  createdAt: string;
}

export function getThreads(): ThreadInfo[] {
  const raw = localStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    // handle legacy string[] format
    if (parsed.length > 0 && typeof parsed[0] === "string") {
      return parsed.map((id: string) => ({ id, createdAt: "" }));
    }
    return parsed;
  } catch {
    return [];
  }
}

export function addThread(info: ThreadInfo): void {
  const threads = getThreads();
  threads.push(info);
  localStorage.setItem(KEY, JSON.stringify(threads));
}
