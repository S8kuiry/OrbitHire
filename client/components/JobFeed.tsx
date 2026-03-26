"use client"

import { useEffect, useState } from "react"
import { Search, MapPin, DollarSign, Briefcase, Clock, IndianRupee, LucideBaggageClaim, BriefcaseBusiness, BriefcaseBusinessIcon } from "lucide-react"
import JobModal from "./JobModal"

const CATEGORIES = [
    { label: "All", value: "ALL" },
    { label: "Software", value: "SOFTWARE" },
    { label: "Marketing", value: "MARKETING" },
    { label: "Design", value: "DESIGN" },
    { label: "Data / AI", value: "DATA_AI" },
    { label: "Finance", value: "FINANCE" },
    { label: "HR", value: "HR" },
    { label: "Other", value: "OTHER" },
]


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

export default function JobFeed() {
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [activeCategory, setActiveCategory] = useState("ALL")
    const [debouncedSearch, setDebouncedSearch] = useState("")

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400)
        return () => clearTimeout(timer)
    }, [search])

    // Fetch jobs
    useEffect(() => {
        async function fetchJobs() {
            setLoading(true)
            const params = new URLSearchParams()
            if (activeCategory !== "ALL") params.set("category", activeCategory)
            if (debouncedSearch) params.set("search", debouncedSearch)

            const res = await fetch(`/api/jobs?${params.toString()}`)
            const data = await res.json()
            setJobs(data)
            setLoading(false)
        }
        fetchJobs()
    }, [activeCategory, debouncedSearch])

    return (
        <div className="space-y-6 z-10">

            {/* Search bar */}
            <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search jobs, skills, keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 py-3 pl-11 pr-4 text-white placeholder-zinc-500 outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                />
            </div>

            {/* Category chips */}
            <div className="flex z-10 flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => {
                            setActiveCategory(cat.value)
                        }} className={activeCategory === cat.value ? "rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer bg-purple-600 text-white shadow-[0_0_12px_rgba(147,51,234,0.4)]"
                            : "rounded-full px-4 py-1.5 text-sm font-medium cursor-pointer border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                        }
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Job grid */}
            {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-48 animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900/30" />
                    ))}
                </div>
            ) : jobs.length === 0 ? (
                <div className="flex h-48 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/30">
                    <p className="text-zinc-500">No jobs found. Try a different search.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>
            )}
        </div>
    )
}

function JobCard({ job }: { job: Job }) {
    const [openModal, setOpenModal] = useState(false)

    const categoryColors: Record<string, string> = {
        SOFTWARE: "text-blue-400 bg-blue-400/10 border-blue-400/20",
        MARKETING: "text-pink-400 bg-pink-400/10 border-pink-400/20",
        DESIGN: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
        DATA_AI: "text-purple-400 bg-purple-400/10 border-purple-400/20",
        FINANCE: "text-green-400 bg-green-400/10 border-green-400/20",
        HR: "text-orange-400 bg-orange-400/10 border-orange-400/20",
        OTHER: "text-zinc-400 bg-zinc-400/10 border-zinc-400/20",
    }

    const timeAgo = (date: string) => {
        const diff = Date.now() - new Date(date).getTime()
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        if (days === 0) return "Today"
        if (days === 1) return "Yesterday"
        return `${days} days ago`
    }

    return (
        <>
            <div className="group flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 backdrop-blur-sm transition-all hover:border-purple-500/30 hover:bg-zinc-900/60 hover:shadow-[0_0_20px_rgba(147,51,234,0.1)]">

                {/* Top */}
                <div className="space-y-3">
                    {/* Recruiter + category */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-xs font-bold ring-1 ring-purple-500/20">
                                <BriefcaseBusinessIcon size={14} />
                            </div>
                            <span className="text-xs text-zinc-500 truncate max-w-[100px]">
                                {job.recruiter.name ?? "Anonymous"}
                            </span>
                        </div>
                        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryColors[job.category] ?? categoryColors.OTHER}`}>
                            {job.category.replace("_", " ")}
                        </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                        {job.title}
                    </h3>

                    {/* Description preview */}
                    <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                        {job.description}
                    </p>
                </div>

                {/* Bottom */}
                <div className="mt-4 space-y-3">
                    {/* Salary + applicants */}
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-1">
                            <IndianRupee size={13} />
                            <span>{job.salaryRange}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Briefcase size={13} />
                            <span>{job._count.applications} applicants</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={13} />
                            <span>{timeAgo(job.createdAt)}</span>
                        </div>
                    </div>

                    {/* Apply button */}
                    <button onClick={()=>{ setOpenModal(true)
                         console.log("Clicked")}}  className="cursor-pointer w-full rounded-sm bg-gradient-to-r from-purple-600 to-indigo-600 py-2.5 text-sm font-semibold text-white transition-all hover:scale-98 ">
                        View & Apply →
                    </button>
                </div>
            </div>
            {openModal && <JobModal job={job} onClose={()=>setOpenModal(false)}/>}
        </>
    )
}