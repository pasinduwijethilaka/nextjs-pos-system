'use client'

import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

interface SalesChartProps {
  chartData: { date: string; Sales: number }[]
}

export default function SalesChart({ chartData }: SalesChartProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl mb-8">
      <h2 className="text-lg font-bold text-white mb-4">Sales Analytics Flow</h2>
      <div className="h-64 w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            No Sales Data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  color: '#fff',
                }}
              />
              <Bar dataKey="Sales" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}