'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

const SECTION_ORDER = [
  'summary',
  'target-audience',
  'market-size',
  'competitors',
  'mvp',
  'business-model',
  'risks',
  'roadmap',
  'brand',
  'vision',
  'budget',
]

const SECTION_LABELS: Record<string, string> = {
  summary: 'ملخص',
  'target-audience': 'العملاء',
  'market-size': 'حجم السوق',
  competitors: 'المنافسون',
  mvp: 'MVP',
  'business-model': 'نموذج العمل',
  risks: 'المخاطر',
  roadmap: 'خطة العمل',
  brand: 'الماركة',
  vision: 'الرؤية والمهمة',
  budget: 'الميزانية',
}

interface SectionPaginationProps {
  currentSection: string
  onNavigate: (id: string) => void
}

export default function SectionPagination({ currentSection, onNavigate }: SectionPaginationProps) {
  const idx = SECTION_ORDER.indexOf(currentSection)
  const prev = idx > 0 ? SECTION_ORDER[idx - 1] : null
  const next = idx < SECTION_ORDER.length - 1 ? SECTION_ORDER[idx + 1] : null

  if (!prev && !next) return null

  return (
    <div className="flex items-center justify-center gap-6 pt-8 pb-4 border-t border-gray-100 mt-8">
      {prev ? (
        <button
          onClick={() => onNavigate(prev)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition"
        >
          <ChevronRight className="w-4 h-4" />
          الصفحة السابقة
        </button>
      ) : (
        <div className="w-32" />
      )}

      <span className="text-xs text-gray-300">
        {idx + 1} / {SECTION_ORDER.length}
      </span>

      {next ? (
        <button
          onClick={() => onNavigate(next)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition"
        >
          الصفحة التالية
          <ChevronLeft className="w-4 h-4" />
        </button>
      ) : (
        <div className="w-32" />
      )}
    </div>
  )
}
