import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Sidebar from "@/components/Sidebar"
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background"
import { Toaster } from "react-hot-toast"


export default async function DashboardLayout({ children, }: { children: React.ReactNode }) {
  const user = await currentUser()
  if (!user) {
    redirect('/sign-in')

  }
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id }
  })

  if (!dbUser) { redirect("/sign-up") }

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#18181b',
          color: '#f1f5f9',
          border: '1px solid #27272a',
        }
      }} />


      <div className="flex min-h-screen bg-zinc-950">
        <div className="fixed inset-0 z-0 opacity-50 pointer-events-none">
          <DottedGlowBackground />
        </div>
        <Sidebar role={dbUser.role!} user={{
          name: dbUser.name,
          avatar: dbUser.avatar,
          email: dbUser.email,
        }} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </>

  )




}