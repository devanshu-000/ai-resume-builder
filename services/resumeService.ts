import { supabase } from "@/lib/supabase";

export type SaveResumeInput = {
  fullName: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  skills: string;
  education: string;
  experience: string;
  resumeContent: string;
};

export type ResumeRow = {
  id: string;
  user_id: string;
  full_name: string;
  skills: string;
  education: string;
  experience: string;
  resume_content: string;
  template_type: string;
  score?: number;
  created_at: string;
};

/**
 * Save a new resume record to Supabase.
 * Throws a descriptive Error on failure.
 */
export async function saveResume(
  userId: string,
  data: SaveResumeInput
): Promise<void> {
  const { error } = await supabase.from("resumes").insert({
    user_id: userId,
    full_name: data.fullName,
    skills: data.skills,
    education: data.education,
    experience: data.experience,
    resume_content: data.resumeContent,
    template_type: "default",
  });

  if (error) {
    console.error("[saveResume] Supabase error:", error);
    throw new Error(`Failed to save resume: ${error.message}`);
  }
}

/**
 * Fetch all resumes for a given Clerk user ID.
 * Returns an empty array if none found.
 */
export async function getUserResumes(userId: string): Promise<ResumeRow[]> {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[getUserResumes] Supabase error:", error);
    throw new Error(`Failed to fetch resumes: ${error.message}`);
  }

  return (data as ResumeRow[]) ?? [];
}

/**
 * Delete a resume by its ID.
 * Throws a descriptive Error on failure.
 */
export async function deleteResume(id: string): Promise<void> {
  const { error } = await supabase.from("resumes").delete().eq("id", id);

  if (error) {
    console.error("[deleteResume] Supabase error:", error);
    throw new Error(`Failed to delete resume: ${error.message}`);
  }
}