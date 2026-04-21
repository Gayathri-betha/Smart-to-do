// Client-side AI helper that calls Google Gemini directly.
// In production you should move this to a Supabase Edge Function (see /supabase/functions/ai-assist).
// For local dev / quick demos we allow a public Gemini key via VITE_GEMINI_API_KEY.

import type { Priority } from "./supabase";

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL = "gemini-2.0-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export const isAiConfigured = Boolean(GEMINI_KEY);

async function callGemini(prompt: string, jsonMode = true): Promise<string> {
  if (!GEMINI_KEY) throw new Error("VITE_GEMINI_API_KEY is not set. Add it to .env.local");

  const res = await fetch(`${ENDPOINT}?key=${GEMINI_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: jsonMode
        ? { responseMimeType: "application/json", temperature: 0.4 }
        : { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gemini error ${res.status}: ${text}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Empty response from Gemini");
  return text;
}

/* ------------------------- 1. Natural Language Parsing ------------------------- */
export interface ParsedTask {
  title: string;
  due_date: string | null; // ISO string
  priority: Priority;
}

export async function parseNaturalLanguage(input: string): Promise<ParsedTask> {
  const today = new Date().toISOString();
  const prompt = `You are a task-parsing assistant. The current datetime is ${today}.
Parse the following user input into a single task object with fields:
- title: short, action-oriented (max 80 chars)
- due_date: ISO 8601 datetime string, or null if no time/date mentioned
- priority: "low" | "medium" | "high" (infer from urgency words like "urgent", "asap", or near deadlines)

Input: "${input}"

Return ONLY valid JSON: {"title": "...", "due_date": "...", "priority": "..."}`;

  const raw = await callGemini(prompt, true);
  const parsed = JSON.parse(raw);
  return {
    title: parsed.title || input,
    due_date: parsed.due_date || null,
    priority: (parsed.priority as Priority) || "medium",
  };
}

/* ------------------------- 2. AI Task Breakdown ------------------------- */
export async function breakdownTask(goal: string): Promise<string[]> {
  const prompt = `Break this goal into 3-6 concrete, actionable subtasks. Each subtask should be a short imperative sentence (max 70 chars).

Goal: "${goal}"

Return ONLY valid JSON: {"subtasks": ["...", "..."]}`;

  const raw = await callGemini(prompt, true);
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed.subtasks) ? parsed.subtasks : [];
}

/* ------------------------- 3. Smart Priority Suggestion ------------------------- */
export async function suggestPriority(
  title: string,
  dueDate: string | null
): Promise<Priority> {
  const today = new Date().toISOString();
  const prompt = `Given a task and its due date, suggest priority.
Today: ${today}
Task: "${title}"
Due: ${dueDate || "none"}

Rules:
- "high" if due within 24h or contains urgent keywords (interview, exam, deadline, urgent)
- "medium" if due within a week
- "low" otherwise

Return ONLY valid JSON: {"priority": "high|medium|low"}`;

  const raw = await callGemini(prompt, true);
  const parsed = JSON.parse(raw);
  return (parsed.priority as Priority) || "medium";
}