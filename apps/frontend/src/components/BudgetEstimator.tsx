'use client';

import { useState } from 'react';
import type { BudgetEstimate } from '@/../../apps/backend/src/agents/budget-estimator.agent';

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

const SCENARIO_COLORS = {
  conservative: 'text-yellow-400',
  realistic: 'text-blue-400',
  optimistic: 'text-green-400',
};

export default function BudgetEstimator({ data }: { data: BudgetEstimate }) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const currency = data.currency || 'USD';

  const maxRevenue = Math.max(...data.revenueProjections.map((r) => r.optimistic));

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Monthly Burn', value: formatCurrency(data.totalMonthlyBurn, currency), icon: '🔥', color: 'text-red-400' },
          { label: 'Setup Cost', value: formatCurrency(data.totalSetupCost, currency), icon: '🚀', color: 'text-purple-400' },
          { label: 'Funding Required', value: formatCurrency(data.fundingRequired, currency), icon: '💰', color: 'text-yellow-400' },
          { label: 'Break-even Month', value: `Month ${data.breakEvenMonth}`, icon: '📈', color: 'text-green-400' },
        ].map((m) => (
          <div key={m.label} className="bg-gray-800 rounded-xl p-4 border border-gray-700">
            <div className="text-2xl mb-1">{m.icon}</div>
            <div className={`text-xl font-bold ${m.color}`}>{m.value}</div>
            <div className="text-xs text-gray-400 mt-1">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Budget Categories */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h3 className="font-semibold text-white">Budget Breakdown</h3>
        </div>
        <div className="divide-y divide-gray-700">
          {data.categories.map((cat) => {
            const isOpen = expandedCategory === cat.category;
            const totalBurn = data.categories.reduce((s, c) => s + c.totalMonthly, 0);
            const pct = totalBurn > 0 ? Math.round((cat.totalMonthly / totalBurn) * 100) : 0;

            return (
              <div key={cat.category}>
                <button
                  onClick={() => setExpandedCategory(isOpen ? null : cat.category)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-gray-750 transition-colors text-left"
                >
                  <span className="text-xl">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-white">{cat.category}</span>
                      <div className="flex items-center gap-4 text-sm">
                        {cat.totalOneTime > 0 && (
                          <span className="text-gray-400">
                            {formatCurrency(cat.totalOneTime, currency)} <span className="text-xs">one-time</span>
                          </span>
                        )}
                        <span className="text-blue-400 font-semibold">
                          {formatCurrency(cat.totalMonthly, currency)}<span className="text-xs text-gray-400">/mo</span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{pct}% of monthly burn</div>
                  </div>
                  <span className="text-gray-400 text-sm">{isOpen ? '▲' : '▼'}</span>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 bg-gray-900/50">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-xs border-b border-gray-700">
                          <th className="text-left py-2">Item</th>
                          <th className="text-right py-2">Monthly</th>
                          <th className="text-right py-2">One-time</th>
                          <th className="text-left py-2 pl-4">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800">
                        {cat.items.map((item) => (
                          <tr key={item.name} className="text-gray-300">
                            <td className="py-2">{item.name}</td>
                            <td className="text-right py-2 text-blue-400">
                              {item.monthlyCost > 0 ? formatCurrency(item.monthlyCost, currency) : '—'}
                            </td>
                            <td className="text-right py-2 text-purple-400">
                              {item.oneTimeCost > 0 ? formatCurrency(item.oneTimeCost, currency) : '—'}
                            </td>
                            <td className="py-2 pl-4 text-gray-500 text-xs">{item.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenue Projections */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
        <h3 className="font-semibold text-white mb-4">Revenue Projections</h3>
        <div className="flex gap-4 text-xs mb-4">
          {(['conservative', 'realistic', 'optimistic'] as const).map((s) => (
            <span key={s} className={`flex items-center gap-1 ${SCENARIO_COLORS[s]}`}>
              <span className="w-2 h-2 rounded-full bg-current inline-block" />
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </span>
          ))}
        </div>
        <div className="space-y-6">
          {data.revenueProjections.map((proj) => (
            <div key={proj.year}>
              <div className="text-sm text-gray-400 mb-2">Year {proj.year}</div>
              {(['conservative', 'realistic', 'optimistic'] as const).map((scenario) => {
                const val = proj[scenario];
                const pct = maxRevenue > 0 ? (val / maxRevenue) * 100 : 0;
                return (
                  <div key={scenario} className="flex items-center gap-3 mb-1.5">
                    <div className="w-24 text-xs text-gray-500 capitalize">{scenario}</div>
                    <div className="flex-1 h-5 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          scenario === 'conservative' ? 'bg-yellow-500' :
                          scenario === 'realistic' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className={`text-sm font-medium w-24 text-right ${SCENARIO_COLORS[scenario]}`}>
                      {formatCurrency(val, currency)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
          <p className="text-gray-300 text-sm leading-relaxed">{data.summary}</p>
        </div>
      )}
    </div>
  );
}
