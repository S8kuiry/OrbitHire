"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Briefcase, Users, Plus, Trash2, Eye,
  ArrowRightSquare, Loader2,
  PlusCircle
} from "lucide-react"
import JobPostModal from "./JobPostModal"

type Job = {
  id: string
  title: string
  description: string
  category: string
  salaryRange: string
  isActive: boolean
  createdAt: Date
  _count: { applications: number }
}

type Props = {
  recruiterName: string
  initialJobs: Job[]
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

const timeAgo = (date: Date) => {
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return "Today"
  if (days === 1) return "Yesterday"
  return `${days} days ago`
}

export default function RecruiterDashboardClient({ recruiterName, initialJobs }: Props) {
  const [jobs, setJobs] = useState<Job[]>(initialJobs)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()
  const [openModal,setOpenModal] = useState(false)

  const totalApplications = jobs.reduce((sum, job) => sum + job._count.applications, 0)
  const activeJobs = jobs.filter(j => j.isActive).length

  async function handleDelete(jobId: string) {
    if (!confirm("Are you sure you want to delete this job?")) return
    setDeletingId(jobId)

    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "POST" })
      if (res.ok) {
        setJobs(prev => prev.filter(j => j.id !== jobId))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="p-6 text-white space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="ml-12 md:ml-0 lg:ml-0 sm:ml-12 ">
          <h1 className="text-2xl  font-bold">Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            Welcome back, {recruiterName.split(" ")[0]} 👋
          </p>
        </div>
        <span
        onClick={()=>setOpenModal(true)}
          className="cursor-pointer flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600/70 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90       u"
        >
          <PlusCircle size={16} />
          Post a Job
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Jobs Posted"
          value={jobs.length}
          icon={<Briefcase size={20} className="text-purple-400" />}
          color="purple"
        />
        <StatCard
          label="Active Jobs"
          value={activeJobs}
          icon={<Briefcase size={20} className="text-green-400" />}
          color="green"
        />
        <StatCard
          label="Total Applicants"
          value={totalApplications}
          icon={<Users size={20} className="text-indigo-400" />}
          color="indigo"
        />
      </div>

      {/* Jobs list */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Posted Jobs</h2>

        {jobs.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-center gap-3">
            <Briefcase size={40} className="text-zinc-600" />
            <p className="text-zinc-400 font-medium">No jobs posted yet</p>
            <span
            onClick={()=>setOpenModal(true)}
              className="cursor-pointer flex items-center gap-2 rounded-lg border border-purple-500/30 bg-purple-600/20 px-5 py-2 text-xs text-purple-400 hover:bg-purple-600/30 transition"
            >
              Post your first job
              <ArrowRightSquare size={14} />
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 transition-all hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-4">

                  {/* Left */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-bold text-white">{job.title}</h3>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryColors[job.category] ?? categoryColors.OTHER}`}>
                        {job.category.replace("_", " ")}
                      </span>
                      {!job.isActive && (
                        <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-500">
                          Closed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-1">{job.description}</p>
                    <div className="flex items-center gap-4 text-xs text-zinc-600">
                      <span>{job._count.applications} applicants</span>
                      <span>•</span>
                      <span>Posted {timeAgo(job.createdAt)}</span>
                      <span>•</span>
                      <span>{job.salaryRange}</span>
                    </div>
                  </div>

                  {/* Right — actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      href={`/dashboard/recruiter/jobs/${job.id}`}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                    >
                      <Eye size={14} />
                      View
                    </Link>
                    <button
                      onClick={() => handleDelete(job.id)}
                      disabled={deletingId === job.id}
                      className="cursor-pointer flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      {deletingId === job.id
                        ? <Loader2 size={14} className="animate-spin" />
                        : <Trash2 size={14} />
                      }
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {openModal && <JobPostModal 
      onClose={()=>setOpenModal(false)}
      onJobPosted={(newJob)=>{
        setJobs(prev => [newJob,...prev])
        setOpenModal(false)

      }}
      />}
    </div>
  )
}

function StatCard({ label, value, icon, color }: {
  label: string
  value: number
  icon: React.ReactNode
  color: string
}) {
  const borderColors: Record<string, string> = {
    purple: "border-purple-500/20 bg-purple-500/10",
    green: "border-green-500/20 bg-green-500/10",
    indigo: "border-indigo-500/20 bg-indigo-500/10",
  }

  return (
    <div className={`rounded-lg border p-5 ${borderColors[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
          {label}
        </span>
        {icon}
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  )
}