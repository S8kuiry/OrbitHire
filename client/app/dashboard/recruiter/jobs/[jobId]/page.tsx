import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import JobDetailClient from "@/components/JobDetailClient"

export default async function JobDetailPage({
  params
}: {
  params: Promise<{ jobId: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { jobId } = await params

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      recruiter: { select: { name: true, avatar: true } },
      applications: {
        include: {
          fresher: { select: { name: true, email: true, avatar: true } }
        },
        orderBy: { orbitScore: "desc" }
      }
    }
  })

  if (!job) redirect("/dashboard/recruiter")
  if (job.recruiterId !== userId) redirect("/dashboard/recruiter")

  return <JobDetailClient job={job} />
}