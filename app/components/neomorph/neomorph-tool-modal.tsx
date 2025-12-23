"use client"

import { X, ExternalLink, Target, Tag } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { Tool } from "@/app/types/tool"

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

const getFaviconUrl = (websiteUrl: string | null | undefined, size: number = 128): string | null => {
  if (!websiteUrl) return null
  try {
    const url = new URL(websiteUrl)
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=${size}`
  } catch {
    return null
  }
}

interface NeomorphToolModalProps {
  tool: Tool
  onClose: () => void
}

export default function NeomorphToolModal({ tool, onClose }: NeomorphToolModalProps) {
  const faviconUrl = getFaviconUrl(tool.visitURL, 128)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#F0F0F3]/80 backdrop-blur-md z-50 transition-opacity duration-500"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 pointer-events-none">
        <div
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-0 pointer-events-auto shadow-2xl transition-all duration-500 border border-white/50"
          style={{
            background: '#F0F0F3',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-3 rounded-2xl z-10 hover:rotate-90 transition-transform duration-300"
            style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          <div className="p-8 md:p-12 space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-10">
              <div
                className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] flex items-center justify-center flex-shrink-0 p-8"
                style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}
              >
                <img
                  src={tool.logoUrl || faviconUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(tool.name)}&background=4f46e5&color=fff&bold=true&size=128`}
                  alt={tool.name}
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 text-center md:text-left space-y-4">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-indigo-600/60">
                  {tool.category}
                </p>
                <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight leading-none">
                  {tool.name}
                </h2>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 pt-4">
                  <a
                    href={tool.visitURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-3.5 rounded-2xl flex items-center gap-2 text-sm font-bold transition-all active:scale-95"
                    style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#4f46e5' }}
                  >
                    Open Website
                    <ExternalLink className="w-4 h-4 stroke-[3px]" />
                  </a>
                </div>
              </div>
            </div>

            {/* Screenshot if available */}
            {tool.imageUrl && (
              <div className="rounded-[2.5rem] overflow-hidden p-4" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
                <img
                  src={tool.imageUrl}
                  alt={`${tool.name} Screenshot`}
                  className="w-full h-auto rounded-[1.5rem] shadow-sm"
                />
              </div>
            )}

            {/* Description */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 opacity-30">
                <Target className="w-4 h-4 text-gray-900" />
                <h3 className="text-[10px] font-bold uppercase tracking-[0.4em] text-gray-900">Capabilities & Analysis</h3>
              </div>

              <div className="text-lg md:text-xl text-gray-700 leading-relaxed font-medium prose prose-indigo max-w-none">
                <ReactMarkdown
                  components={{
                    p: ({ node, ...props }) => <p className="mb-6 last:mb-0" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                    ul: ({ node, ...props }) => <ul className="space-y-3 mb-6" {...props} />,
                    li: ({ node, ...props }) => (
                      <li className="flex gap-4 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2.5 flex-shrink-0" />
                        <span {...props} />
                      </li>
                    ),
                  }}
                >
                  {tool.description}
                </ReactMarkdown>
              </div>
            </div>

            {/* Footer / Last Updated */}
            <div className="pt-8 border-t border-white/40 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
              <span>Source: Bedwinning AI Index</span>
              <span>Updated: {new Date(tool.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
