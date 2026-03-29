import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import ChatClient from "@/components/ChatClient"

export default async function RecruiterChatPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const { id } = await params

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      recruiter: { select: { id: true, name: true, email: true, avatar: true } },
      fresher: { select: { id: true, name: true, email: true, avatar: true } },
      job: { select: { id: true, title: true } },
    },
  })

  if (!conversation || conversation.recruiterId !== userId) {
    redirect("/dashboard/recruiter/messages")
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })

  return (
    <ChatClient
      conversation={conversation}
      currentUserId={userId}
      role={user?.role ?? "RECRUITER"}
    />
  )
}