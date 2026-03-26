import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

// Extract text from PDF URL using pdf-parse
async function extractTextFromPDF(url: string): Promise<string> {
    try {
        const response = await fetch(url)
        const arrayBuffer = await response.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const pdfParse = require("pdf-parse")
        const data = await pdfParse(buffer)
        return data.text
    } catch (err) {
        console.error("PDF parse error:", err)
        return ""
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ applicationId: string }> }
) {
    try {
        const { userId } = await auth()
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { applicationId } = await params
        const { decision, jobTitle, jobDescription, jobRequirements } = await req.json()

        if (!["ACCEPTED", "REJECTED"].includes(decision)) {
            return NextResponse.json({ error: "Invalid decision" }, { status: 400 })
        }

        const application = await prisma.application.findUnique({
            where: { id: applicationId },
            include: {
                job: true,
                fresher: { select: { name: true } }
            }
        })

        if (!application) return NextResponse.json({ error: "Application not found" }, { status: 404 })
        if (application.job.recruiterId !== userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        if (application.status !== "PENDING") return NextResponse.json({ error: "Application already decided" }, { status: 400 });
        

        let aiFeedback = null

        if (decision === "REJECTED") {
            try {
                // Extract CV text from Cloudinary PDF
                const cvText = await extractTextFromPDF(application.cvUrl)

                const prompt = `You are an expert career coach and hiring specialist. Analyze this job application rejection and provide personalized feedback.

JOB TITLE: ${jobTitle}

JOB DESCRIPTION: ${jobDescription}

JOB REQUIREMENTS: ${jobRequirements}

CANDIDATE'S CV TEXT:
${cvText || "CV text could not be extracted"}

The candidate was not selected for this role. Provide specific, personalized feedback in 3-4 sentences:
1. Identify the exact gaps between their CV and the job requirements
2. Point out specific skills or experience missing from their CV
3. Give actionable advice on what to add or improve in their CV
4. Encourage them with a positive closing note

Be specific, reference actual content from their CV and the job requirements. Do not be generic.`

                const res = await fetch(
                    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + process.env.GEMINI_API_KEY,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{ parts: [{ text: prompt }] }],
                            generationConfig: { maxOutputTokens: 300 }
                        })
                    }
                )

                const data = await res.json()
                aiFeedback = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null

            } catch (err) {
                aiFeedback = "The recruiter has moved forward with other candidates."
                console.error("AI feedback error:", err)
            }
        }

        await prisma.application.update({
            where: { id: applicationId },
            data: { status: decision, aiFeedback }
        })

        // Send feedback signal to FastAPI for federated learning
        if (application.orbitScore !== null) {
            try {
                await fetch(`${process.env.ML_BACKEND_URL}/feedback`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        application_id: applicationId,
                        job_category: application.job.category,
                        orbit_score: application.orbitScore,
                        outcome: decision,
                    }),
                })
                console.log(`✅ Federated signal sent: ${decision} | score=${application.orbitScore}`)
            } catch (err) {
                console.error("Failed to send federated signal:", err)
                // Don't fail the request if ML backend is down
            }
        }


        await prisma.notification.create({
            data: {
                userId: application.fresherId,
                message: decision === "ACCEPTED"
                    ? `🎉 Congratulations! Your application for "${jobTitle}" has been accepted! The recruiter will contact you soon.`
                    : `Your application for "${jobTitle}" was reviewed. Check your personalized AI feedback in My Applications.`,
            }
        })

        await prisma.notification.create({
            data: {
                userId,
                message: decision === "ACCEPTED"
                    ? `You accepted ${application.fresher.name ?? "a candidate"} for "${jobTitle}".`
                    : `You rejected ${application.fresher.name ?? "a candidate"} for "${jobTitle}".`,
            }
        })

        return NextResponse.json({ success: true, status: decision, aiFeedback })

    } catch (error) {
        console.error("Decide error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}