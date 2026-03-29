"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Send, Loader2, ExternalLink, Link2, Trash2 } from "lucide-react"

type Message = {
  id: string
  content: string
  senderId: string
  createdAt: string
  sender: { id: string; name: string | null; avatar: string | null }
}

type Props = {
  conversation: {
    id: string
    recruiter: { id: string; name: string | null; email: string; avatar: string | null }
    fresher: { id: string; name: string | null; email: string; avatar: string | null }
    job: { id: string; title: string } | null
  }
  currentUserId: string
  role: string
}

function extractUrls(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

function isUrl(text: string): boolean {
  return /^https?:\/\/[^\s]+$/.test(text.trim())
}

function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(https?:\/\/[^\s]+)/g)
  return (
    <p className="leading-relaxed break-words">
      {parts.map((part, i) => {
        if (/^https?:\/\/[^\s]+$/.test(part)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 opacity-90 hover:opacity-100 flex items-center gap-1 mt-1 text-xs"
              onClick={e => e.stopPropagation()}
            >
              <ExternalLink size={11} />
              {part.length > 40 ? part.substring(0, 40) + "..." : part}
            </a>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </p>
  )
}

function LinkPreview({ url }: { url: string }) {
  let hostname = ""
  try { hostname = new URL(url).hostname.replace("www.", "") } catch {}

  const isGoogleMaps = url.includes("maps.google") || url.includes("goo.gl/maps")
  const isLinkedIn = url.includes("linkedin.com")
  const isGitHub = url.includes("github.com")
  const isDocs = url.includes("docs.google") || url.includes("notion.so")

  const icon = isGoogleMaps ? "📍" : isLinkedIn ? "💼" : isGitHub ? "💻" : isDocs ? "📄" : "🔗"
  const label = isGoogleMaps ? "Google Maps" : isLinkedIn ? "LinkedIn" : isGitHub ? "GitHub" : isDocs ? "Document" : hostname

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 mt-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs hover:bg-white/10 transition"
      onClick={e => e.stopPropagation()}
    >
      <span className="text-base">{icon}</span>
      <div className="min-w-0">
        <p className="font-medium text-white/90 truncate">{label}</p>
        <p className="text-white/50 truncate">{url.length > 40 ? url.substring(0, 40) + "..." : url}</p>
      </div>
      <ExternalLink size={12} className="shrink-0 ml-auto text-white/40" />
    </a>
  )
}

export default function ChatClient({ conversation, currentUserId, role }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [showLinkHint, setShowLinkHint] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const otherPerson = role === "RECRUITER" ? conversation.fresher : conversation.recruiter

  useEffect(() => {
    setShowLinkHint(extractUrls(input).length > 0)
  }, [input])

 // Replace your existing useEffect fetch with this extracted function
const fetchMessages = async () => {
  try {
    const res = await fetch(`/api/conversations/${conversation.id}/messages`)
    if (!res.ok) return
    const data = await res.json()
    if (Array.isArray(data)) setMessages(data)
  } catch (err) {
    console.error("Fetch messages error:", err)
  }
}

// Initial load
useEffect(() => {
  fetchMessages()
}, [conversation.id])

// Polling
useEffect(() => {
  const interval = setInterval(fetchMessages, 5000)
  return () => clearInterval(interval)
}, [conversation.id])




  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

 

  async function sendMessage() {
    if (!input.trim() || sending) return
    setSending(true)
    const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: input.trim() }),
    })
    if (res.ok) {
      setInput("")
      await fetchMessages()  // fetch instead of optimistic add
    }
    setSending(false)
  }
  
  // Deletes all messages but keeps the conversation record intact
  async function clearMessages() {
    if (!confirm("Clear all messages? The conversation will remain but all messages will be deleted.")) return
    setClearing(true)
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/clear`, {
        method: "DELETE",
      })
      if (res.ok) {
        setMessages([])          // optimistic: clears instantly in UI
        await fetchMessages()    // confirms from server (catches any partial failures)
      } else {
        const err = await res.text()
        console.error("Clear failed:", err)
      }
    } catch (err) {
      console.error("Clear error:", err)
    } finally {
      setClearing(false)
    }
  }


  const backPath = role === "RECRUITER"
    ? "/dashboard/recruiter/messages"
    : "/dashboard/fresher/messages"

  return (
    <div className="flex flex-col h-screen text-white bg-zinc-950">

      {/* Header */}
      <div className="flex items-center gap-4 border-b border-zinc-800 px-6 py-4 bg-zinc-950 shrink-0">
        <button
          onClick={() => router.push(backPath)}
          className="text-zinc-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
        </button>

        {otherPerson.avatar ? (
          <img src={otherPerson.avatar} className="h-10 w-10 rounded-full ring-2 ring-purple-500/30" alt="avatar" />
        ) : (
          <div className="h-10 w-10 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400 font-bold">
            {otherPerson.name?.[0] ?? "U"}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{otherPerson.name}</p>
          <p className="text-xs text-zinc-500 truncate">{otherPerson.email}</p>
          {conversation.job && (
            <p className="text-xs text-purple-400 truncate">Re: {conversation.job.title}</p>
          )}
        </div>

        {/* Clear chat button — sits in the header top right */}
        <button
          onClick={clearMessages}
          disabled={clearing || messages.length === 0}
          title="Clear all messages"
          className="cursor-pointer flex items-center gap-1.5 rounded-sm border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          {clearing
            ? <Loader2 size={13} className="animate-spin" />
            : <span className="flex items-center justify-center gap-2"><p>Clear Chat </p> <Trash2 size={13} /></span>
          }
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-zinc-600 text-sm mt-12 space-y-2">
            <p>No messages yet.</p>
            <p className="text-xs">You can share links to job portals, Google Maps, LinkedIn, GitHub, or documents.</p>
          </div>
        )}

{messages.map((msg, i) => {
  const isMe = msg.senderId === currentUserId
  const urls = extractUrls(msg.content)
  const hasOnlyUrl = isUrl(msg.content)
  const prevMsg = messages[i - 1]
  // const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId
   const showAvatar = true


  return (
    <div key={msg.id} className={`flex gap-2 items-end ${isMe ? "justify-end" : "justify-start"}`}>
      
      {/* Left avatar — always takes up space to keep bubbles aligned */}
      {!isMe && (
        <div className="shrink-0 w-7">
          {showAvatar ? (
            otherPerson.avatar ? (
              <img src={otherPerson.avatar} className="h-7 w-7 rounded-full" alt="avatar" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400 text-xs font-bold">
                {otherPerson.name?.[0] ?? "U"}
              </div>
            )
          ) : (
            <div className="h-7 w-7" /> // spacer keeps bubble indented consistently
          )}
        </div>
      )}

      {/* Bubble */}
      <div className={`max-w-[70%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-2.5 text-sm ${
          isMe
            ? "bg-purple-600 text-white rounded-br-sm"
            : "bg-zinc-800 text-zinc-200 rounded-bl-sm"
        }`}>
          {!hasOnlyUrl && <MessageContent content={msg.content} />}
          {urls.map((url, j) => (
            <LinkPreview key={j} url={url} />
          ))}
          <p className={`text-[10px] mt-1.5 ${isMe ? "text-purple-200 text-right" : "text-zinc-500"}`}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>

    </div>
  )
})}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-zinc-800 px-6 py-4 bg-zinc-950 shrink-0">
        {role === "FRESHER" && messages.length === 0 ? (
          <p className="text-center text-zinc-600 text-sm">
            Wait for the recruiter to message you first.
          </p>
        ) : (
          <div className="space-y-2">
            {showLinkHint && (
              <div className="flex items-center gap-1.5 text-xs text-purple-400">
                <Link2 size={12} />
                Link detected — will show as a preview card
              </div>
            )}
            <div className="flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                placeholder="Type a message or paste a link..."
                className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 transition disabled:opacity-50"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            <p className="text-xs text-zinc-600">
              Supports: Google Maps • LinkedIn • GitHub • Notion • Google Docs • Any URL
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
