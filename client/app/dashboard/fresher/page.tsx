import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import JobFeed from "@/components/JobFeed"

export default async function FresherDashboard() {
  const user = await currentUser()
  if (!user) redirect("/sign-in")

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  if (!dbUser) redirect("/sign-up")
  if (dbUser.role !== "FRESHER") redirect("/dashboard/recruiter")

  return (
    <div className="p-6 text-white">
      <div className="pl-12 sm:pl-12 md:pl-12 lg:pl-0 mb-6">
        <h1 className=" text-2xl font-bold text-white">Explore Jobs</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Find your next opportunity across the galaxy
        </p>
      </div>
      <JobFeed />
    </div>
  )
}