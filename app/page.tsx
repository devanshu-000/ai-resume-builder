"use client";

import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

export default function LandingPage() {
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <h1 className="text-5xl font-bold text-indigo-700 mb-4 text-center">
        AI Resume Builder
      </h1>

      <p className="text-lg text-gray-500 mb-8 text-center max-w-md">
        Generate a professional, ATS-ready resume in seconds using the power of AI.
      </p>

      {!isLoaded ? (
        // Show spinner while Clerk loads
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      ) : isSignedIn ? (
        <Link
          href="/dashboard"
          className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
        >
          Go to Dashboard →
        </Link>
      ) : (
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/sign-up"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
          >
            Get Started — It&apos;s Free
          </Link>
          <Link
            href="/sign-in"
            className="border border-indigo-600 text-indigo-600 px-8 py-3 rounded-lg hover:bg-indigo-50 transition font-medium"
          >
            Sign In
          </Link>
        </div>
      )}
    </main>
  );
}