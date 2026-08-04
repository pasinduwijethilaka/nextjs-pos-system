'use client'

import React, { useState, useEffect } from 'react'
import { ReceiptSettings } from '@/types'
import { Settings, Store, MessageSquare, Eye, Save, CheckCircle2 } from 'lucide-react'

const DEFAULT_SETTINGS: ReceiptSettings = {
  storeName: 'SMART POS STORE',
  storeAddress: 'No. 123, Main Street, Colombo',
  storePhone: '+94 77 123 4567',
  showOriginalPrice: true,
  showSavingsBanner: true,
  footerMessage: 'Thank You For Shopping With Us! Please Come Again.',
}

export default function ReceiptSettingsControl() {
  const [formData, setFormData] = useState<ReceiptSettings>(DEFAULT_SETTINGS)
  const [isSaved, setIsSaved] = useState(false)

  // Page එක Load වෙද්දී LocalStorage එකෙන් Settings ලබා ගැනීම
  useEffect(() => {
    const saved = localStorage.getItem('pos_receipt_settings')
    if (saved) {
      try {
        setFormData(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse settings', e)
      }
    }
  }, [])

  const handleChange = (key: keyof ReceiptSettings, value: any) => {
    const updated = { ...formData, [key]: value }
    setFormData(updated)
  }

  // Save Button එක Click කළ විට LocalStorage එකට Save කිරීම
  const handleSave = () => {
    localStorage.setItem('pos_receipt_settings', JSON.stringify(formData))
    // Storage event එක Trigger කර මුළු App එකටම Dynamic Alert යැවීම
    window.dispatchEvent(new Event('storage'))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white max-w-lg shadow-xl my-4">
      <div className="flex items-center justify-between mb-6 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-sky-400" />
          <h3 className="text-lg font-bold">Receipt Customizer (Admin Settings)</h3>
        </div>
        {isSaved && (
          <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-4 h-4" /> Saved!
          </span>
        )}
      </div>

      <div className="space-y-4 text-xs">
        {/* Store Info Inputs */}
        <div className="space-y-3">
          <p className="font-semibold text-sky-400 flex items-center gap-1.5">
            <Store className="w-4 h-4" /> Store Details
          </p>

          <div>
            <label className="block text-slate-400 mb-1">Store Name</label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => handleChange('storeName', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 mb-1">Address</label>
              <input
                type="text"
                value={formData.storeAddress}
                onChange={(e) => handleChange('storeAddress', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.storePhone}
                onChange={(e) => handleChange('storePhone', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-sky-500"
              />
            </div>
          </div>
        </div>

        <hr className="border-slate-800 my-4" />

        {/* Customer Satisfaction Display Options */}
        <div className="space-y-3">
          <p className="font-semibold text-sky-400 flex items-center gap-1.5">
            <Eye className="w-4 h-4" /> Customer Bill Display Options
          </p>

          <label className="flex items-center justify-between cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition">
            <div>
              <span className="font-semibold text-slate-200 block">Show Original Regular Price</span>
              <span className="text-[10px] text-slate-500">Shows strike-through price (Reg: LKR 1000)</span>
            </div>
            <input
              type="checkbox"
              checked={formData.showOriginalPrice}
              onChange={(e) => handleChange('showOriginalPrice', e.target.checked)}
              className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer bg-slate-950 p-3 rounded-xl border border-slate-800 hover:border-slate-700 transition">
            <div>
              <span className="font-semibold text-emerald-400 block">Show "YOU SAVED LKR XX" Banner</span>
              <span className="text-[10px] text-slate-500">Boosts customer satisfaction at bottom</span>
            </div>
            <input
              type="checkbox"
              checked={formData.showSavingsBanner}
              onChange={(e) => handleChange('showSavingsBanner', e.target.checked)}
              className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
            />
          </label>
        </div>

        <hr className="border-slate-800 my-4" />

        {/* Footer Message */}
        <div>
          <label className="block text-slate-400 mb-1 flex items-center gap-1.5 font-semibold text-sky-400">
            <MessageSquare className="w-4 h-4" /> Footer Note / Message
          </label>
          <input
            type="text"
            value={formData.footerMessage}
            onChange={(e) => handleChange('footerMessage', e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-sky-500"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full mt-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition"
        >
          <Save className="w-4 h-4" /> Save Receipt Settings
        </button>
      </div>
    </div>
  )
}