'use client'

import React, { useState } from 'react'
import { Lock, KeyRound, ShieldAlert } from 'lucide-react'

interface AdminAuthModalProps {
  isOpen: boolean
  onSuccess: () => void
  onCancel: () => void
}

// 🔑 Admin Passcode එක (ඔයාට කැමති PIN එකක් මෙතනට දාන්න පුළුවන්)
const ADMIN_PIN = '1234'

export default function AdminAuthModal({ isOpen, onSuccess, onCancel }: AdminAuthModalProps) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === ADMIN_PIN) {
      setError(false)
      setPin('')
      onSuccess()
    } else {
      setError(true)
      setPin('')
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center">
        <div className="w-16 h-16 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-sky-500/20">
          <Lock className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-1">Admin Access Required</h2>
        <p className="text-slate-400 text-sm mb-6">Enter the 4-digit PIN to access Admin Dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <KeyRound className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="Enter PIN (Default: 1234)"
              className="w-full bg-slate-950 border border-slate-800 text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-sky-500 font-mono tracking-widest text-center text-lg transition"
              autoFocus
            />
          </div>

          {error && (
            <div className="flex items-center justify-center gap-2 text-red-400 text-xs font-semibold bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              <ShieldAlert className="w-4 h-4" /> Incorrect Passcode! Try again.
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl transition text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl transition text-sm shadow-lg shadow-sky-500/20"
            >
              Unlock Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}