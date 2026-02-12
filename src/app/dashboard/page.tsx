'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface User {
  id: string
  email: string
  name: string
  apiKey: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [dueCount, setDueCount] = useState(0)
  const [copied, setCopied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('vibeless_user')
    if (!stored) {
      router.push('/')
      return
    }
    const userData = JSON.parse(stored)
    setUser(userData)

    // Fetch due flashcards count
    fetch('/api/flashcards', {
      headers: { 'x-api-key': userData.apiKey }
    })
      .then(res => res.json())
      .then(cards => setDueCount(Array.isArray(cards) ? cards.length : 0))
      .catch(() => {})
  }, [router])

  const copyApiKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const logout = () => {
    localStorage.removeItem('vibeless_user')
    localStorage.removeItem('vibeless_api_key')
    router.push('/')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-gray-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Vibeless</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-400">{user.email}</span>
            <button onClick={logout} className="text-gray-400 hover:text-white">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-semibold mb-8">Welcome back{user.name ? `, ${user.name}` : ''}!</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Flashcards Due */}
          <Link href="/review" className="bg-[#12121a] rounded-xl p-6 border border-gray-800 hover:border-blue-500 transition">
            <div className="text-4xl font-bold text-blue-400 mb-2">{dueCount}</div>
            <div className="text-gray-400">Flashcards due for review</div>
            <div className="mt-4 text-blue-400 text-sm">Start Review →</div>
          </Link>

          {/* Sessions */}
          <Link href="/sessions" className="bg-[#12121a] rounded-xl p-6 border border-gray-800 hover:border-blue-500 transition">
            <div className="text-4xl font-bold text-green-400 mb-2">-</div>
            <div className="text-gray-400">Coding sessions</div>
            <div className="mt-4 text-green-400 text-sm">View History →</div>
          </Link>

          {/* Learning Moments */}
          <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
            <div className="text-4xl font-bold text-purple-400 mb-2">-</div>
            <div className="text-gray-400">Things learned</div>
            <div className="mt-4 text-purple-400 text-sm">Coming soon</div>
          </div>
        </div>

        {/* API Key Section */}
        <div className="bg-[#12121a] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold mb-4">Connect Desktop App</h3>
          <p className="text-gray-400 mb-4">
            Use this API key in the Vibeless desktop app to sync your sessions and flashcards.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#1a1a24] px-4 py-3 rounded-lg text-sm font-mono text-gray-300 overflow-hidden">
              {user.apiKey}
            </code>
            <button
              onClick={copyApiKey}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
