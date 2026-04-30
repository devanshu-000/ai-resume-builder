import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <h1 className="text-5xl font-bold text-indigo-700 mb-4 text-center">
        AI Resume Builder
      </h1>
      <p className="text-lg text-gray-500 mb-8 text-center max-w-md">
        Generate a professional resume in seconds using the power of Gemini AI.
      </p>

      <SignedOut>
        <div className="flex gap-4">
          <Link href="/sign-up" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
            Get Started
          </Link>
          <Link href="/sign-in" className="border border-indigo-600 text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition">
            Sign In
          </Link>
        </div>
      </SignedOut>

      <SignedIn>
        <Link href="/dashboard" className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
          Go to Dashboard
        </Link>
      </SignedIn>
    </main>
  )
}