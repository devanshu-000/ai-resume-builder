// lib/gemini.ts
// Uses OpenRouter as the AI provider.

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

// ✅ VERIFIED WORKING FREE MODELS — May 2026
// Source: https://openrouter.ai/models?q=free
//
// Primary (best quality, free, 66K context):
const MODEL = "openrouter/free";
//
// Fallback options if primary goes down — just swap MODEL above:
// "google/gemma-3-27b-it:free"         — Google, 131K context
// "google/gemma-3-12b-it:free"         — Google, 33K context
// "nvidia/nemotron-nano-9b-v2:free"    — NVIDIA, 128K context
// "openrouter/free"                    — Auto-picks any available free model

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

export type ResumeInput = {
  fullName: string;
  email: string;
  phone: string;
  jobTitle: string;
  skills: string;
  education: string;
  experience: string;
};

export async function generateResume(data: ResumeInput): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your .env.local file."
    );
  }

  const prompt = [
    "Create a professional resume for the following person.",
    "Format it cleanly using clear sections and bullet points.",
    "",
    `Name: ${data.fullName}`,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    `Target Job Title: ${data.jobTitle}`,
    `Skills: ${data.skills}`,
    `Education: ${data.education}`,
    `Experience: ${data.experience}`,
    "",
    "Output sections in this order:",
    "1. Professional Summary",
    "2. Work Experience",
    "3. Education",
    "4. Skills",
    "",
    "Use plain text only. Do not use markdown, asterisks, or hashtags.",
    "Use dashes for bullet points. Keep it concise and professional.",
  ].join("\n");

  let response: Response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": "AI Resume Builder",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (networkError) {
    console.error("OpenRouter network error:", networkError);
    throw new Error(
      "Could not reach OpenRouter. Check your internet connection."
    );
  }

  if (!response.ok) {
    let errBody: Record<string, unknown> = {};
    try {
      errBody = await response.json();
    } catch { /* ignore */ }
    console.error("OpenRouter Resume Error:", JSON.stringify(errBody, null, 2));
    const message =
      (errBody?.error as { message?: string })?.message ||
      `OpenRouter returned HTTP ${response.status}`;
    throw new Error(message);
  }

  const json = await response.json();
  const content: string = json?.choices?.[0]?.message?.content ?? "";

  if (!content) {
    throw new Error("OpenRouter returned an empty response. Try again.");
  }

  return content;
}

export async function scoreResume(resumeContent: string): Promise<{
  score: number;
  feedback: string[];
}> {
  if (!OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY is not set. Add it to your .env.local file."
    );
  }

  const prompt = [
    "You are a professional ATS resume reviewer.",
    "",
    "Analyze the resume below and respond with ONLY valid JSON.",
    "Do not include any markdown, code fences, or explanation — pure JSON only.",
    "",
    "Required JSON format:",
    '{ "score": <number 0-100>, "feedback": ["point 1", "point 2", "point 3", "point 4"] }',
    "",
    "Rules:",
    "- score must be an integer between 0 and 100",
    "- feedback must be exactly 4 short, actionable strings",
    "- output nothing except the JSON object",
    "",
    "Resume to analyze:",
    resumeContent,
  ].join("\n");

  let response: Response;
  try {
    response = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": SITE_URL,
        "X-Title": "AI Resume Builder",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.2,
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (networkError) {
    console.error("OpenRouter network error:", networkError);
    throw new Error(
      "Could not reach OpenRouter. Check your internet connection."
    );
  }

  if (!response.ok) {
    let errBody: Record<string, unknown> = {};
    try {
      errBody = await response.json();
    } catch { /* ignore */ }
    console.error("OpenRouter Score Error:", JSON.stringify(errBody, null, 2));
    const message =
      (errBody?.error as { message?: string })?.message ||
      `OpenRouter returned HTTP ${response.status}`;
    throw new Error(message);
  }

  const json = await response.json();
  const raw: string = json?.choices?.[0]?.message?.content ?? "{}";

  try {
    const clean = raw
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    const parsed = JSON.parse(clean) as { score?: unknown; feedback?: unknown };
    return {
      score: typeof parsed.score === "number" ? parsed.score : 0,
      feedback:
        Array.isArray(parsed.feedback) && parsed.feedback.length > 0
          ? (parsed.feedback as string[])
          : ["Could not analyze resume"],
    };
  } catch (parseError) {
    console.error("JSON Parse Error in scoreResume:", parseError, "Raw:", raw);
    return {
      score: 0,
      feedback: ["Could not analyze resume — please try again"],
    };
  }
}