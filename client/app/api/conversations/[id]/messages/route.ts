import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params  // ✅ await

  const conversation = await prisma.conversation.findUnique({
    where: { id },
  })

  if (!conversation || (conversation.recruiterId !== userId && conversation.fresherId !== userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: userId },
      isRead: false,
    },
    data: { isRead: true },
  })

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(messages)
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise
) {
  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params  // ✅ await
  const { content } = await req.json()
  if (!content?.trim()) return NextResponse.json({ error: "Empty message" }, { status: 400 })

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      fresher: true,
      recruiter: true,
    }
  })

  if (!conversation || (conversation.recruiterId !== userId && conversation.fresherId !== userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const messageCount = await prisma.message.count({ where: { conversationId: id } })
  const isRecruiter = conversation.recruiterId === userId

  if (messageCount === 0 && !isRecruiter) {
    return NextResponse.json({ error: "Only recruiter can start a conversation" }, { status: 403 })
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: userId,
      content: content.trim(),
    },
    include: { sender: { select: { id: true, name: true, avatar: true } } },
  })

  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  })

  const recipientId = isRecruiter ? conversation.fresherId : conversation.recruiterId
  await prisma.notification.create({
    data: {
      userId: recipientId,
      message: `New message from ${isRecruiter ? conversation.recruiter.name : conversation.fresher.name}`,
    },
  })

  return NextResponse.json(message)
}