import { supabase } from "@/lib/supabase";

/**
 * Save resume to database
 */
export async function saveResume(
  userId: string,
  data: {
    fullName: string;
    skills: string;
    education: string;
    experience: string;
    resumeContent: string;
  }
) {
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
    console.error("Save resume error:", error);
    throw new Error("Failed to save resume");
  }
}

/**
 * Get all resumes for a user
 */
export async function getUserResumes(userId: string) {
  const { data, error } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch resumes error:", error);
    throw new Error("Failed to fetch resumes");
  }

  return data || [];
}

/**
 * Delete a resume
 */
export async function deleteResume(id: string) {
  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete resume error:", error);
    throw new Error("Failed to delete resume");
  }
}