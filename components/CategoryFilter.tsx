'use client'

import React from 'react'
import { Category } from '@/types'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategory: number | null
  setSelectedCategory: (id: number | null) => void
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-none mb-4">
      <button
        onClick={() => setSelectedCategory(null)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
          selectedCategory === null
            ? 'bg-sky-500 text-slate-950 font-semibold'
            : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
        }`}
      >
        All Products
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => setSelectedCategory(cat.id)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
            selectedCategory === cat.id
              ? 'bg-sky-500 text-slate-950 font-semibold'
              : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}