"use client"

import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { SignIn } from "@clerk/nextjs"
import Link from "next/link"

export default function SignInPage() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background">
      <div className="absolute inset-0 z-0">
        <DottedGlowBackground />
      </div>

      <div className="container relative z-10 flex h-full max-w-7xl flex-col items-center justify-between gap-12 px-6 lg:flex-row lg:px-12">
        {/* Left — Branding */}
        <div className="flex flex-col space-y-6 text-center lg:text-left">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl md:text-8xl">
            Welcome back to <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-purple-800 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                OrbitHire
              </span>
            </span>
          </h1>

          <p className="max-w-[550px] text-lg font-medium text-zinc-400 md:text-2xl leading-relaxed">
            Your next great hire — or your next great job —
            <span className="text-zinc-200"> is one login away</span>.
          </p>

          <div className="flex justify-center lg:justify-start">
            <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-950/50 px-3 py-1 text-sm font-medium text-indigo-400 backdrop-blur-md">
              ✨ Now Powered by AI
            </span>
          </div>
        </div>

        {/* Right — Clerk SignIn */}
        <div className="flex flex-col w-full items-center justify-center lg:w-auto">
          
          <div className="scale-95 transform transition-all hover:scale-100">
            <SignIn
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

 <p className="mt-4 text-sm text-zinc-600">
            Dont have an account?{" "}
            <Link href="/sign-up" className="text-purple-400 hover:text-purple-300 transition">
              Sign Up
            </Link>
          </p>        </div>
      </div>
    </main>
  )
}