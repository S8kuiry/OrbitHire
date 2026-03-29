import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ChatClient from "@/components/ChatClient"
export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const { id } = await params  // ← await params first

  const conversation = await prisma.conversation.findUnique({
    where: { id },             // ← use destructured id
    include: {
      recruiter: { select: { id: true, name: true, email: true, avatar: true } },
      fresher: { select: { id: true, name: true, email: true, avatar: true } },
      job: { select: { id: true, title: true } },
    },
  })

  if (!conversation || (conversation.recruiterId !== userId && conversation.fresherId !== userId)) {
    redirect("/dashboard/fresher/messages")
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  return (
    <ChatClient
      conversation={conversation}
      currentUserId={userId}
      role={user?.role ?? "FRESHER"}
    />
  )
}