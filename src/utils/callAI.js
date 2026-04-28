// src/utils/callAI.js
export async function callAI(prompt, imageBase64 = null) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  const body = { prompt, imageBase64: imageBase64 || null };

  try {
    const res = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error("AI request failed");
    const data = await res.json();
    return data.content;
  } catch (e) {
    clearTimeout(timeout);
    throw e;
  }
}
