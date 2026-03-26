import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!dbUser || dbUser.role !== "RECRUITER") {
      return NextResponse.json({ error: "Only recruiters can post jobs" }, { status: 403 })
    }

    const { title, description, requirements, category, salaryRange } = await req.json()

    if (!title || !description || !requirements || !category || !salaryRange) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const job = await prisma.job.create({
      data: {
        title,
        description,
        requirements,
        category,
        salaryRange,
        recruiterId: userId,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: {
        _count: { select: { applications: true } }
      }
    })

    // Notify all freshers
    const freshers = await prisma.user.findMany({
      where: { role: "FRESHER" },
      select: { id: true }
    })

    await prisma.notification.createMany({
      data: freshers.map(fresher => ({
        userId: fresher.id,
        message: `New job posted: "${title}" — ${salaryRange}`,
      }))
    })


    return NextResponse.json({ success: true, job })

  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}