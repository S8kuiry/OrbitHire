// app/dashboard/fresher/messages/page.tsx
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import MessagesClient from "@/components/MessagesClient"

export default async function MessagesPage() {
  const { userId } = await auth()
  if (!userId) redirect("/")

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) redirect("/")

  return <MessagesClient role={user.role!} currentUserId={userId} />
}