import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Call FastAPI to get Orbit Score
// Send PDF directly to FastAPI — let Python handle parsing
async function getOrbitScoreFromPDF(
  pdfBuffer: ArrayBuffer,
  jdText: string,
  jobCategory: string
): Promise<number | null> {
  try {
    const formData = new FormData()
    const blob = new Blob([pdfBuffer], { type: "application/pdf" })
    formData.append("cv", blob, "cv.pdf")
    formData.append("jd_text", jdText)
    formData.append("job_category", jobCategory)

    const res = await fetch(`${process.env.ML_BACKEND_URL}/score-from-pdf`, {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    console.log("FastAPI response:", data)
    return data.orbit_score ?? null
  } catch (err) {
    console.error("FastAPI error:", err)
    return null
  }
}


export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })

    const dbUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!dbUser || dbUser.role !== "FRESHER") {
      return NextResponse.json({ success: false, error: "Only freshers can apply" }, { status: 403 })
    }

    const formData = await req.formData()
    const cv = formData.get("cv") as File
    const jobId = formData.get("jobId") as string

    if (!cv || !jobId) {
      return NextResponse.json({ success: false, error: "CV and jobId required" }, { status: 400 })
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } })
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 })

    const existing = await prisma.application.findFirst({
      where: { jobId, fresherId: userId }
    })
    if (existing) {
      return NextResponse.json({ success: false, error: "Already applied to this job" }, { status: 400 })
    }

    // Convert file to buffer
    // Convert file to buffer
const bytes = await cv.arrayBuffer()
const buffer = Buffer.from(bytes)
// Upload to Cloudinary
const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
  cloudinary.uploader.upload_stream(
    {
      resource_type: "raw",
      folder: "orbithire/cvs",
    },
    (error, result) => {
      if (error) reject(error)
      else resolve(result as { secure_url: string })
    }
  ).end(buffer)
})

console.log("✅ Uploaded:", uploadResult.secure_url)

// Build JD text
const jdText = `${job.title}. ${job.description}. Requirements: ${job.requirements}`

// Send PDF to FastAPI for parsing + scoring
const orbitScore = await getOrbitScoreFromPDF(bytes, jdText, job.category)
console.log("🎯 Orbit Score:", orbitScore)

    // Save application
    const application = await prisma.application.create({
      data: {
        jobId,
        fresherId: userId,
        cvUrl: uploadResult.secure_url,
        status: "PENDING",
        orbitScore,
      }
    })

    // Notify recruiter
    await prisma.notification.create({
      data: {
        userId: job.recruiterId,
        message: `New application received for "${job.title}" from ${dbUser.name ?? "a candidate"}${orbitScore ? ` — Orbit Score: ${orbitScore}%` : ""}`,
      }
    })

    return NextResponse.json({
      success: true,
      applicationId: application.id,
      orbitScore
    })

  } catch (error) {
    console.error("Apply error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}