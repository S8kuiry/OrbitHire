export const dynamic = "force-dynamic";
export const revalidate = 0;

// ... your imports and component code
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Clock, CheckCircle, XCircle, IndianRupee, BriefcaseBusinessIcon } from "lucide-react"

export default async function ApplicationsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const applications = await prisma.application.findMany({
    where: { fresherId: userId },
    include: {
      job: {
        include: {
          recruiter: { select: { name: true } }
        }
      }
    },
    orderBy: { appliedAt: "desc" }
  })
 

  return (
    <div className="p-6 text-white">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Applications</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Track all your job applications in one place
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 text-center">
          <BriefcaseBusinessIcon size={40} className="mb-3 text-zinc-600" />
          <p className="text-zinc-400 font-medium">No applications yet</p>
          <p className="text-zinc-500 text-sm mt-1">Start applying to jobs from the Explore page</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <ApplicationCard key={app.id} application={app} />
          ))}
        </div>
      )}
    </div>
  )
}

function ApplicationCard({ application }: { application: any }) {
  const statusConfig = {
    PENDING: {
      label: "Under Review",
      icon: <Clock size={14} />,
      className: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20"
    },
    ACCEPTED: {
      label: "Accepted",
      icon: <CheckCircle size={14} />,
      className: "text-green-400 bg-green-400/10 border-green-400/20"
    },
    REJECTED: {
      label: "Rejected",
      icon: <XCircle size={14} />,
      className: "text-red-400 bg-red-400/10 border-red-400/20"
    },
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

  const status = statusConfig[application.status as keyof typeof statusConfig]
  const timeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    return `${days} days ago`
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/55 p-6 transition-all hover:border-zinc-700">
      <div className="flex items-start justify-between gap-4">

        {/* Left — job info */}
        <div className="space-y-3 flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="text-lg font-bold text-white">
              {application.job.title}
            </h3>
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${categoryColors[application.job.category] ?? categoryColors.OTHER}`}>
              {application.job.category.replace("_", " ")}
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span>{application.job.recruiter.name ?? "Anonymous"}</span>
            <span>•</span>
            <div className="flex items-center gap-1">
              <IndianRupee size={11} />
              <span>{application.job.salaryRange}</span>
            </div>
            <span>•</span>
            <span>Applied {timeAgo(application.appliedAt)}</span>
          </div>

          {/* Orbit Score */}
          {application.orbitScore !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Orbit Score™(Cv Match)</span>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-32 rounded-full bg-zinc-800">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600"
                    style={{ width: `${application.orbitScore}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-purple-400">
                  {application.orbitScore}%
                </span>
              </div>
            </div>
          )}

          {/* AI Rejection Feedback */}
          {application.status === "REJECTED" && application.aiFeedback && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-1">
              <p className="text-xs font-semibold text-red-400 uppercase tracking-wider">
                AI Feedback
              </p>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {application.aiFeedback}
              </p>
            </div>
          )}
        </div>

        {/* Right — status + CV link */}
        <div className="flex flex-col items-end gap-3 shrink-0">
          <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}>
            {status.icon}
            {status.label}
          </span>
          <a
            href={application.cvUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 underline underline-offset-2 hover:text-zinc-300 transition"
          >
            View CV →
          </a>
        </div>
      </div>
    </div>
  )
}