"use client" // Crucial: This tells Next.js this file runs in the browser

import { Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export default function ClearAllButton() {
  const router = useRouter()

  const handleClear = async () => {
    // Now confirm() works because we are in a Client Component!
    if (!confirm("Are you sure you want to delete all notifications?")) return

    const res = await fetch("/api/notifications", { method: "DELETE" })
    
    if (res.ok) {
      toast.success("All notifications cleared!")
      router.refresh() // This tells the server to re-fetch the list
    } else {
      toast.error("Failed to clear notifications")
    }
  }

  return (
    <button 
      onClick={handleClear}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-zinc-800 hover:bg-red-950/30 hover:border-red-900/50 hover:text-red-400 transition-all text-xs text-zinc-400 font-medium"
    >
      <Trash2 size={14} />
      Clear All
    </button>
  )
}