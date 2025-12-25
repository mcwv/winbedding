import Header from "@/app/components/ui/header"
import { ShieldCheck, Target, Users, Zap, Sparkles } from "lucide-react"



export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <div className="pt-12 pb-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <header className="mb-16 text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-neutral-100 border border-neutral-200 shadow-inner">
                            <Users className="w-4 h-4 text-indigo-600" />
                            <span className="text-eyebrow text-text-muted">Our Mission</span>
                        </div>
                        <h1 className="text-display-bold text-text-primary mb-6 tracking-tight">
                            Strictly Vetted. <span className="text-brand">AI Utility.</span>
                        </h1>
                        <p className="text-tagline text-text-secondary leading-relaxed">
                            Bedwinning is more than a directory. We are a filter for the "AI Noise", helping you find the 1% of tools that actually move the needle for your business.
                        </p>
                    </header>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                        <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-brand bg-neutral-100 border border-neutral-200 shadow-inner">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <h3 className="text-heading text-text-primary mb-3">No Ghost Tools</h3>
                            <p className="text-body text-text-secondary leading-relaxed">
                                We've purged thousands of hollow entries. Every tool in our index is verified to have a functional website, clear purpose, and high-quality utility.
                            </p>
                        </div>

                        <div className="p-8 rounded-3xl bg-surface border border-border shadow-sm">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 text-brand bg-neutral-100 border border-neutral-200 shadow-inner">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-heading text-text-primary mb-3">Intent-First Taxonomy</h3>
                            <p className="text-body text-text-secondary leading-relaxed">
                                Forget confusing categories. We organize by your intent: Creative, Dev, Research, or Ops. Find exactly what you need in under 3 clicks.
                            </p>
                        </div>
                    </section>

                    <div className="p-10 rounded-3xl mb-16 bg-surface border border-border shadow-sm">
                        <h2 className="text-heading text-text-primary mb-6 flex items-center gap-3">
                            <Sparkles className="w-6 h-6 text-indigo-600" />
                            The Bedwinning Standard
                        </h2>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">1</div>
                                <div>
                                    <h4 className="font-bold text-text-primary text-body-sm">Experience (E)</h4>
                                    <p className="text-text-secondary text-tiny">Does the tool provide a smooth, functional user experience?</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">2</div>
                                <div>
                                    <h4 className="font-bold text-text-primary text-body-sm">Expertise (E)</h4>
                                    <p className="text-text-secondary text-tiny">Is the tool backed by qualified documentation and support?</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">3</div>
                                <div>
                                    <h4 className="font-bold text-text-primary text-body-sm">Authoritativeness (A)</h4>
                                    <p className="text-text-secondary text-tiny">Is the company reputable and the community feedback positive?</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">4</div>
                                <div>
                                    <h4 className="font-bold text-text-primary text-body-sm">Trust (T)</h4>
                                    <p className="text-text-secondary text-tiny">Are privacy policies and security features clear and standard?</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div >
            </div >
        </div >
    )
}
