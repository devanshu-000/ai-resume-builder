// lib/gemini.ts

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

// Better free model for stable output
const MODEL = "deepseek/deepseek-chat:free"

type ResumeInput = {
  fullName: string
  email: string
  phone: string
  jobTitle: string
  skills: string
  education: string
  experience: string
}

export async function generateResume(
  data: ResumeInput
): Promise<string> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing from .env.local")
  }

  const prompt = [
    "Create a professional resume for the following person.",
    "Format it cleanly using clear sections and bullet points.",
    "",
    "Name: " + data.fullName,
    "Email: " + data.email,
    "Phone: " + data.phone,
    "Target Job Title: " + data.jobTitle,
    "Skills: " + data.skills,
    "Education: " + data.education,
    "Experience: " + data.experience,
    "",
    "Output sections:",
    "1. Professional Summary",
    "2. Experience",
    "3. Education",
    "4. Skills",
    "",
    "Use plain text only.",
    "Do not use markdown.",
  ].join("\n")

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "AI Resume Builder",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.4,
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json()

    console.error(
      "OpenRouter Resume Error:",
      JSON.stringify(err, null, 2)
    )

    throw new Error(
      err?.error?.message ||
      `OpenRouter failed with status ${response.status}`
    )
  }

  const json = await response.json()

  return (
    json?.choices?.[0]?.message?.content ||
    "Could not generate resume."
  )
}

export async function scoreResume(
  resumeContent: string
): Promise<{
  score: number
  feedback: string[]
}> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY is missing from .env.local")
  }

  const prompt = [
    "You are a professional ATS resume reviewer.",
    "",
    "Analyze this resume and return:",
    "1. Score out of 100",
    "2. Exactly 4 short feedback points",
    "",
    "Resume:",
    resumeContent,
    "",
    "Return ONLY valid JSON.",
    "No markdown.",
    "No explanation.",
    "",
    "Example:",
    "{",
    '  "score": 82,',
    '  "feedback": [',
    '    "Strong action verbs used",',
    '    "Add more measurable achievements",',
    '    "Skills section is clear",',
    '    "Include LinkedIn profile link"',
    "  ]",
    "}",
  ].join("\n")

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "AI Resume Builder",
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0.2,
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json()

    console.error(
      "OpenRouter Score Error:",
      JSON.stringify(err, null, 2)
    )

    throw new Error(
      err?.error?.message ||
      `OpenRouter failed with status ${response.status}`
    )
  }

  const json = await response.json()

  const raw =
    json?.choices?.[0]?.message?.content || "{}"

  try {
    const clean = raw
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim()

    const parsed = JSON.parse(clean)

    return {
      score: parsed.score || 0,
      feedback: parsed.feedback || [
        "Could not analyze resume",
      ],
    }
  } catch (error) {
    console.error("JSON Parse Error:", error)

    return {
      score: 0,
      feedback: ["Could not analyze resume"],
    }
  }
}