'use client'

import { Eye, Target, Star, Zap, Mic } from 'lucide-react'

interface VisionMissionData {
  vision: string
  mission: string
  values: string[]
  uniqueValueProposition: string
  elevatorPitch: string
}

export default function VisionMission({ data }: { data: VisionMissionData }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-bold text-gray-800">Vision & Mission</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Vision */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-blue-800">رؤية / Vision</h3>
          </div>
          <p className="text-sm text-blue-700 leading-relaxed">{data.vision}</p>
        </div>

        {/* Mission */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-bold text-purple-800">مهمة / Mission</h3>
          </div>
          <p className="text-sm text-purple-700 leading-relaxed">{data.mission}</p>
        </div>
      </div>

      {/* UVP */}
      <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-orange-500" />
          <h3 className="font-bold text-orange-800 text-sm">Unique Value Proposition</h3>
        </div>
        <p className="text-sm text-orange-700 font-medium">{data.uniqueValueProposition}</p>
      </div>

      {/* Values */}
      {data.values?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-2 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-yellow-500" /> Core Values
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.values.map((v, i) => (
              <span key={i} className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-medium px-3 py-1 rounded-full">
                {v}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Elevator Pitch */}
      <div className="bg-gray-900 rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Mic className="w-4 h-4 text-green-400" />
          <h3 className="font-bold text-white text-sm">Elevator Pitch</h3>
          <span className="text-xs text-gray-400">30 seconds</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed italic">"{data.elevatorPitch}"</p>
      </div>
    </div>
  )
}
