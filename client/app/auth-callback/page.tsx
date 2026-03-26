"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"

export default function AuthCallback() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !user) return

    async function syncUser() {
      try {
        const role = localStorage.getItem("orbithire_role")

        const res = await fetch("/api/auth/sync", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        })

        const data = await res.json()

        // Sign in flow — user not in DB
        if (data.error === "USER_NOT_FOUND") {
          setError("No account found. Please sign up first.")
          setTimeout(() => router.push("/sign-up"), 3000)
          return
        }

        // Clear role from localStorage
        localStorage.removeItem("orbithire_role")

        // Redirect based on role
        if (data.role === "RECRUITER") {
          router.push("/dashboard/recruiter")
        } else {
          router.push("/dashboard/fresher")
        }

      } catch (err) {
        console.error(err)
        setError("Something went wrong. Please try again.")
        setTimeout(() => router.push("/sign-in"), 3000)
      }
    }

    syncUser()
  }, [isLoaded, user, router])

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="text-center space-y-4">
          <div className="text-4xl">⚠️</div>
          <p className="text-white font-semibold text-lg">{error}</p>
          <p className="text-zinc-500 text-sm">Redirecting you now...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950">
      <div className="text-center space-y-4">
        <div className="text-5xl">🚀</div>
        <p className="text-zinc-400">Setting up your account...</p>
      </div>
    </main>
  )
}