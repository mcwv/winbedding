"use client"

import { MapPin, Briefcase, Clock } from "lucide-react"

interface NeomorphJobCardProps {
    title: string
    company: string
    location: string
    salary: string
    type: string
    postedDate: string
    logo?: string
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

export default function NeomorphJobCard({
    title,
    company,
    location,
    salary,
    type,
    postedDate,
    logo,
}: NeomorphJobCardProps) {
    return (
        <div
            className="rounded-2xl p-6 cursor-pointer hover:scale-[1.01] transition-all duration-200"
            style={{
                background: '#F0F0F3',
                boxShadow: neomorphShadow.raised,
            }}
        >
            {/* Header */}
            <div className="flex items-start gap-4 mb-4">
                {/* Logo */}
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                        background: '#F0F0F3',
                        boxShadow: neomorphShadow.pressed,
                    }}
                >
                    {logo ? (
                        <img src={logo} alt={company} className="w-8 h-8 object-contain" />
                    ) : (
                        <Briefcase className="w-5 h-5 text-muted-foreground" />
                    )}
                </div>

                {/* Title & Company */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-base mb-1 line-clamp-2">
                        {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">{company}</p>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{location}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <span>{postedDate}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                <span
                    className="text-sm font-semibold px-3 py-1 rounded-lg"
                    style={{
                        background: '#F0F0F3',
                        boxShadow: neomorphShadow.pressed,
                        color: '#22c55e',
                    }}
                >
                    {salary}
                </span>

                <span className="text-xs text-muted-foreground">{type}</span>
            </div>
        </div>
    )
}
