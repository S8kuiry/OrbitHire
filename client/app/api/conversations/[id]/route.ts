import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params  // ✅ destructure first

  const { userId } = await auth()
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const conversation = await prisma.conversation.findUnique({ where: { id } })  // ✅ use id
  if (!conversation || (conversation.recruiterId !== userId && conversation.fresherId !== userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  await prisma.conversation.delete({ where: { id } })  // ✅ use id
  return NextResponse.json({ success: true })
}