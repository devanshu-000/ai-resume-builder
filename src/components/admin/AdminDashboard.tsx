"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

type Resume = {
  id: string
  user_id: string
  full_name: string
  created_at: string
  resume_content: string
  score?: number
}

type User = {
  id: string
  email: string
  name: string
  created_at: string
}

export default function AdminDashboard() {
  const [tab, setTab] = useState<"resumes" | "users">("resumes")
  const [resumes, setResumes] = useState<Resume[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [rRes, uRes] = await Promise.all([
          fetch("/api/admin/resumes"),
          fetch("/api/admin/users"),
        ])
        const resumeData = await rRes.json()
        const userData = await uRes.json()
        setResumes(Array.isArray(resumeData) ? resumeData : [])
        setUsers(Array.isArray(userData) ? userData : [])
      } catch {
        toast.error("Failed to load admin data")
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleDeleteResume = async (id: string) => {
    if (!confirm("Delete this resume permanently?")) return
    try {
      const res = await fetch("/api/admin/resumes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error()
      setResumes((prev) => prev.filter((r) => r.id !== id))
      toast.success("Resume deleted")
    } catch {
      toast.error("Delete failed")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b px-6 py-4 shadow-sm flex justify-between items-center">
        <h1 className="text-xl font-bold text-indigo-700">🛡 Admin Panel</h1>
        <div className="flex gap-2">
          {(["resumes", "users"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition ${
                tab === t
                  ? "bg-indigo-600 text-white"
                  : "border text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">

        {loading && (
          <div className="grid gap-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white border rounded-xl p-5 h-24" />
            ))}
          </div>
        )}

        {/* RESUMES TAB */}
        {!loading && tab === "resumes" && (
          <>
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              All Resumes
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({resumes.length} total)
              </span>
            </h2>

            {resumes.length === 0 && (
              <p className="text-gray-400 text-center py-20">No resumes found</p>
            )}

            <div className="grid gap-4">
              {resumes.map((r) => (
                <div
                  key={r.id}
                  className="bg-white border rounded-xl p-5 shadow-sm flex justify-between items-start hover:shadow-md transition"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <p className="font-semibold text-gray-800">{r.full_name}</p>
                      {r.score && r.score > 0 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          r.score >= 80
                            ? "bg-green-100 text-green-700"
                            : r.score >= 60
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                        }`}>
                          Score: {r.score}/100
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      User ID: {r.user_id}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(r.created_at).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "numeric"
                      })}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                      {r.resume_content}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteResume(r.id)}
                    className="text-red-500 hover:text-red-700 text-sm ml-4 shrink-0 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {/* USERS TAB */}
        {!loading && tab === "users" && (
          <>
            <h2 className="text-lg font-bold text-gray-700 mb-4">
              All Users
              <span className="ml-2 text-sm font-normal text-gray-400">
                ({users.length} total)
              </span>
            </h2>

            {users.length === 0 && (
              <p className="text-gray-400 text-center py-20">
                No users in database yet.
                <br />
                <span className="text-xs mt-1 block">
                  Users are saved when they sign up via Clerk webhook.
                </span>
              </p>
            )}

            <div className="grid gap-4">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <p className="font-semibold text-gray-800">
                    {u.name || "No name set"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{u.email}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Joined: {new Date(u.created_at).toLocaleDateString("en-US", {
                      year: "numeric", month: "long", day: "numeric"
                    })}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}