"use client"

import { useState } from "react"
import { MapPin, Briefcase, Clock, Building2, DollarSign } from "lucide-react"

interface Job {
    id: number
    title: string
    company: string
    location: string
    salary: string
    type: string
    postedDate: string
    description?: string
}

interface NeomorphJobBrowserProps {
    jobs: Job[]
}

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

export default function NeomorphJobBrowser({ jobs }: NeomorphJobBrowserProps) {
    const [selectedJob, setSelectedJob] = useState<Job | null>(jobs[0] || null)

    return (
        <div className="grid lg:grid-cols-5 gap-6">
            {/* Left: Job List */}
            <div className="lg:col-span-2">
                <div
                    className="rounded-2xl p-4 h-[600px] overflow-y-auto"
                    style={{
                        background: '#F0F0F3',
                        boxShadow: neomorphShadow.pressed,
                    }}
                >
                    <div className="space-y-3">
                        {jobs.map((job) => (
                            <button
                                key={job.id}
                                onClick={() => setSelectedJob(job)}
                                className="w-full text-left rounded-xl p-4 transition-all"
                                style={{
                                    background: '#F0F0F3',
                                    boxShadow: selectedJob?.id === job.id ? neomorphShadow.pressed : neomorphShadow.raised,
                                    border: selectedJob?.id === job.id ? '2px solid #22c55e' : '2px solid transparent',
                                }}
                            >
                                <h3 className="font-semibold text-sm mb-1 line-clamp-1">{job.title}</h3>
                                <p className="text-xs text-muted-foreground mb-2">{job.company}</p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {job.location}
                                    </span>
                                    <span className="font-semibold" style={{ color: '#22c55e' }}>{job.salary}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Job Detail */}
            <div className="lg:col-span-3">
                {selectedJob ? (
                    <div
                        className="rounded-2xl p-8 h-[600px] overflow-y-auto"
                        style={{
                            background: '#F0F0F3',
                            boxShadow: neomorphShadow.raised,
                        }}
                    >
                        {/* Header */}
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold mb-2">{selectedJob.title}</h2>
                            <p className="text-lg text-muted-foreground mb-4">{selectedJob.company}</p>

                            <div className="flex flex-wrap gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                    <span>{selectedJob.location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                                    <span>{selectedJob.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{selectedJob.postedDate}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" style={{ color: '#22c55e' }} />
                                    <span className="font-semibold" style={{ color: '#22c55e' }}>{selectedJob.salary}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="prose prose-sm max-w-none">
                            <h3 className="text-lg font-semibold mb-3">About the role</h3>
                            <p className="text-muted-foreground leading-relaxed mb-4">
                                {selectedJob.description || `We're looking for a talented ${selectedJob.title} to join our team at ${selectedJob.company}. This is a ${selectedJob.type.toLowerCase()} position offering competitive compensation and growth opportunities.`}
                            </p>

                            <h3 className="text-lg font-semibold mb-3">Key Responsibilities</h3>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                                <li>Lead social media strategy and execution</li>
                                <li>Create engaging content across platforms</li>
                                <li>Analyze metrics and optimize performance</li>
                                <li>Collaborate with cross-functional teams</li>
                            </ul>

                            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
                            <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-6">
                                <li>3+ years of experience in social media management</li>
                                <li>Strong understanding of social platforms and trends</li>
                                <li>Excellent written and verbal communication skills</li>
                                <li>Data-driven mindset with analytical skills</li>
                            </ul>
                        </div>

                        {/* Apply Button */}
                        <button
                            className="w-full py-3 rounded-xl text-sm font-semibold hover:scale-[1.02] transition-transform"
                            style={{
                                background: '#F0F0F3',
                                boxShadow: neomorphShadow.raised,
                                color: '#22c55e',
                            }}
                        >
                            Apply Now
                        </button>
                    </div>
                ) : (
                    <div
                        className="rounded-2xl p-8 h-[600px] flex items-center justify-center"
                        style={{
                            background: '#F0F0F3',
                            boxShadow: neomorphShadow.raised,
                        }}
                    >
                        <p className="text-muted-foreground">Select a job to view details</p>
                    </div>
                )}
            </div>
        </div>
    )
}
