"use client";

import { useEffect, useState } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getUserResumes, deleteResume, ResumeRow } from "@/services/resumeService";
import Link from "next/link";
import { toast } from "sonner";
import ResumeSkeleton from "@/src/components/ui/ResumeSkeleton";

export default function DashboardPage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const [resumes, setResumes] = useState<ResumeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Wait for Clerk to finish initialising
    if (!isLoaded) return;

    // Redirect if not signed in (belt-and-suspenders; middleware handles this too)
    if (!isSignedIn || !user?.id) {
      router.replace("/sign-in");
      return;
    }

    const loadResumes = async () => {
      try {
        const data = await getUserResumes(user.id);
        setResumes(data);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load resumes";
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    loadResumes();
  }, [user, isLoaded, isSignedIn, router]);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resume?")) return;
    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resume deleted");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      toast.error(msg);
    }
  };

  // Show full-screen spinner while Clerk initialises
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center shadow-sm">
        <Link href="/" className="text-xl font-bold text-indigo-700">
          AI Resume Builder
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 hidden sm:block">
            {user?.emailAddresses[0]?.emailAddress}
          </span>
          <button
            onClick={() => signOut({ redirectUrl: "/" })}
            className="border border-red-400 text-red-500 px-4 py-1.5 rounded-lg text-sm hover:bg-red-50 transition"
          >
            Sign Out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-indigo-700">My Resumes</h2>
            {!loading && (
              <p className="text-gray-400 text-sm mt-1">
                {resumes.length} resume{resumes.length !== 1 ? "s" : ""} saved
              </p>
            )}
          </div>
          <Link
            href="/resume-builder"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            + New Resume
          </Link>
        </div>

        {/* Skeleton loader */}
        {loading && <ResumeSkeleton />}

        {/* Empty state */}
        {!loading && resumes.length === 0 && (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">📄</p>
            <p className="text-xl font-medium text-gray-600 mb-2">
              No resumes yet
            </p>
            <p className="text-sm mb-6">
              Create your first AI-powered resume in minutes
            </p>
            <Link
              href="/resume-builder"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg hover:bg-indigo-700 transition"
            >
              Build My Resume
            </Link>
          </div>
        )}

        {/* Resume list */}
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <div
              key={resume.id}
              className="border rounded-xl p-5 bg-white shadow-sm flex justify-between items-start hover:shadow-md transition"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-semibold text-lg text-gray-800">
                    {resume.full_name}
                  </h2>
                  {resume.score != null && resume.score > 0 && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        resume.score >= 80
                          ? "bg-green-100 text-green-700"
                          : resume.score >= 60
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      Score: {resume.score}/100
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(resume.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                  {resume.resume_content}
                </p>
              </div>
              <button
                onClick={() => handleDelete(resume.id)}
                className="text-red-500 hover:text-red-700 text-sm ml-4 shrink-0 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}