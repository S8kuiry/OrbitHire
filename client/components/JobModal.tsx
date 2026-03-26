"use client"

import { X, BriefcaseBusinessIcon, IndianRupee, Briefcase, Clock, Upload, CheckCircle, AlertCircle } from "lucide-react"
import { useState } from "react"

type Job = {
  id: string
  title: string
  description: string
  requirements: string
  category: string
  salaryRange: string
  createdAt: string
  recruiter: { name: string | null; avatar: string | null }
  _count: { applications: number }
}

interface JobModalProps {
  job: Job
  onClose: () => void
}

const categoryColors: Record<string, string> = {
  SOFTWARE: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  MARKETING: "text-pink-400 bg-pink-400/10 border-pink-400/20",
  DESIGN: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  DATA_AI: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  FINANCE: "text-green-400 bg-green-400/10 border-green-400/20",
  HR: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  OTHER: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
}

export default function JobModal({ job, onClose }: JobModalProps) {
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [orbitScore, setOrbitScore] = useState<number | null>(null)


  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    return `${days} days ago`
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB")
      return
    }
    setError(null)
    setCvFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (file.type !== "application/pdf") {
      setError("Only PDF files are allowed")
      return
    }
    setError(null)
    setCvFile(file)
  }

  async function handleApply() {
    if (!cvFile) {
      setError("Please upload your CV first")
      return
    }
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("cv", cvFile)
      formData.append("jobId", job.id)

      const res = await fetch("/api/applications/apply", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Something went wrong")
        return
      }
      setOrbitScore(data.orbitScore)

      setSubmitted(true)




    } catch (err) {
      setError("Failed to submit application. Try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className=" fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      // onClick={onClose}
      />

      {/* Modal */}
      <div className=" relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center ring-1 ring-purple-500/20">
              <BriefcaseBusinessIcon size={16} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{job.title}</h2>
              <p className="text-xs text-zinc-500">{job.recruiter.name ?? "Anonymous"}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Meta info */}
          <div className="flex flex-wrap gap-3">
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${categoryColors[job.category] ?? categoryColors.OTHER}`}>
              {job.category.replace("_", " ")}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
              <IndianRupee size={11} /> {job.salaryRange}
            </span>
            <span className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
              <Briefcase size={11} /> {job._count.applications} applicants
            </span>
            <span className="flex items-center gap-1 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400">
              <Clock size={11} /> {timeAgo(job.createdAt)}
            </span>
          </div>

          {/* Description */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-300">About the Role</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-zinc-300">Requirements</h3>
            <div className="flex flex-wrap gap-2">
              {job.requirements.split(",").map((req, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-zinc-400"
                >
                  {req.trim()}
                </span>
              ))}
            </div>
          </div>

          {/* CV Upload or Success */}

          {submitted ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 py-10 text-center">
              <CheckCircle size={40} className="text-green-400" />
              <p className="text-lg font-bold text-white">Application Submitted!</p>

              {/* Show Orbit Score */}
              {orbitScore !== null && (
                <div className="space-y-2 w-full px-4">
                  <p className="text-xs text-zinc-400">Your Orbit Score™</p>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-zinc-800">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all"
                        style={{ width: `${orbitScore}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold text-purple-400">{orbitScore}%</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    {orbitScore >= 70
                      ? "🔥 Strong match! You have a great chance."
                      : orbitScore >= 50
                        ? "👍 Decent match. Consider improving your CV."
                        : "💡 Low match. This role might need more experience."}
                  </p>
                </div>
              )}

              <p className="text-sm text-zinc-400">
                We'll notify you when the recruiter reviews your application.
              </p>
              <button
                onClick={onClose}
                className="mt-2 rounded-xl border border-zinc-700 px-6 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
              >
                Back to Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-zinc-300">Upload Your CV</h3>

              {/* Drag and drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 transition-all ${dragOver
                  ? "border-purple-500 bg-purple-500/10"
                  : cvFile
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-zinc-700 bg-zinc-900/30 hover:border-zinc-600"
                  }`}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                {cvFile ? (
                  <>
                    <CheckCircle size={28} className="text-green-400" />
                    <p className="text-sm font-medium text-white">{cvFile.name}</p>
                    <p className="text-xs text-zinc-500">
                      {(cvFile.size / 1024 / 1024).toFixed(2)} MB — Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={28} className="text-zinc-500" />
                    <p className="text-sm font-medium text-white">
                      Drag & drop your CV here
                    </p>
                    <p className="text-xs text-zinc-500">or click to browse — PDF only, max 5MB</p>
                  </>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-500/30 bg-red-500/10 py-10">
                  <AlertCircle size={40} className="text-red-400" />
                  <p className="text-lg font-bold text-white">Application Not Submitted!</p>
                  <p className="text-sm text-zinc-400">{error}</p>
                  <button
                    onClick={onClose}
                    className="mt-2 rounded-xl bg-zinc-800 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition"
                  >
                    Close
                  </button>
                </div>
              )}

              {/* Submit button */}
            { !error && (<button
                onClick={handleApply}
                disabled={!cvFile || uploading}
                className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition-all hover:opacity-80 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {uploading ? "Submitting..." : "Submit Application →"}
              </button>
            )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
