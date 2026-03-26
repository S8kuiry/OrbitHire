import Navbar from "@/components/Navbar";
import { DottedGlowBackground } from "@/components/ui/dotted-glow-background";
import { MoveRight, Rocket, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { useUser, SignOutButton } from "@clerk/nextjs"




export default   function Home() {
  return (
    <main className="relative min-h-screen w-full bg-zinc-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 z-0 opacity-50">
        <DottedGlowBackground />
      </div>

      {/* Navbar */}
     <Navbar/>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">

        {/* HERO */}
        <section className="flex min-h-[90vh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-6 inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/50 px-4 py-1.5 text-sm font-medium text-purple-400 backdrop-blur-md">
            <span className="mr-2">🚀</span>The Future of Hiring is Here
          </div>

          <h1 className="max-w-4xl text-5xl font-extrabold tracking-tight sm:text-6xl md:text-8xl">
            Hire at the speed of <br />
            <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-500 bg-clip-text text-transparent">
              Light Speed
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg text-zinc-400 md:text-xl">
            AI-powered matching, smart feedback, and a seamless experience —
            whether you are looking for talent or your next opportunity.
          </p>

          {/* TWO BUTTONS — the role selector */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <span
              className="group flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-4 font-semibold text-white transition-all hover:scale-105 hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]"
            >
              <Rocket size={20} />
              I am Hiring
              <MoveRight size={18} className="transition-transform group-hover:translate-x-1" />
            </span>
            <span
              className="group flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900/50 px-8 py-4 font-semibold text-zinc-300 backdrop-blur-sm transition-all hover:border-purple-500/50 hover:bg-zinc-800 hover:text-white"
            >
              <Sparkles size={20} />
              I am Looking for a Job
              <MoveRight size={18} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>

          <p className="mt-4 text-sm text-zinc-600">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 transition">
              Sign in
            </Link>
          </p>
        </section>

        {/* FEATURES */}
        <section className="container mb-24 grid grid-cols-1 gap-6 px-6 md:grid-cols-3">
          <FeatureCard
            icon={<Rocket className="text-purple-400" />}
            title="Post in Minutes"
            description="Set up your company profile and start posting jobs in under 5 minutes."
          />
          <FeatureCard
            icon={<Users className="text-indigo-400" />}
            title="Orbit Score™ Matching"
            description="Our AI ranks candidates semantically — beyond keywords, based on real meaning."
          />
          <FeatureCard
            icon={<Sparkles className="text-blue-400" />}
            title="Smart Rejection Feedback"
            description="Candidates learn exactly why they weren't selected. No more ghosting."
          />
        </section>

      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 backdrop-blur-md transition-all hover:border-purple-500/30 hover:bg-zinc-900/50">
      <div className="mb-4 inline-block rounded-lg bg-zinc-800/50 p-3 ring-1 ring-zinc-700">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}