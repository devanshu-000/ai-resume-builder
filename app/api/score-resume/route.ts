import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { scoreResume } from "@/lib/gemini"

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { resumeContent } = await req.json()

    if (!resumeContent) {
      return NextResponse.json({ error: "Missing resume content" }, { status: 400 })
    }

    const result = await scoreResume(resumeContent)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Score resume error:", error)
    return NextResponse.json({ error: "Scoring failed" }, { status: 500 })
  }
}