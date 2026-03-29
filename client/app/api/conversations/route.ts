import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const conversations = await prisma.conversation.findMany({
        where: user.role === "RECRUITER"
          ? { recruiterId: userId }
          : { fresherId: userId },
        include: {
          recruiter: { select: { id: true, name: true, email: true, avatar: true } },
          fresher: { select: { id: true, name: true, email: true, avatar: true } },
          job: { select: { id: true, title: true } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
    })

      // Attach unread count per conversation
      const withUnread = await Promise.all(
        conversations.map(async (conv) => {
          const unreadCount = await prisma.message.count({
            where: {
              conversationId: conv.id,
              isRead: false,
              senderId: { not: userId }, // unread messages sent by the OTHER person
            },
          })
          return { ...conv, unreadCount }
        })
    )

    return NextResponse.json(withUnread)

}


export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.role !== "RECRUITER") {
    return NextResponse.json({ error: "Only recruiters can start conversations" }, { status: 403 })
  }

  const { fresherId, jobId } = await req.json()

  // Check if conversation already exists
  const existing = await prisma.conversation.findFirst({
    where: { recruiterId: userId, fresherId, jobId: jobId ?? null },
  })
  if (existing) return NextResponse.json(existing)

  const conversation = await prisma.conversation.create({
    data: { recruiterId: userId, fresherId, jobId: jobId ?? null },
  })

  return NextResponse.json(conversation)
}