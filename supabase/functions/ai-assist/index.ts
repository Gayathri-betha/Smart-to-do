// Optional Supabase Edge Function for AI features.
// Deploy with: `supabase functions deploy ai-assist --no-verify-jwt`
// Add secret:  `supabase secrets set GEMINI_API_KEY=your-key`
//
// This is the secure production alternative to calling Gemini from the browser.
// To use it, replace calls in src/lib/ai.ts with `supabase.functions.invoke('ai-assist', { body: { ... } })`.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MODEL = "gemini-2.0-flash";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

interface RequestBody {
  action: "parse" | "breakdown" | "priority";
  input: string;
  due_date?: string | null;
}

function buildPrompt(body: RequestBody): string {
  const today = new Date().toISOString();
  switch (body.action) {
    case "parse":
      return `You are a task-parsing assistant. Current datetime: ${today}.
Parse the input into a single task. Return ONLY JSON: {"title": "...", "due_date": "ISO 8601 or null", "priority": "low|medium|high"}.
Input: "${body.input}"`;
    case "breakdown":
      return `Break this goal into 3-6 actionable subtasks (each <70 chars, imperative).
Return ONLY JSON: {"subtasks": ["...", "..."]}.
Goal: "${body.input}"`;
    case "priority":
      return `Today: ${today}. Suggest priority for task "${body.input}" due ${body.due_date || "none"}.
Rules: high if <24h or urgent keywords; medium if <1 week; low otherwise.
Return ONLY JSON: {"priority": "low|medium|high"}.`;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("GEMINI_API_KEY");
    if (!apiKey) throw new Error("GEMINI_API_KEY not configured");

    const body = (await req.json()) as RequestBody;
    if (!body.action || !body.input) throw new Error("Missing action or input");

    const prompt = buildPrompt(body);
    const res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.4 },
      }),
    });

    if (!res.ok) {
      const t = await res.text();
      return new Response(JSON.stringify({ error: t }), {
        status: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    return new Response(text, {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});