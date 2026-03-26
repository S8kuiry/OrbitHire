"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Rocket, Sparkles } from "lucide-react"

export default function RoleModal() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function selectRole(role: string) {
    setLoading(true)
    const res = await fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    })
    const data = await res.json()
    if (data.role) router.refresh()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
        
        <div className="mb-2 text-4xl">👋</div>
        <h2 className="mb-2 text-2xl font-bold text-white">Welcome to OrbitHire!</h2>
        <p className="mb-8 text-zinc-400">What brings you here today?</p>

        <div className="flex flex-col gap-4">
          <button
            onClick={() => selectRole("RECRUITER")}
            disabled={loading}
            className="flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(147,51,234,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Rocket size={20} />
            I am Hiring — Post Jobs
          </button>

          <button
            onClick={() => selectRole("FRESHER")}
            disabled={loading}
            className="flex items-center justify-center gap-3 rounded-xl border border-zinc-700 bg-zinc-800/50 px-8 py-4 font-semibold text-zinc-300 transition-all hover:border-purple-500/50 hover:bg-zinc-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles size={20} />
            I am Looking for a Job
          </button>
        </div>

        {loading && (
          <p className="mt-4 text-sm text-zinc-500">Setting up your account...</p>
        )}
      </div>
    </div>
  )
}