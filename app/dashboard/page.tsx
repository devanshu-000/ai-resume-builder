"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { getUserResumes, deleteResume } from "@/services/resumeService";
import Link from "next/link";
import { toast } from "sonner";

type Resume = {
  id: string;
  full_name: string;
  created_at: string;
  resume_content: string;
};

export default function DashboardPage() {
  const { user, isLoaded } = useUser();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadResumes = async () => {
      if (!isLoaded || !user?.id) return;

      try {
        const data = await getUserResumes(user.id);
        setResumes(data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load resumes");
      } finally {
        setLoading(false);
      }
    };

    loadResumes();
  }, [user, isLoaded]);

  const handleDelete = async (id: string) => {
    const confirmDelete = confirm("Are you sure you want to delete this resume?");
    if (!confirmDelete) return;

    try {
      await deleteResume(id);
      setResumes((prev) => prev.filter((r) => r.id !== id));
      toast.success("Resume deleted");
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-indigo-700">
          My Resumes
        </h1>

        <Link
          href="/resume-builder"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          + New Resume
        </Link>
      </div>

      {/* LOADING */}
      {loading && <p className="text-gray-400">Loading...</p>}

      {/* EMPTY STATE */}
      {!loading && resumes.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl mb-4">No resumes yet</p>
          <Link href="/resume-builder" className="text-indigo-600 underline">
            Create your first one
          </Link>
        </div>
      )}

      {/* LIST */}
      <div className="grid gap-4">
        {resumes.map((resume) => (
          <div
            key={resume.id}
            className="border rounded-xl p-5 bg-white shadow-sm flex justify-between items-start"
          >
            <div>
              <h2 className="font-semibold text-lg text-gray-800">
                {resume.full_name}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                {new Date(resume.created_at).toLocaleDateString()}
              </p>

              <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                {resume.resume_content}
              </p>
            </div>

            <button
              onClick={() => handleDelete(resume.id)}
              className="text-red-500 hover:text-red-700 text-sm ml-4"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}