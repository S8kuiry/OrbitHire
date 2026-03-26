"use client"

import { Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function NotificationItem({ notif, time }: { notif: any, time: string }) {
  const router = useRouter()

  const handleNotificationDelete = async (notId: string) => {
    try {
      if (!confirm("Are you sure you want to delete this notification?")) return
      const res = await fetch(`/api/notifications/${notId}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Notification Deleted")
        router.refresh() // Updates the server list
      }
    } catch (error) {
      console.error("Delete failed", error)
    }
  }

  return (
    <div
      className={`relative flex items-start gap-4 rounded-lg border p-4 transition-all ${
        notif.isRead ? "border-purple-500/20 bg-purple-500/5" : "border-purple-500/20 bg-purple-500/5"
      }`}
    >
      <div className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notif.isRead ? "bg-zinc-600" : "bg-purple-400"}`} />
      <div className="flex-1">
        <p className="text-sm text-zinc-300">{notif.message}</p>
        <p className="mt-1 text-xs text-zinc-400">{time}</p>
      </div>
      <div className="cursor-pointer absolute bottom-0 right-5 h-[100%] w-[15%] flex items-center justify-end overflow">
        <Trash2Icon 
          onClick={() => handleNotificationDelete(notif.id)} 
          className="hover:text-red-600 hover:scale-110 transition-all duration-200" 
          size={15} 
        />
      </div>
    </div>
  )
}