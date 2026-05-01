"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

import { ResumeFormData } from "@/types/resume";
import ResumePreview from "@/src/components/resume/ResumePreview";
import { saveResume } from "@/services/resumeService";

const schema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(7, "Phone is required"),
  jobTitle: z.string().min(2, "Job title is required"),
  skills: z.string().min(5, "List at least a few skills"),
  education: z.string().min(10, "Add your education details"),
  experience: z.string().min(10, "Add your experience details"),
});

export default function ResumeBuilderPage() {
  const { user, isSignedIn } = useUser();

  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResumeFormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: ResumeFormData) => {
    if (loading) return;

    setLoading(true);
    setGeneratedResume(null);

    try {
      const res = await fetch("/api/generate-resume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      // Better error handling
      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(
          errorData?.error ||
            errorData?.message ||
            "Failed to generate resume"
        );
      }

      const json = await res.json();

      if (!json?.resume) {
        toast.error("Failed to generate resume");
        return;
      }

      setGeneratedResume(json.resume);

      // Save to Supabase
      if (isSignedIn && user?.id) {
        await saveResume(user.id, {
          ...data,
          resumeContent: json.resume,
        });

        toast.success("Resume generated and saved successfully!");
      } else {
        toast.success("Resume generated successfully!");
      }
    } catch (err: any) {
      console.error("Resume generation error:", err);

      toast.error(
        err?.message || "Something went wrong while generating resume"
      );
    } finally {
      setLoading(false);
    }
  };

  const renderError = (key: keyof ResumeFormData) =>
    errors[key]?.message && (
      <p className="text-red-500 text-xs mt-1">
        {errors[key]?.message}
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">
        Build Your AI Resume
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* FORM */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4"
        >
          {[
            { label: "Full Name", key: "fullName" },
            { label: "Email", key: "email" },
            { label: "Phone", key: "phone" },
            { label: "Job Title", key: "jobTitle" },
          ].map(({ label, key }) => (
            <div key={key}>
              <label className="block text-sm font-medium">
                {label}
              </label>

              <input
                {...register(key as keyof ResumeFormData)}
                className="w-full border rounded-lg p-2 mt-1"
              />

              {renderError(key as keyof ResumeFormData)}
            </div>
          ))}

          {["skills", "education", "experience"].map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium capitalize">
                {key}
              </label>

              <textarea
                {...register(key as keyof ResumeFormData)}
                rows={3}
                className="w-full border rounded-lg p-2 mt-1"
              />

              {renderError(key as keyof ResumeFormData)}
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Generating Resume..." : "✨ Generate Resume"}
          </button>
        </form>

        {/* PREVIEW */}
        <div>
          {generatedResume ? (
            <ResumePreview content={generatedResume} />
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed rounded-xl p-8 text-gray-400 text-center">
              Your AI-generated resume will appear here
            </div>
          )}
        </div>
      </div>
    </div>
  );
}