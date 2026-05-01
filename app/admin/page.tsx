"use client"

import { useState } from "react"
import AdminDashboard from "@/src/components/admin/AdminDashboard"

export default function AdminPage() {
  const [password, setPassword] = useState("")
  const [authed, setAuthed] = useState(false)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!password) return
    setLoading(true)
    setError(false)

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        setAuthed(true)
      } else {
        setError(true)
      }
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (authed) return <AdminDashboard />

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🔐</p>
          <h1 className="text-2xl font-bold text-indigo-700">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">Enter your password to continue</p>
        </div>

        <input
          type="password"
          placeholder="Admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="w-full border rounded-lg p-3 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />

        {error && (
          <p className="text-red-500 text-sm mb-3">❌ Incorrect password. Try again.</p>
        )}

        <button
          onClick={handleLogin}
          disabled={loading || !password}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? "Checking..." : "Login"}
        </button>
      </div>
    </div>
  )
}