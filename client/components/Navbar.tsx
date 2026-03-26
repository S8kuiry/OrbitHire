"use client"

import Link from "next/link"
import { useUser, SignOutButton } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { POST } from "@/app/api/auth/sync/route"
import { Span } from "next/dist/trace"

export default function Navbar() {
  const { isSignedIn } = useUser()
    const [dashboardUrl, setDashboardUrl] = useState("/auth-callback")

    useEffect(()=>{
      if(!isSignedIn){
        return
      }

      const fetchRole = async()=>{
        try {
          const  res = await fetch('/api/auth/sync',{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({ role: null }),

          })
          const data = await res.json()
           if (data.role === "RECRUITER") {
          setDashboardUrl("/dashboard/recruiter")
        } else if (data.role === "FRESHER") {
          setDashboardUrl("/dashboard/fresher")
        }

        } catch (err) {
                  console.error(err)

          
        }
      }
    })



  return (
    <nav className="relative z-50 flex items-center justify-between px-10 py-6">
      <div className="text-2xl font-bold tracking-tighter text-white">
                      <span className="bg-gradient-to-r from-purple-800 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                        OrbitHire
                        </span>

      </div>
      <div className="flex gap-4 items-center">
        {isSignedIn ? (
          <>
            <Link
              href={`${dashboardUrl}`}
              className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-sm font-medium text-white hover:opacity-90 transition"
            >
              Dashboard →
            </Link>
            <SignOutButton>
              <button className="text-zinc-400 hover:text-white transition text-sm">
                Sign Out
              </button>
            </SignOutButton>
          </>
        ) : (
          <>
            <Link href="/sign-in" className="text-zinc-400 hover:text-white transition">
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-zinc-800 px-5 py-2 text-sm font-medium hover:bg-zinc-700 transition"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}