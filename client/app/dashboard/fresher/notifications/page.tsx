import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Bell, CheckCheck } from "lucide-react"
import NotificationItem from "@/components/NotificationItem"

export default async function NotificationsPage() {
  const { userId } = await auth()
  if (!userId) redirect("/sign-in")

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" }
  })

  // Mark all as read
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true }
  })

  const timeAgo = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (mins < 60) return `${mins}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="p-6 text-white">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-zinc-500 text-sm mt-1">Stay updated on your applications</p>
        </div>
        {notifications.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-zinc-500">
            <CheckCheck size={14} />
            All caught up
          </div>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 text-center">
          <Bell size={40} className="mb-3 text-zinc-600" />
          <p className="text-zinc-400 font-medium">No notifications yet</p>
          <p className="text-zinc-500 text-sm mt-1">You'll be notified when recruiters review your applications</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <NotificationItem 
              key={notif.id} 
              notif={notif} 
              time={timeAgo(notif.createdAt)} 
            />
          ))}
        </div>
      )}
    </div>
  )
}