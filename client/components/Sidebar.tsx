"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { SignOutButton } from "@clerk/nextjs"
import {
  Rocket, LayoutDashboard, Bell, LogOut,
  ChevronLeft, ChevronRight, Briefcase,
  FileText, Menu, X,
  MessageSquareDot
} from "lucide-react"

type Props = {
  role: string
  user: {
    name: string | null
    avatar: string | null
    email: string
  }
}

const fresherLinks = [
  { href: "/dashboard/fresher", label: "Explore Jobs", icon: Rocket, key: "explore" },
  { href: "/dashboard/fresher/applications", label: "My Applications", icon: FileText, key: "applications" },
  { href: "/dashboard/fresher/notifications", label: "Notifications", icon: Bell, key: "notifications" },
  { href: "/dashboard/fresher/messages", label: "Messages", icon: MessageSquareDot, key: "messages" },

]

const recruiterLinks = [
  { href: "/dashboard/recruiter", label: "Dashboard", icon: LayoutDashboard, key: "dashboard" },
  { href: "/dashboard/recruiter/notifications", label: "Notifications", icon: Bell, key: "notifications" },
  { href: "/dashboard/recruiter/messages", label: "Messages", icon: MessageSquareDot, key: "messages" },

]

export default function Sidebar({ role, user }: Props) {
  const prevCountRef = useRef(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const prevMsgCountRef = useRef(0)
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  

  const links = role === "RECRUITER" ? recruiterLinks : fresherLinks

  // Fetch unread count on mount and every 30 seconds
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch("/api/notifications/count")
        const data = await res.json()

        // Play sound only if count increased
        if (data.count > prevCountRef.current) {
          const audio = new Audio("/notification.mp3")
          audio.volume = 0.4
          audio.play().catch(() => { }) // catch prevents error if browser blocks autoplay
        }


        prevCountRef.current = data.count
        setUnreadCount(data.count)
      } catch (err) {
        console.error(err)
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Reset count when user visits notifications page
  useEffect(() => {
    const isNotificationsPage =
      pathname === "/dashboard/fresher/notifications" ||
      pathname === "/dashboard/recruiter/notifications"

    if (isNotificationsPage) {
      setUnreadCount(0)
    }
  }, [pathname])



  // fetch unread messages
  useEffect(() => {
    async function fetchMsgCount() {
      try {
        const res = await fetch("/api/messages/unread-count")
        const data = await res.json()


        if (data.count > prevMsgCountRef.current) {
          const audio = new Audio("/notification.mp3")
          audio.volume = 0.4
          audio.play().catch(() => { })
        }

        prevMsgCountRef.current = data.count
        setUnreadMessages(data.count)

      } catch (error) {
        console.error(error)


      }
    }

    fetchMsgCount()
    const interval = setInterval(fetchMsgCount, 30000)
    return () => clearInterval(interval)
  }, [])

  // Reset when on messages page
useEffect(() => {
  const isMessagesPage = pathname.includes("/messages")
  if (isMessagesPage) setUnreadMessages(0)
}, [pathname])



  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-6 left-4 z-50 rounded-lg border border-zinc-800 bg-zinc-900 p-2 lg:hidden"
      >
        <Menu size={20} className="text-zinc-400" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
       fixed inset-y-0 left-0 z-50 flex flex-col border-r border-zinc-800/50 bg-zinc-950 transition-all duration-300
  /* lg:sticky ensures it stays pinned while the main content scrolls */
  lg:sticky lg:top-0 lg:translate-x-0 
  h-screen /* Force exact viewport height */
  ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  ${collapsed ? "w-[75px]" : "w-[240px]"}
      `}>

        {/* Logo */}
        <div className="flex items-center justify-between border-b border-zinc-800/50 px-4 py-5">
          {!collapsed && (
            <span className="text-xl font-bold tracking-tighter text-white">
              <span className="bg-gradient-to-r from-purple-800 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                OrbitHire
              </span>
            </span>
          )}
          <button
            onClick={() => { setCollapsed(!collapsed); setMobileOpen(false) }}
            className="ml-auto rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white transition lg:flex hidden"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-white transition lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {links.map(({ href, label, icon: Icon, key }) => {
            const isActive = pathname === href
            const isNotification = key === "notifications"
            const showBadge = isNotification && unreadCount > 0
            const isMessages = key === "messages"
const showMessageBadge = isMessages && unreadMessages > 0

            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`${collapsed ? "w-[80%] justify-center" : "justify-start"} relative flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium transition-all ${isActive
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                  }`}
              >
                {/* Icon with badge */}
                <div className="relative shrink-0">
                  <Icon size={18} />
                  {showBadge && (
                    <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                  {showMessageBadge && (
  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
    {unreadMessages > 9 ? "9+" : unreadMessages}
  </span>
)}
                </div>
                {!collapsed && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom — user + logout */}
        <div className="absolute bottom-0 inset-x-0 border-t border-zinc-800/50 px-2 py-4 space-y-2">
          <div className={`flex items-center gap-3 rounded-lg px-3 py-2 ${collapsed ? "justify-center" : ""}`}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="h-8 w-8 shrink-0 rounded-full ring-2 ring-purple-500/30"
              />
            ) : (
              <div className="h-8 w-8 shrink-0 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-400 text-xs font-bold">
                {user.name?.[0] ?? "U"}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{user.name}</p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
              </div>
            )}
          </div>

          <SignOutButton redirectUrl="/">
            <button className={`cursor-pointer flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800/50 hover:text-red-400 ${collapsed ? "justify-center" : ""}`}>
              <LogOut size={18} className="shrink-0" />
              {!collapsed && <span>Logout</span>}
            </button>
          </SignOutButton>
        </div>
      </aside>
    </>
  )
}