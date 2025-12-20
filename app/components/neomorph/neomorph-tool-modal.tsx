"use client"

import { X, Star, ExternalLink, CheckCircle, Shield, DollarSign, Users, Code, Building2, Award, Target, Zap } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import { Tool } from "@/app/types/tool"

interface NeomorphToolModalProps {
  tool: Tool
  onClose: () => void
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

const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false
  if (typeof url !== 'string') return false
  if (url === '#N/A' || url === 'N/A') return false
  if (url.toLowerCase().includes('no high-quality') || url.toLowerCase().includes('no logo')) return false
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) return false
  return true
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

const getToolImage = (tool: Tool, size: number = 128): string | null => {
  if (isValidImageUrl(tool.logo)) return tool.logo!
  if (isValidImageUrl(tool.thumbnail)) return tool.thumbnail!
  return getFaviconUrl(tool.visitURL || tool.affiliateURL, size)
}

export default function NeomorphToolModal({ tool, onClose }: NeomorphToolModalProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-8 pointer-events-auto animate-scaleIn"
          style={{
            background: '#F0F0F3',
            boxShadow: `
              20px 20px 60px rgba(209, 217, 230, 0.8),
              -20px -20px 60px rgba(255, 255, 255, 0.8)
            `,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-3 rounded-xl transition-all hover:scale-110"
            style={{ boxShadow: neomorphShadow.raised }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start gap-4 mb-4">
              {(() => {
                const imageUrl = getToolImage(tool, 128)
                return imageUrl ? (
                  <div
                    className="w-24 h-24 rounded-2xl flex items-center justify-center flex-shrink-0 p-3"
                    style={{ boxShadow: neomorphShadow.pressed }}
                  >
                    <img
                      src={imageUrl}
                      alt={tool.name}
                      className="w-full h-full object-contain"
                      onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}
                    />
                  </div>
                ) : null
              })()}
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold mb-2">{tool.name}</h2>
                {tool.shortDescription && (
                  <p className="text-lg text-muted-foreground mb-3">
                    {tool.shortDescription.replace(/^#+\s*/, '').replace(/\*\*/g, '')}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-medium">
                    {tool.mappedCategory || tool.category}
                  </span>
                  {tool.isVerified && <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700 font-medium">Verified</span>}
                  {tool.hasPrivacyPolicy && (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-gray-100 text-gray-600">
                      <Shield className="w-3 h-3" /> Privacy Policy
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm mb-4">
              {tool.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{tool.rating.toFixed(1)}</span>
                  {tool.reviewCount && tool.reviewCount > 0 && (
                    <span className="text-muted-foreground">({tool.reviewCount} reviews)</span>
                  )}
                </div>
              )}
              {tool.pricingModel && (
                <span className="px-3 py-1 rounded-lg font-medium" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed, color: '#22c55e' }}>
                  {tool.pricingModel}
                </span>
              )}
            </div>

            <a
              href={tool.affiliateURL || tool.visitURL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold hover:scale-[1.02] transition-transform"
              style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised, color: '#22c55e' }}
            >
              Visit Website
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Tags */}
          {tool.tags && tool.tags.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag, idx) => (
                  <span
                    key={`${tag}-${idx}`}
                    className="px-3 py-1 rounded-lg text-sm"
                    style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed, color: '#6b7280' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Pros & Cons */}
          {((tool.pros && tool.pros.length > 0) || (tool.cons && tool.cons.length > 0)) && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {tool.pros && tool.pros.length > 0 && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '2px solid rgba(34, 197, 94, 0.2)' }}>
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Pros
                  </h4>
                  <ul className="space-y-2 text-sm text-green-900">
                    {tool.pros.map((pro, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-green-500">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {tool.cons && tool.cons.length > 0 && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '2px solid rgba(239, 68, 68, 0.2)' }}>
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Cons
                  </h4>
                  <ul className="space-y-2 text-sm text-red-900">
                    {tool.cons.map((con, idx) => (
                      <li key={idx} className="flex gap-2">
                        <span className="text-red-500">✗</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Pricing Details */}
          {((tool.priceAmount && tool.priceAmount > 0) || tool.pricingModel || tool.hasFreeTrialDays || tool.verdict) && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '2px solid rgba(34, 197, 94, 0.15)' }}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" /> Pricing & Value
              </h3>
              <div className="space-y-2 text-sm">
                {tool.priceAmount && tool.priceAmount > 0 ? (
                  <p><strong>Starting at:</strong> {tool.priceCurrency || 'USD'} ${tool.priceAmount.toFixed(2)}/mo</p>
                ) : tool.pricingModel && (
                  <p><strong>Pricing:</strong> <span className="capitalize">{tool.pricingModel}</span></p>
                )}
                {tool.hasFreeTrialDays && (
                  <p><strong>Free Trial:</strong> {tool.hasFreeTrialDays} days</p>
                )}
                {tool.verdict && (
                  <p className="italic text-gray-700 mt-3 pt-3 border-t border-green-200">&ldquo;{tool.verdict}&rdquo;</p>
                )}
              </div>
            </div>
          )}

          {/* Best For / Not Recommended For */}
          {(tool.bestFor || tool.notRecommendedFor) && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {tool.bestFor && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '2px solid rgba(59, 130, 246, 0.2)' }}>
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4" /> Best For
                  </h4>
                  <p className="text-sm text-blue-900">{tool.bestFor}</p>
                </div>
              )}
              {tool.notRecommendedFor && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(156, 163, 175, 0.05)', border: '2px solid rgba(156, 163, 175, 0.2)' }}>
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" /> Not Recommended For
                  </h4>
                  <p className="text-sm text-gray-700">{tool.notRecommendedFor}</p>
                </div>
              )}
            </div>
          )}

          {/* Target Audience & Expertise */}
          {(tool.targetAudience || tool.skillLevel || tool.learningCurve) && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" /> Who It's For
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                {tool.targetAudience && tool.targetAudience.length > 0 && (
                  <div>
                    <p className="font-semibold mb-1">Target Audience</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.targetAudience.map((audience, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">{audience}</span>
                      ))}
                    </div>
                  </div>
                )}
                {tool.skillLevel && (
                  <div>
                    <p className="font-semibold mb-1">Skill Level</p>
                    <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs capitalize">{tool.skillLevel}</span>
                  </div>
                )}
                {tool.learningCurve && (
                  <div>
                    <p className="font-semibold mb-1">Learning Curve</p>
                    <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-xs capitalize">{tool.learningCurve}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Integrations & Platform */}
          {(tool.integrations || tool.operatingSystem || tool.platforms) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Code className="w-5 h-5" /> Technical Details
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {tool.integrations && tool.integrations.length > 0 && (
                  <div className="p-3 rounded-xl" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
                    <p className="font-semibold text-sm mb-2">Integrations</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.integrations.map((integration, idx) => (
                        <span key={idx} className="px-2 py-1 rounded-lg bg-white text-xs">{integration}</span>
                      ))}
                    </div>
                    {tool.apiAvailable && (
                      <p className="text-xs text-green-600 mt-2">✓ API Available</p>
                    )}
                  </div>
                )}
                {(tool.operatingSystem || tool.platforms) && (
                  <div className="p-3 rounded-xl" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
                    {tool.platforms && tool.platforms.length > 0 && (
                      <div className="mb-2">
                        <p className="font-semibold text-sm mb-1">Platforms</p>
                        <div className="flex flex-wrap gap-1">
                          {tool.platforms.map((platform, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-lg bg-white text-xs">{platform}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {tool.operatingSystem && tool.operatingSystem.length > 0 && (
                      <div>
                        <p className="font-semibold text-sm mb-1">OS</p>
                        <div className="flex flex-wrap gap-1">
                          {tool.operatingSystem.map((os, idx) => (
                            <span key={idx} className="px-2 py-1 rounded-lg bg-white text-xs">{os}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Company Info */}
          {(tool.companyFounded || tool.employeeCount || tool.fundingRaised || tool.notableCustomers) && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5" /> Company
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {tool.companyName && (
                  <div>
                    <p className="font-semibold">Company</p>
                    <p className="text-gray-700">{tool.companyName}</p>
                  </div>
                )}
                {tool.companyFounded && (
                  <div>
                    <p className="font-semibold">Founded</p>
                    <p className="text-gray-700">{tool.companyFounded}</p>
                  </div>
                )}
                {tool.employeeCount && (
                  <div>
                    <p className="font-semibold">Team Size</p>
                    <p className="text-gray-700">{tool.employeeCount} employees</p>
                  </div>
                )}
                {tool.fundingRaised && (
                  <div>
                    <p className="font-semibold">Funding</p>
                    <p className="text-gray-700">{tool.fundingRaised}</p>
                  </div>
                )}
                {tool.notableCustomers && tool.notableCustomers.length > 0 && (
                  <div className="md:col-span-2">
                    <p className="font-semibold mb-1">Notable Customers</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.notableCustomers.map((customer, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">{customer}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trust & Security */}
          {(tool.gdprCompliant || tool.securityFeatures && tool.securityFeatures.length > 0) && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: 'rgba(34, 197, 94, 0.05)', border: '2px solid rgba(34, 197, 94, 0.15)' }}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" /> Trust & Security
              </h3>
              <div className="flex flex-wrap gap-2 text-sm">
                {tool.hasPrivacyPolicy && (
                  <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700">✓ Privacy Policy</span>
                )}
                {tool.gdprCompliant && (
                  <span className="px-3 py-1 rounded-lg bg-green-100 text-green-700">✓ GDPR Compliant</span>
                )}
                {tool.securityFeatures && tool.securityFeatures.map((feature, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-lg bg-gray-100 text-gray-700">{feature}</span>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives */}
          {tool.alternatives && tool.alternatives.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" /> Alternatives
              </h3>
              <div className="flex flex-wrap gap-2">
                {tool.alternatives.map((alt, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-lg text-sm"
                    style={{ background: '#F0F0F3', boxShadow: neomorphShadow.raised }}
                  >
                    {alt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Support & Documentation */}
          {(tool.supportOptions || tool.documentationQuality) && (
            <div className="mb-6 p-4 rounded-xl" style={{ background: '#F0F0F3', boxShadow: neomorphShadow.pressed }}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Award className="w-5 h-5" /> Support
              </h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                {tool.supportOptions && tool.supportOptions.length > 0 && (
                  <div>
                    <p className="font-semibold mb-2">Support Channels</p>
                    <div className="flex flex-wrap gap-1">
                      {tool.supportOptions.map((option, idx) => (
                        <span key={idx} className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">{option}</span>
                      ))}
                    </div>
                  </div>
                )}
                {tool.documentationQuality && (
                  <div>
                    <p className="font-semibold mb-1">Documentation</p>
                    <span className="px-2 py-1 rounded bg-purple-100 text-purple-700 text-xs capitalize">{tool.documentationQuality}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description with Markdown */}
          {tool.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">About</h3>
              <div className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ node, ...props }) => <h3 className="text-lg font-bold text-gray-900 mt-4 mb-2" {...props} />,
                    h2: ({ node, ...props }) => <h4 className="text-base font-bold text-gray-800 mt-3 mb-2" {...props} />,
                    h3: ({ node, ...props }) => <h5 className="text-sm font-bold text-gray-800 mt-2 mb-1" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-3" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-gray-900" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 mb-3" {...props} />,
                    li: ({ node, ...props }) => <li className="ml-2" {...props} />,
                    a: ({ node, ...props }) => <a className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />,
                  }}
                >
                  {tool.description}
                </ReactMarkdown>
              </div>
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  )
}
