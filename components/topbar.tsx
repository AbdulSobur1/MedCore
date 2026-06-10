'use client'

import { useState } from 'react'
import { Bell, Search, User, X } from 'lucide-react'

export function Topbar({ userName = 'Dr. Sarah Johnson', userRole = 'Doctor' }: { userName?: string; userRole?: string }) {
  const [showNotifications, setShowNotifications] = useState(false)

  return (
    <header className="bg-[--surface] border-b border-[--border] h-14 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Search Bar */}
      <div className="hidden sm:block relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[--text-3]" />
        <input
          type="text"
          placeholder="Search..."
          className="w-[240px] bg-[--surface-2] rounded-lg pl-8 pr-3 py-1.5 text-[13px] text-[--text-1] placeholder:text-[--text-3] outline-none"
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-lg hover:bg-[--surface-2] transition-colors"
          >
            <Bell className="w-4 h-4 text-[--text-2]" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-[--danger] rounded-full" />
          </button>
          {showNotifications && (
            <>
              <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-[--surface] border border-[--border] rounded-xl p-4 top-full z-50">
                <h3 className="text-[13px] font-semibold text-[--text-1] mb-3">Notifications</h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-[--surface-2]">
                    <p className="text-[13px] font-medium text-[--text-1]">New appointment</p>
                    <p className="caption">John Doe requested appointment</p>
                  </div>
                  <div className="p-3 rounded-lg bg-[--surface-2]">
                    <p className="text-[13px] font-medium text-[--text-1]">Prescription ready</p>
                    <p className="caption">Jane Smith&apos;s prescription is ready</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 border-l border-[--border] pl-3">
          <div className="text-right hidden sm:block">
            <p className="text-[13px] font-medium text-[--text-1]">{userName}</p>
            <p className="caption">{userRole}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[--accent-soft] flex items-center justify-center text-[--accent] font-semibold text-[13px]">
            {userName.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  )
}
