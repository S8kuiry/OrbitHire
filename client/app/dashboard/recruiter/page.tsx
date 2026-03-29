import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import RecruiterDashboardClient from "@/components/RecruiterDashboardClient"

export default async function RecruiterDashboard() {
 const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const dbUser = await prisma.user.findUnique({ where: { id: userId } })
  if (!dbUser) redirect("/sign-up")
  if (dbUser.role !== "RECRUITER") redirect("/dashboard/fresher")

  const jobs = await prisma.job.findMany({
    where: { recruiterId: userId },
    include: {
      _count: { 
        select: { 
          applications: true, // Total count
        } 
      },
      // This is the key: fetch only the count of pending applications
      applications: {
        where: { status: "PENDING" },
        select: { id: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  // Format the data so the Client Component gets a clean "pendingCount" number
  const formattedJobs = jobs.map(job => ({
    ...job,
    pendingCount: job.applications.length // Convert the array of IDs to a number
  }))

  return (
    <RecruiterDashboardClient
      recruiterName={dbUser.name ?? "Recruiter"}
      initialJobs={formattedJobs}
    />
  )
}