"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Trash2, Eye, Loader2 } from "lucide-react"

type Conversation = {
  id: string
  unreadCount: number
  updatedAt: string
  job: { id: string; title: string } | null
  recruiter: { id: string; name: string | null; email: string; avatar: string | null }
  fresher: { id: string; name: string | null; email: string; avatar: string | null }
  messages: { content: string; createdAt: string }[]
}

export default function MessagesClient({ role, currentUserId }: { role: string; currentUserId: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch("/api/conversations")
      .then(r => r.json())
      .then(data => { setConversations(data); setLoading(false) })
  }, [])

  async function handleDelete(id: string) {
    if (!confirm("Delete this conversation?")) return
    setDeletingId(id)
    await fetch(`/api/conversations/${id}`, { method: "DELETE" })
    setConversations(prev => prev.filter(c => c.id !== id))
    setDeletingId(null)
  }

  if (loading) return (
    <div className="flex h-full items-center justify-center text-zinc-500">
      <Loader2 className="animate-spin mr-2" size={20} /> Loading messages...
    </div>
  )

  return (
    <div className="p-6 text-white space-y-4">
      <div className="ml-12 md:ml-0">
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-zinc-500 text-sm mt-1">Your conversations</p>
      </div>

      {conversations.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 gap-3">
          <MessageSquare size={40} className="text-zinc-600" />
          <p className="text-zinc-400 font-medium">No conversations yet</p>
          {role === "FRESHER" && (
            <p className="text-zinc-600 text-sm">Recruiters will reach out to you here</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map(conv => {
            const isRecruiter = role === "RECRUITER"
            const otherPerson = isRecruiter ? conv.fresher : conv.recruiter
            const lastMessage = conv.messages[0]

            return (
              <div
                key={conv.id}
                className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-5 hover:border-zinc-700 transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Avatar + Info */}
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      {otherPerson.avatar ? (
                        <img src={otherPerson.avatar} className="h-12 w-12 rounded-full ring-2 ring-purple-500/30" />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400 text-sm font-bold">
                          {otherPerson.name?.[0] ?? "U"}
                        </div>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-zinc-950">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold text-white truncate">{otherPerson.name ?? "Unknown"}</p>
                      <p className="text-xs text-zinc-500 truncate">{otherPerson.email}</p>
                      {conv.job && (
                        <p className="text-xs text-purple-400 truncate mt-0.5">
                          {isRecruiter ? "Applied for" : "Re:"} {conv.job.title}
                        </p>
                      )}
                      {lastMessage && (
                        <p className="text-xs text-zinc-600 truncate mt-1">{lastMessage.content}</p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => router.push(
                        role === "RECRUITER"
                          ? `/dashboard/recruiter/messages/${conv.id}`
                          : `/dashboard/fresher/messages/${conv.id}`
                      )}
                      className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-white transition"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => handleDelete(conv.id)}
                      disabled={deletingId === conv.id}
                      className="flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                    >
                      {deletingId === conv.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}