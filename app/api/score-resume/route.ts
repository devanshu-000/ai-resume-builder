import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { scoreResume } from "@/lib/gemini";

export async function POST(req: Request) {
  // 1. Authenticate with Clerk
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized. Please sign in." },
      { status: 401 }
    );
  }

  // 2. Parse request body
  let body: { resumeContent?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body." },
      { status: 400 }
    );
  }

  // 3. Validate resumeContent
  if (
    !body.resumeContent ||
    typeof body.resumeContent !== "string" ||
    !body.resumeContent.trim()
  ) {
    return NextResponse.json(
      { error: "Missing or empty resumeContent field." },
      { status: 400 }
    );
  }

  // 4. Score the resume via OpenRouter
  try {
    const result = await scoreResume(body.resumeContent);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred";

    console.error("[score-resume] Error:", message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}