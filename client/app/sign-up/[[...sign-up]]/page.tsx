"use client"

import { useEffect, useState } from "react"
import { SignUp } from "@clerk/nextjs"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { Rocket, Sparkles } from "lucide-react"

export default function SignUpPage() {
  const [selectedRole, setSelectedRole] = useState<"RECRUITER" | "FRESHER" | null>(null)

  // On mount — check if role already saved in localStorage
  useEffect(() => {
    const savedRole = localStorage.getItem("orbithire_role")
    if (savedRole === "RECRUITER" || savedRole === "FRESHER") {
      setSelectedRole(savedRole)
    }
  }, [])

  function handleRoleSelect(role: "RECRUITER" | "FRESHER") {
    setSelectedRole(role)
    localStorage.setItem("orbithire_role", role)
  }

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <DottedGlowBackground />
      </div>

      <div className="relative z-10 flex w-full max-w-7xl flex-col items-center gap-10 px-6 py-12 lg:flex-row lg:items-start lg:justify-between lg:px-12">

        {/* Left — Branding */}
        <div className="flex flex-col space-y-6 text-center lg:text-left">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-8xl">
            Welcome to <br />
            <span className="bg-gradient-to-r from-purple-800 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
              OrbitHire
            </span>
          </h1>
          <p className="max-w-[550px] text-lg font-medium text-zinc-400 md:text-2xl leading-relaxed">
            Streamlining the future of recruitment with
            <span className="text-zinc-200"> precision and speed</span>.
          </p>
          <div className="flex justify-center lg:justify-start">
            <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-950/50 px-3 py-1 text-sm font-medium text-indigo-400 backdrop-blur-md">
              ✨ Now Powered by AI
            </span>
          </div>

          {/* Role Selection Cards */}
          <div className="mt-4 flex flex-col gap-4 sm:flex-row lg:flex-col xl:flex-row">
            <button
              onClick={() => handleRoleSelect("RECRUITER")}
              className={`flex items-center gap-3 rounded-xl border px-6 py-4 font-semibold transition-all ${
                selectedRole === "RECRUITER"
                  ? "border-purple-500 bg-purple-600/20 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]"
                  : "border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:border-purple-500/50 hover:bg-zinc-800"
              }`}
            >
              <Rocket size={20} className={selectedRole === "RECRUITER" ? "text-purple-400" : "text-zinc-400"} />
              <div className="text-left">
                <p className="font-bold">I am Hiring</p>
                <p className="text-xs text-zinc-400">Post jobs, find talent</p>
              </div>
              {selectedRole === "RECRUITER" && (
                <span className="ml-auto text-purple-400">✓</span>
              )}
            </button>

            <button
              onClick={() => handleRoleSelect("FRESHER")}
              className={`flex items-center gap-3 rounded-xl border px-6 py-4 font-semibold transition-all ${
                selectedRole === "FRESHER"
                  ? "border-indigo-500 bg-indigo-600/20 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]"
                  : "border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:border-indigo-500/50 hover:bg-zinc-800"
              }`}
            >
              <Sparkles size={20} className={selectedRole === "FRESHER" ? "text-indigo-400" : "text-zinc-400"} />
              <div className="text-left">
                <p className="font-bold">I am Job Hunting</p>
                <p className="text-xs text-zinc-400">Browse jobs, apply smart</p>
              </div>
              {selectedRole === "FRESHER" && (
                <span className="ml-auto text-indigo-400">✓</span>
              )}
            </button>
          </div>

          {!selectedRole && (
            <p className="text-sm text-zinc-500">
              👆 Select your role above to get started
            </p>
          )}
        </div>

        {/* Right — Clerk SignUp (only shows after role selected) */}
        <div className="flex w-full items-center justify-center lg:w-auto">
          {!selectedRole ? (
            <div className="flex h-[400px] w-[400px] items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-md">
              <p className="text-center text-zinc-500">
                Please select your role <br /> to continue
              </p>
            </div>
          ) : (
            <div className="scale-95 transform transition-all hover:scale-100">
              <SignUp
               forceRedirectUrl="/auth-callback"
                appearance={{
                  elements: {
                    card: "max-w-[400px] shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl",
                    headerTitle: "text-xl font-bold text-white",
                    headerSubtitle: "text-zinc-400 text-sm",
                    dividerText: "text-zinc-500",
                    formFieldLabel: "text-zinc-300",
                    footerActionText: "text-zinc-400",
                    footerActionLink: "text-purple-400 hover:text-purple-300 transition-colors",
                    socialButtonsBlockButton: "rounded-lg border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 transition-all",
                    socialButtonsBlockButtonText: "font-medium",
                    formButtonPrimary: "bg-gradient-to-r from-purple-800 via-indigo-600 to-blue-800 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/20 transition-all duration-300",
                    formFieldInput: "bg-zinc-900 border-zinc-800 text-white focus:ring-1 focus:ring-purple-500 rounded-md",
                  }
                }}
              />
            </div>
          )}
        </div>

      </div>
    </main>
  )
}