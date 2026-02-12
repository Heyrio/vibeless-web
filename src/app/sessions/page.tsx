'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Session {
  id: string
  title?: string
  summary?: string
  duration?: number
  createdAt: string
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const key = localStorage.getItem('vibeless_api_key')
    if (!key) {
      router.push('/')
      return
    }

    fetch('/api/sessions', {
      headers: { 'x-api-key': key }
    })
      .then(res => res.json())
      .then(data => {
        setSessions(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    return `${mins} min`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold hover:text-blue-400">
            ← Vibeless
          </Link>
          <span className="text-gray-400">Sessions</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold mb-6">Coding Sessions</h2>

        {sessions.length === 0 ? (
          <div className="text-center py-20 bg-[#12121a] rounded-2xl border border-gray-800">
            <div className="text-6xl mb-4">💻</div>
            <h3 className="text-xl font-semibold mb-2">No sessions yet</h3>
            <p className="text-gray-400">
              Start using the Vibeless desktop app to record your coding sessions.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-[#12121a] rounded-xl p-6 border border-gray-800 hover:border-gray-700 transition"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">
                    {session.title || 'Untitled Session'}
                  </h3>
                  <span className="text-sm text-gray-500">
                    {formatDate(session.createdAt)}
                  </span>
                </div>
                {session.summary && (
                  <p className="text-gray-400 text-sm mb-3">{session.summary}</p>
                )}
                <div className="text-sm text-gray-500">
                  Duration: {formatDuration(session.duration)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
