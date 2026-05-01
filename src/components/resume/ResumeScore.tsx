"use client"

import { useState } from "react"
import { toast } from "sonner"

interface Props {
  resumeContent: string
}

export default function ResumeScore({ resumeContent }: Props) {
  const [score, setScore] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleScore = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/score-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeContent }),
      })

      if (!res.ok) throw new Error("Scoring failed")

      const data = await res.json()
      setScore(data.score)
      setFeedback(data.feedback)
    } catch {
      toast.error("Failed to score resume")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-green-600"
    if (s >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getBarColor = (s: number) => {
    if (s >= 80) return "bg-green-500"
    if (s >= 60) return "bg-yellow-400"
    return "bg-red-500"
  }

  const getLabel = (s: number) => {
    if (s >= 80) return "Excellent"
    if (s >= 60) return "Good"
    if (s >= 40) return "Needs Work"
    return "Poor"
  }

  return (
    <div className="mt-4 border rounded-xl p-4 bg-white shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-700">⚡ Resume Score</h3>
        <button
          onClick={handleScore}
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>

      {score !== null && (
        <>
          {/* Score display */}
          <div className="mb-4">
            <div className="flex justify-between items-end mb-2">
              <span className="text-sm text-gray-500">Overall Score</span>
              <div className="text-right">
                <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                  {score}
                </span>
                <span className="text-gray-400 text-sm">/100</span>
                <p className={`text-xs font-medium ${getScoreColor(score)}`}>
                  {getLabel(score)}
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-700 ${getBarColor(score)}`}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>

          {/* Feedback points */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Feedback
            </p>
            {feedback.map((point, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2"
              >
                <span className="text-indigo-500 mt-0.5 shrink-0">→</span>
                {point}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}