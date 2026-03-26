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
      _count: { select: { applications: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  return (
    <RecruiterDashboardClient
      recruiterName={dbUser.name ?? "Recruiter"}
      initialJobs={jobs}
    />
  )
}