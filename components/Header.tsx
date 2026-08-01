'use client'

import React from 'react'
import { Search } from 'lucide-react'

interface HeaderProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
}

export default function Header({ searchQuery, setSearchQuery }: HeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6 gap-4">
      <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
        <span className="bg-sky-500 text-slate-950 px-2.5 py-1 rounded-lg text-lg font-black">
          POS
        </span>{' '}
        Terminal
      </h1>

      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name or barcode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-sky-500 transition"
        />
      </div>
    </div>
  )
}