import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function DELETE(req: Request,
    { params }: { params: Promise<{ notId: string }> }
) {

    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { notId } = await params
        // Optional: Ensure the notification belongs to the user before deleting

        const notification = await prisma.notification.findUnique({
            where: { id: notId }
        })

        if (!notification || notification.userId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        await prisma.notification.deleteMany()
        return NextResponse.json({ success: true })


    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })

    }




}