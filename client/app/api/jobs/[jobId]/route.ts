import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// edit job
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ jobId: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { jobId } = await params
        const { title, description, requirements, category, salaryRange, isActive } = await req.json()

        if (!title || !description || !requirements || !category || !salaryRange) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 })
        }

        const existing = await prisma.job.findUnique({ where: { id: jobId } })
        if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 })
        if (existing.recruiterId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

        const job = await prisma.job.update({
            where: { id: jobId },
            data: { title, description, requirements, category, salaryRange, isActive },
        })

        // If job was just closed (isActive changed to false)
        // notify applicants who are still pending
        if (existing.isActive === true && isActive === false) {
            const pendingApplications = await prisma.application.findMany({
                where: { jobId, status: "PENDING" },
                select: { fresherId: true }
            })

            if (pendingApplications.length > 0) {
                await prisma.notification.createMany({
                    data: pendingApplications.map(app => ({
                        userId: app.fresherId,
                        message: `The job "${title}" has been closed by the recruiter.`,
                    }))
                })
            }
        }

        // If job details changed (title/salary) notify accepted applicants
        if (existing.title !== title || existing.salaryRange !== salaryRange) {
            const acceptedApplications = await prisma.application.findMany({
                where: { jobId, status: "ACCEPTED" },
                select: { fresherId: true }
            })

            if (acceptedApplications.length > 0) {
                await prisma.notification.createMany({
                    data: acceptedApplications.map(app => ({
                        userId: app.fresherId,
                        message: `The job "${title}" you were accepted for has been updated by the recruiter.`,
                    }))
                })
            }
        }

        return NextResponse.json({ success: true, job })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}


// delete job
export async function POST(
    req: Request,
    { params }: { params: Promise<{ jobId: string }> }

) {

    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { jobId } = await params;

        //checking whether the job actually exists and is posted by the curent logged in account

        const existing = await prisma.job.findUnique({ where: { id: jobId } })
        if (!existing) return NextResponse.json({ error: "Job not found" }, { status: 404 })
        if (existing.recruiterId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });


        // Notify all applicants before deleting
        const applications = await prisma.application.findMany({
            where: { jobId },
            select: { fresherId: true }
        })

        if (applications.length > 0) {
            await prisma.notification.createMany({
                data: applications.map(app => ({
                    userId: app.fresherId,
                    message: `The job "${existing.title}" you applied for has been removed.`,
                }))
            })
        }

        await prisma.job.delete({ where: { id: jobId } })

        return NextResponse.json({ success: true })


    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })

    }


}