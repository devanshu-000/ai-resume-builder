import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="max-w-4xl text-center space-y-6">
        <h1 className="text-5xl font-bold text-gray-900">
          AI Resume Builder
        </h1>

        <p className="text-lg text-gray-600">
          Create professional, ATS-friendly resumes instantly using AI.
          Build, customize, and download your perfect resume with ease.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/sign-up"
            className="px-8 py-4 rounded-xl bg-black text-white font-medium hover:opacity-90 transition"
          >
            Get Started
          </Link>

          <Link
            href="/dashboard"
            className="px-8 py-4 rounded-xl border border-gray-300 font-medium hover:bg-gray-100 transition"
          >
            View Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}