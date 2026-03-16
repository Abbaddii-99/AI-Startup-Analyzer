'use client'

import { Palette, Type, MessageSquare, Sparkles, BookOpen } from 'lucide-react'

interface BrandColor {
  name: string
  hex: string
  usage: string
}

interface BrandIdentityData {
  suggestedNames: Array<{ name: string; reason: string }>
  tagline: string
  colors: BrandColor[]
  typography: { primary: string; secondary: string }
  toneOfVoice: string[]
  brandPersonality: string[]
  logoStyle: string
  brandStory: string
}

export default function BrandIdentity({ data }: { data: BrandIdentityData }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-pink-500" />
        <h2 className="text-lg font-bold text-gray-800">Brand Identity</h2>
      </div>

      {/* Suggested Names */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> Suggested Names
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          {data.suggestedNames?.map((n, i) => (
            <div key={i} className={`rounded-xl p-4 border ${i === 0 ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200' : 'bg-gray-50 border-gray-100'}`}>
              <div className="flex items-center gap-2 mb-1">
                {i === 0 && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Recommended</span>}
              </div>
              <p className={`font-bold text-lg ${i === 0 ? 'text-blue-700' : 'text-gray-700'}`}>{n.name}</p>
              <p className="text-xs text-gray-500 mt-1">{n.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tagline */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 border border-pink-200 rounded-xl p-4 text-center">
        <p className="text-xs text-gray-400 mb-1">Tagline</p>
        <p className="text-xl font-bold text-gray-800 italic">"{data.tagline}"</p>
      </div>

      {/* Colors */}
      <div>
        <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
          <Palette className="w-3.5 h-3.5 text-pink-500" /> Brand Colors
        </h3>
        <div className="flex flex-wrap gap-3">
          {data.colors?.map((c, i) => (
            <div key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl p-3 flex-1 min-w-[160px]">
              <div
                className="w-12 h-12 rounded-xl shadow-md shrink-0 border border-white"
                style={{ backgroundColor: c.hex }}
              />
              <div>
                <p className="font-semibold text-sm text-gray-800">{c.name}</p>
                <p className="text-xs text-gray-400 font-mono">{c.hex}</p>
                <p className="text-xs text-gray-500 mt-0.5">{c.usage}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {/* Typography */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
            <Type className="w-3.5 h-3.5 text-blue-500" /> Typography
          </h3>
          <div className="space-y-2">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Primary Font</p>
              <p className="text-sm font-medium text-gray-700">{data.typography?.primary}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">Secondary Font</p>
              <p className="text-sm font-medium text-gray-700">{data.typography?.secondary}</p>
            </div>
          </div>
        </div>

        {/* Tone of Voice */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-green-500" /> Tone of Voice
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.toneOfVoice?.map((t, i) => (
              <span key={i} className="text-xs bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded-full font-medium">
                {t}
              </span>
            ))}
          </div>
          <h3 className="text-sm font-semibold text-gray-600 mt-4 mb-2">Brand Personality</h3>
          <div className="flex flex-wrap gap-2">
            {data.brandPersonality?.map((p, i) => (
              <span key={i} className="text-xs bg-purple-50 border border-purple-200 text-purple-700 px-3 py-1 rounded-full font-medium">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Logo Style */}
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
        <p className="text-xs font-semibold text-gray-500 mb-1">Logo Style Recommendation</p>
        <p className="text-sm text-gray-700">{data.logoStyle}</p>
      </div>

      {/* Brand Story */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-4 h-4 text-yellow-400" />
          <h3 className="font-bold text-white text-sm">Brand Story</h3>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{data.brandStory}</p>
      </div>
    </div>
  )
}
