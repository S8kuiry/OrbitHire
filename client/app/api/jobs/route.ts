import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const search = searchParams.get("search")

  const jobs = await prisma.job.findMany({
    where: {
      isActive: true,
      expiresAt: { gt: new Date() },
      ...(category && category !== "ALL" && { category: category as any }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { requirements: { contains: search, mode: "insensitive" } },
        ]
      })
    },
    include: {
      recruiter: {
        select: { name: true, avatar: true }
      },
      _count: {
        select: { applications: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return NextResponse.json(jobs)
}