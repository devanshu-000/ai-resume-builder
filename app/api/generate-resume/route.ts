import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateResume } from "@/lib/gemini";

export async function POST(req: Request) {
  const { userId } = await auth();

  // 1. Auth check (:contentReference[oaicite:0]{index=0})
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // 2. Read request body
    const body = await req.json();

    if (!body) {
      return NextResponse.json(
        { error: "Missing input data" },
        { status: 400 }
      );
    }

    // 3. Generate resume using Gemini AI
    const resume = await generateResume(body);

    // 4. Return generated resume
    return NextResponse.json({ resume });
  } catch (error) {
    console.error("Resume generation error:", error);

    return NextResponse.json(
      { error: "Failed to generate resume" },
      { status: 500 }
    );
  }
}