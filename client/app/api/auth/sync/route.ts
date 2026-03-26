import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"


// signup-sign in function
export async function POST(req: Request) {
    try {
        const user = await currentUser()
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        const { role } = await req.json()

        // check if user already exists in DB 
        const extinguisher = await prisma.user.findUnique({
            where: { id: user.id }
        })

        // if user exists  -> just return their existing role
        if (extinguisher) {
            return NextResponse.json({ role: extinguisher.role })
        }

        // If user doesn't exist → create them (sign up flow)
        if (!role) {
            return NextResponse.json(
                { error: "USER_NOT_FOUND" },
                { status: 404 }
            )
        }

        // creating new user
        const newUser = await prisma.user.create({
            data: {
                id: user.id,
                email: user.emailAddresses[0].emailAddress,
                name: user.fullName,
                avatar: user.imageUrl,
                role: role === "RECRUITER" ? "RECRUITER" : "FRESHER",
            }
        })

        return NextResponse.json({ role: newUser.role })



    } catch (error) {
        console.error("Auth sync error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })

    }

}
