import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { generateResume } from "@/lib/gemini"

export async function POST(req: Request) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()

    if (!body) {
      return NextResponse.json({ error: "Missing input data" }, { status: 400 })
    }

    const resume = await generateResume(body)
    return NextResponse.json({ resume })

  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Resume generation error:", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}