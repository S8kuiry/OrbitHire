"use client"

import { useEffect, useState } from "react"
import { X, Loader2, CheckCircle, Briefcase, ArrowUpSquareIcon } from "lucide-react"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation";


type Job = {
    id: string
    title: string
    description: string
    requirements: string
    category: string
    salaryRange: string
    isActive: boolean
    createdAt: Date
    expiresAt: Date
    recruiter: { name: string | null; avatar: string | null }
}


interface JobEditModalProps {
    job: Job
    onClose: () => void
}

const CATEGORIES = [
    { label: "Software / Tech", value: "SOFTWARE" },
    { label: "Marketing", value: "MARKETING" },
    { label: "Design / UI-UX", value: "DESIGN" },
    { label: "Data / AI", value: "DATA_AI" },
    { label: "Finance", value: "FINANCE" },
    { label: "HR / Operations", value: "HR" },
    { label: "Other", value: "OTHER" },
]

export default function JobEditModal({ job, onClose, }: JobEditModalProps) {
    // router
    const router = useRouter();

    // parse salary 
    const parseSalary = (range: string) => {
        const defaultValues = { currency: "₹", min: "", max: "", period: "LPA" };
        if (!range) return defaultValues;

        // Regex explanation: 
        // ^([^0-9]) -> Group 1: Starts with any non-digit (Currency)
        // (\d+)     -> Group 2: Digits before the dash (Min)
        // -         -> Literal dash
        // (\d+)     -> Group 3: Digits after the dash (Max)
        // \s+       -> One or more spaces
        // (.+)$     -> Group 4: Remaining text (Period)
        const match = range.match(/^([^0-9])(\d+)-(\d+)\s+(.+)$/);

        if (match) {
            return {
                currency: match[1],
                min: match[2],
                max: match[3],
                period: match[4]
            };
        }
        return defaultValues;



    }
    const initialSalaryRange = parseSalary(job.salaryRange)


    const [form, setForm] = useState({
        title: job.title,
        description: job.description,
        requirements: job.requirements,
        category: job.category,
        currency: initialSalaryRange.currency,
        salaryMin: initialSalaryRange.min,
        salaryMax: initialSalaryRange.max,
        salaryPeriod: initialSalaryRange.period,
        isActive: job.isActive
    })
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState<string | null>(null)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    function validate() {
        if (!form.title.trim()) return "Job title is required"
        if (!form.description.trim()) return "Description is required"
        if (!form.requirements.trim()) return "Requirements are required"
        if (!form.category) return "Please select a category"
        if (!form.salaryMin || !form.salaryMax) return "Please enter salary range"
        if (Number(form.salaryMax) <= Number(form.salaryMin)) return "Max salary must be greater than min"
        return null
    }

    async function handleSubmit() {
        const err = validate()
        if (err) { setError(err); return }

        setLoading(true)
        setError(null)
        // Build salary string → e.g. "₹8-12 LPA"
        const salaryRange = `${form.currency}${form.salaryMin}-${form.salaryMax} ${form.salaryPeriod}`

        try {
            const res = await fetch(`/api/jobs/${job.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: form.title,
                    description: form.description,
                    requirements: form.requirements,
                    category: form.category,
                    salaryRange,
                    isActive: form.isActive,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || "Something went wrong")
                return
            }

            setSubmitted(true)
            toast.success("Job Updated Successfully")
            router.refresh()
        } catch (err) {
            setError("Failed to post job. Try again.")
        } finally {
            setLoading(false)
        }
    }
    useEffect(() => {

    }, [submitted])

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className=" relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl">

                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-indigo-600/20 flex items-center justify-center ring-1 ring-indigo-500/20">
                            <Briefcase size={16} className="text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">Post a New Job</h2>
                            <p className="text-xs text-zinc-500">Fill in the details below</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-white transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {submitted ? (
                        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 py-12 text-center">
                            <CheckCircle size={44} className="text-green-400" />
                            <p className="text-xl font-bold text-white">Job Updated!</p>
                            <p className="text-sm text-zinc-400">Your changes are now live and visible to Others.</p>
                            <button
                                onClick={onClose}
                                className="mt-2 rounded-lg bg-zinc-800 px-6 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Title */}
                            <div className="space-y-1">
                                <label className="text-xs  font-semibold uppercase tracking-wider text-zinc-400">
                                    Job Title *
                                </label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Frontend Developer"
                                    className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                                />
                            </div>

                            {/* Category + Currency — side by side */}
                            <div className="w-full flex flex-col items-center justify-center gap-2">
                                <div className="space-y-1.5 w-full">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                        Category *
                                    </label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className="mt-2 w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                            backgroundRepeat: 'no-repeat',
                                            backgroundPosition: 'right 1rem center',
                                            backgroundSize: '1em'
                                        }}
                                    >
                                        <option value="" className="bg-zinc-900">Select category</option>
                                        {CATEGORIES.map(cat => (
                                            <option key={cat.value} value={cat.value} className="bg-zinc-900">
                                                {cat.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Salary */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                        Salary Range *
                                    </label>
                                    <div className="mt-2 flex items-center gap-2">
                                        {/* Currency dropdown */}
                                        <select
                                            name="currency"
                                            value={form.currency}
                                            onChange={handleChange}
                                            className=" w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 1rem center',
                                                backgroundSize: '1em'
                                            }}                                        >
                                            <option value="₹" className="bg-zinc-900">₹ INR</option>
                                            <option value="$" className="bg-zinc-900">$ USD</option>
                                            <option value="€" className="bg-zinc-900">€ EUR</option>
                                            <option value="£" className="bg-zinc-900">£ GBP</option>
                                            <option value="¥" className="bg-zinc-900">¥ JPY</option>
                                        </select>

                                        {/* Min */}
                                        <input
                                            name="salaryMin"
                                            type="number"
                                            value={form.salaryMin}
                                            onChange={handleChange}
                                            placeholder="Min"
                                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                                        />

                                        <span className="text-zinc-500 text-sm shrink-0">—</span>

                                        {/* Max */}
                                        <input
                                            name="salaryMax"
                                            type="number"
                                            value={form.salaryMax}
                                            onChange={handleChange}
                                            placeholder="Max"
                                            className="w-full rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                                        />

                                        {/* LPA / PA toggle */}
                                        <select
                                            name="salaryPeriod"
                                            value={form.salaryPeriod}
                                            onChange={handleChange}
                                            className=" w-full appearance-none rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                                            style={{
                                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 1rem center',
                                                backgroundSize: '1em'
                                            }}                                        >
                                            <option value="LPA" className="bg-zinc-900">LPA</option>
                                            <option value="PA" className="bg-zinc-900">PA</option>
                                            <option value="PM" className="bg-zinc-900">PM</option>
                                            <option value="PH" className="bg-zinc-900">PH</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Job Description *
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={4}
                                    placeholder="Describe the role, responsibilities, and what you're looking for..."
                                    className="mt-2 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                                />
                            </div>

                            {/* Requirements */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                                    Requirements *
                                </label>
                                <textarea
                                    name="requirements"
                                    value={form.requirements}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="e.g. React, Node.js, 2+ years experience, TypeScript..."
                                    className="mt-2 w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none transition focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30"
                                />
                                <p className="text-xs text-zinc-600">Separate skills with commas for best AI matching results</p>
                            </div>

                            {/* isActive */}
                            {/* Status Toggle */}
                            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/30 p-4">
                                <div className="space-y-0.5">
                                    <label className="text-sm font-semibold text-white">Active Status</label>
                                    <p className="text-xs text-zinc-500">
                                        {form.isActive
                                            ? "This job is currently visible to candidates."
                                            : "This job is hidden and won't accept new applications."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setForm(prev => ({ ...prev, isActive: !prev.isActive }))}
                                    className={`
                                        cursor-pointer
                                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none 
                                        ring-2 ring-offset-2 ring-offset-zinc-950 
                                        ${form.isActive ? "bg-green-600 ring-indigo-500/50" : "bg-zinc-700 ring-transparent"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.isActive ? "translate-x-6" : "translate-x-1"
                                            }`}
                                    />
                                </button>
                            </div>


                            {/* Error */}
                            {error && (
                                <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                                    {error}
                                </p>
                            )}

                            {/* Submit */}
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="cursor-pointer w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-600 py-3 text-sm font-semibold text-white transition-all hover:opacity-90  disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Updating Job...
                                    </span>
                                ) : (
                                    <p className="flex items-center justify-center gap-2"> Update Job <ArrowUpSquareIcon size={14} /></p>
                                )}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}