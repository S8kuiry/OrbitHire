"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowLeft, Briefcase, IndianRupee, Clock,
    Users, CheckCircle, XCircle, FileText,
    Loader2, Edit2, Star,
    PlusCircle,
    MessageCircleCodeIcon,
    MessageSquareDot
} from "lucide-react"
import Link from "next/link"
import JobEditModal from "./JobEditModal"

type Application = {
    id: string
    cvUrl: string
    orbitScore: number | null
    status: string
    aiFeedback: string | null
    appliedAt: Date
    fresher: {
        name: string | null
        email: string
        avatar: string | null
    }
}

type Job = {
    id: string
    title: string
    description: string
    requirements: string
    category: string
    salaryRange: string
    isActive: boolean
    createdAt: Date
    expiresAt: Date
    recruiter: { name: string | null; avatar: string | null }
    applications: Application[]
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

export default function JobDetailClient({ job }: { job: Job }) {
    const router = useRouter()
    const [applications, setApplications] = useState<Application[]>(job.applications)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<"details" | "applicants">("applicants")
    const [openModal,setOpenModal] = useState(false)

    async function handleDecision(applicationId: string, decision: "ACCEPTED" | "REJECTED") {
        setProcessingId(applicationId)
        try {
            const res = await fetch(`/api/applications/${applicationId}/decide`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision, jobTitle: job.title, jobDescription: job.description, jobRequirements: job.requirements }),
            })
            const data = await res.json()
            if (res.ok) {
                setApplications(prev =>
                    prev.map(app =>
                        app.id === applicationId
                            ? { ...app, status: decision, aiFeedback: data.aiFeedback ?? app.aiFeedback }
                            : app
                    )
                )
            }
        } catch (err) {
            console.error(err)
        } finally {
            setProcessingId(null)
        }
    }

    const pending = applications.filter(a => a.status === "PENDING")
    const decided = applications.filter(a => a.status !== "PENDING")
    useEffect(()=>{

    },[openModal])

    return (
        <div className="p-6 text-white space-y-6">

            {/* -------------- job Edit Modal ------------ */}
            {openModal && <JobEditModal job={job} onClose={()=>setOpenModal(false)} />}

            {/* Back button */}
            <Link
                href="/dashboard/recruiter"
                className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-white transition"
            >
                <ArrowLeft size={16} />
                Back to Dashboard
            </Link>

            {/* Job header */}
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
                <div className="relative flex items-start justify-between gap-4 flex-wrap">

                    {/*------ Edit Job ------------ */}
                    <div className="absolute top-0 right-0">
                        <span
                            onClick={()=>setOpenModal(true)}
                            className=" text-xs cursor-pointer flex items-center gap-2 rounded-sm bg-gradient-to-r from-purple-600/70 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90       u"
                        >
                            <PlusCircle size={14} />
                            Edit Job
                        </span>                        </div>

                    <div className="space-y-2 ">




                        <div className="flex items-center gap-3 flex-wrap">
                            <h1 className="text-2xl font-bold text-white">{job.title}</h1>
                            <span className={`rounded-full border px-3 py-0.5 text-xs font-medium ${categoryColors[job.category] ?? categoryColors.OTHER}`}>
                                {job.category.replace("_", " ")}
                            </span>
                            {!job.isActive && (
                                <span className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-0.5 text-xs text-zinc-500">
                                    Closed
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                            <div className="flex items-center gap-1">
                                <IndianRupee size={12} />
                                {job.salaryRange}
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Users size={12} />
                                {applications.length} applicants
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                                <Clock size={12} />
                                Posted {timeAgo(job.createdAt)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b border-zinc-800">
                    {(["applicants", "details"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium capitalize transition border-b-2 -mb-px ${activeTab === tab
                                ? "border-purple-500 text-purple-400"
                                : "border-transparent text-zinc-500 hover:text-zinc-300"
                                }`}
                        >
                            {tab} {tab === "applicants" && `(${applications.length})`}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab content */}
            {activeTab === "details" ? (

                // Job details tab
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6 space-y-6">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                            About the Role
                        </h3>
                        <p className="text-sm text-zinc-300 leading-relaxed">{job.description}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-3">
                            Requirements
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {job.requirements.split(",").map((req, i) => (
                                <span key={i} className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-300">
                                    {req.trim()}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

            ) : (

                // Applicants tab
                <div className="space-y-4">

                    {applications.length === 0 ? (
                        <div className="flex h-48 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/30 text-center gap-2">
                            <Users size={36} className="text-zinc-600" />
                            <p className="text-zinc-400 font-medium">No applicants yet</p>
                            <p className="text-zinc-600 text-xs">Share this job to attract candidates</p>
                        </div>
                    ) : (
                        <>
                            {/* Pending first */}
                            {pending.length > 0 && (
                                <div className="space-y-3">
                                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                                        Pending Review ({pending.length})
                                    </h2>
                                    {pending.map(app => (
                                        <ApplicantCard
                                            key={app.id}
                                            application={app}
                                            processingId={processingId}
                                            onDecide={handleDecision}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Decided */}
                            {decided.length > 0 && (
                                <div className="space-y-3">
                                    <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mt-4">
                                        Reviewed ({decided.length})
                                    </h2>
                                    {decided.map(app => (
                                        <ApplicantCard
                                            key={app.id}
                                            application={app}
                                            processingId={processingId}
                                            onDecide={handleDecision}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

function ApplicantCard({ application, processingId, onDecide }: {
    application: Application
    processingId: string | null
    onDecide: (id: string, decision: "ACCEPTED" | "REJECTED") => void
}) {
    const isProcessing = processingId === application.id

    const statusConfig: Record<string, { label: string; className: string }> = {
        PENDING: { label: "Pending", className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20" },
        ACCEPTED: { label: "Accepted", className: "text-green-400 bg-green-400/10 border-green-400/20" },
        REJECTED: { label: "Rejected", className: "text-red-400 bg-red-400/10 border-red-400/20" },
    }

    const status = statusConfig[application.status]

    return (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-4 transition hover:border-zinc-700">

            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    {application.fresher.avatar ? (
                        <img
                            src={application.fresher.avatar}
                            alt="avatar"
                            className="h-10 w-10 rounded-full ring-2 ring-zinc-700"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold ring-1 ring-purple-500/20">
                            {application.fresher.name?.[0] ?? "?"}
                        </div>
                    )}
                    <div>
                        <p className="font-semibold text-white">{application.fresher.name ?? "Unknown"}</p>
                        <p className="text-xs text-zinc-500">{application.fresher.email}</p>
                    </div>
                </div>

                {/* Status badge */}
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
                    {status.label}
                </span>
            </div>

            {/* Orbit Score */}
            {application.orbitScore !== null && (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Star size={12} className="text-purple-400" />
                        Orbit Score™
                    </div>
                    <div className="flex items-center gap-2 flex-1">
                        <div className="h-1.5 flex-1 rounded-full bg-zinc-800">
                            <div
                                className="h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"
                                style={{ width: `${application.orbitScore}%` }}
                            />
                        </div>
                        <span className="text-xs font-bold text-purple-400">{application.orbitScore}%</span>
                    </div>
                </div>
            )}

            {/* AI Feedback if rejected */}
            {application.status === "REJECTED" && application.aiFeedback && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 space-y-1">
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">AI Feedback Sent</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">{application.aiFeedback}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
                <a
                    href={application.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
                >
                    <FileText size={13} />
                    View CV
                </a>

                {application.status === "PENDING" && (
                    <>
                        <button
                            onClick={() => onDecide(application.id, "ACCEPTED")}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-xs font-medium text-green-400 transition hover:bg-green-500/20 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                            Accept
                        </button>
                        <button
                            onClick={() => onDecide(application.id, "REJECTED")}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                        >
                            {isProcessing ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                            Reject
                        </button>
                    </>
                )}
                 <button
                            onClick={() => onDecide(application.id, "ACCEPTED")}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-xs font-medium text-blue-400 transition hover:bg-blue-500/20 disabled:opacity-50"
                        >
                            {isProcessing ?<MessageSquareDot size={13} /> : <MessageSquareDot size={13} />}
                            Message
                </button>
            </div>
        </div>
    )
}