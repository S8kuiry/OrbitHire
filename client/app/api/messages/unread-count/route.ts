import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ count: 0 })

  const count = await prisma.message.count({
    where: {
      isRead: false,
      senderId: { not: userId },
      conversation: {
        OR: [{ recruiterId: userId }, { fresherId: userId }],
      },
    },
  })

  return NextResponse.json({ count })
}