"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ResumeFormData } from "@/types/resume";
import ResumePreview from "@/src/components/resume/ResumePreview";
import { saveResume } from "@/services/resumeService";

const schema = z.object({
  fullName: z.string().min(2, "Full name is required (min 2 characters)"),
  email: z.string().email("Enter a valid email address"),
  phone: z.string().min(7, "Phone number is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  skills: z.string().min(5, "List at least a few skills"),
  education: z.string().min(10, "Add your education details"),
  experience: z.string().min(10, "Add your work experience"),
});

export default function ResumeBuilderPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResumeFormData>({
    resolver: zodResolver(schema),
  });

  // Wait for Clerk to initialise before rendering
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Redirect unauthenticated users (belt-and-suspenders — middleware also handles this)
  if (!isSignedIn) {
    router.replace("/sign-in");
    return null;
  }

  const onSubmit = async (data: ResumeFormData) => {
    if (loading) return;

    setLoading(true);
    setGeneratedResume(null);

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      // Always parse the body — it always contains JSON (success or error)
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        // Surface the real error from the API response
        const errorMessage =
          json?.error ||
          json?.message ||
          `Server error (HTTP ${res.status}). Please try again.`;
        throw new Error(errorMessage);
      }

      if (!json?.resume) {
        throw new Error("Resume was empty. Please try again.");
      }

      setGeneratedResume(json.resume);

      // Save to Supabase in the background (non-blocking)
      if (user?.id) {
        saveResume(user.id, {
          ...data,
          resumeContent: json.resume,
        })
          .then(() => toast.success("Resume generated and saved!"))
          .catch((saveErr: unknown) => {
            const msg =
              saveErr instanceof Error ? saveErr.message : "Save failed";
            console.error("Save resume error:", msg);
            // Still show success for generation even if save fails
            toast.success("Resume generated!");
            toast.error("Could not save to database: " + msg);
          });
      } else {
        toast.success("Resume generated successfully!");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      console.error("Resume generation error:", message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const renderError = (key: keyof ResumeFormData) =>
    errors[key]?.message ? (
      <p className="text-red-500 text-xs mt-1">{errors[key]?.message}</p>
    ) : null;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-2">
        Build Your AI Resume
      </h1>
      <p className="text-gray-400 text-sm mb-6">
        Fill in your details and let AI craft a professional resume for you.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FORM */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {(
            [
              { label: "Full Name", key: "fullName", type: "input" },
              { label: "Email", key: "email", type: "input" },
              { label: "Phone", key: "phone", type: "input" },
              { label: "Job Title", key: "jobTitle", type: "input" },
            ] as const
          ).map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">
                {label}
              </label>
              <input
                {...register(key)}
                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
              {renderError(key)}
            </div>
          ))}

          {(["skills", "education", "experience"] as const).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700 capitalize">
                {key}
              </label>
              <textarea
                {...register(key)}
                rows={3}
                className="w-full border border-gray-300 rounded-lg p-2.5 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition resize-none"
              />
              {renderError(key)}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating Resume...
              </span>
            ) : (
              "✨ Generate Resume"
            )}
          </button>
        </form>

        {/* PREVIEW */}
        <div>
          {generatedResume ? (
            <ResumePreview content={generatedResume} />
          ) : (
            <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 text-gray-400 text-center min-h-[300px]">
              <p className="text-4xl mb-3">📄</p>
              <p className="font-medium text-gray-500">
                Your AI-generated resume will appear here
              </p>
              <p className="text-sm mt-1">
                Fill in the form and click Generate
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}