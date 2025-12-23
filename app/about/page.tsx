import NeomorphHeader from "@/app/components/neomorph/neomorph-header"
import { ShieldCheck, Target, Users, Zap, Sparkles } from "lucide-react"

const neomorphShadow = {
    raised: `
    8px 8px 16px rgba(209, 217, 230, 0.8),
    -8px -8px 16px rgba(255, 255, 255, 0.8)
  `,
    pressed: `
    inset 4px 4px 8px rgba(209, 217, 230, 0.7),
    inset -4px -4px 8px rgba(255, 255, 255, 0.7)
  `,
}

export default function AboutPage() {
    return (
        <div className="min-h-screen" style={{ background: '#F0F0F3' }}>
            <NeomorphHeader />
            <div className="pt-12 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-16 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                            style={{ background: '#F0F0F3', boxShadow: 'inset 2px 2px 5px rgba(209,217,230,0.7), inset -2px -2px 5px rgba(255,255,255,0.7)' }}>
                            <Users className="w-4 h-4 text-indigo-600" />
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Our Mission</span>
                        </div>
                        <h1 className="text-4xl font-extrabold text-zinc-800 mb-6 tracking-tight">
                            Strictly Vetted. <span className="text-indigo-600">AI Utility.</span>
                        </h1>
                        <p className="text-xl text-zinc-500 leading-relaxed">
                            Bedwinning is more than a directory. We are a filter for the "AI Noise", helping you find the 1% of tools that actually move the needle for your business.
                        </p>
                    </header>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="p-8 rounded-3xl" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-indigo-600"
                                style={{ background: '#F0F0F3', boxShadow: 'inset 3px 3px 6px rgba(209,217,230,0.8), inset -3px -3px 6px rgba(255,255,255,0.8)' }}>
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-800 mb-3">No Ghost Tools</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                We've purged thousands of hollow entries. Every tool in our index is verified to have a functional website, clear purpose, and high-quality utility.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}>
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-indigo-600"
                                style={{ background: '#F0F0F3', boxShadow: 'inset 3px 3px 6px rgba(209,217,230,0.8), inset -3px -3px 6px rgba(255,255,255,0.8)' }}>
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-800 mb-3">Intent-First Taxonomy</h3>
                            <p className="text-zinc-500 text-sm leading-relaxed">
                                Forget confusing categories. We organize by your intent: Creative, Dev, Research, or Ops. Find exactly what you need in under 3 clicks.
                            </p>
                        </div>
                    </section>

                    <div className="p-10 rounded-3xl mb-16" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}>
                        <h2 className="text-2xl font-bold text-zinc-800 mb-6 flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-indigo-600" />
                            The Bedwinning Standard
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</div>
                                <div>
                                    <h4 className="font-bold text-zinc-800 text-sm">Experience (E)</h4>
                                    <p className="text-zinc-500 text-xs">Does the tool provide a smooth, functional user experience?</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</div>
                                <div>
                                    <h4 className="font-bold text-zinc-800 text-sm">Expertise (E)</h4>
                                    <p className="text-zinc-500 text-xs">Is the tool backed by qualified documentation and support?</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</div>
                                <div>
                                    <h4 className="font-bold text-zinc-800 text-sm">Authoritativeness (A)</h4>
                                    <p className="text-zinc-500 text-xs">Is the company reputable and the community feedback positive?</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">4</div>
                                <div>
                                    <h4 className="font-bold text-zinc-800 text-sm">Trust (T)</h4>
                                    <p className="text-zinc-500 text-xs">Are privacy policies and security features clear and standard?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
