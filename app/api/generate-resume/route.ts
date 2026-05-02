import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { generateResume, ResumeInput } from "@/lib/gemini";

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: ResumeInput;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  try {
    const resume = await generateResume(body);
    return NextResponse.json({ resume }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[generate-resume] Error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
