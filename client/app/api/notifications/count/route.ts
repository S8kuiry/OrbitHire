import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ count: 0 });
        const count = await prisma.notification.count({
            where: { userId: userId, isRead: false }
        })
        return NextResponse.json({ count })
        

    } catch (error) {
        return NextResponse.json({ count: 0 })


    }

}