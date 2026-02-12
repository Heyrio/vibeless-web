'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface User {
  id: string
  email: string
  name: string
  apiKey: string
}

interface Session {
  id: string
  title: string
  summary: string | null
  duration: number | null
  createdAt: string
  learningMoments: { id: string; type: string; content: string }[]
  flashcards: { id: string }[]
}

interface Flashcard {
  id: string
  front: string
  back: string
  category: string | null
  nextReview: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
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

    fetch('/api/sessions', { headers: { 'x-api-key': userData.apiKey } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setSessions(data) })
      .catch(() => {})

    fetch('/api/flashcards', { headers: { 'x-api-key': userData.apiKey } })
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setFlashcards(data) })
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

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    return mins > 0 ? `${mins}m` : `${seconds}s`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  }

  const totalLearnings = sessions.reduce((sum, s) => sum + s.learningMoments.length, 0)
  const dueFlashcards = flashcards.filter(f => new Date(f.nextReview) <= new Date()).length

  if (!user) return null

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-semibold text-white">Vibeless</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">{user.email}</span>
            <Button variant="ghost" size="sm" onClick={logout} className="text-slate-400 hover:text-white">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">{sessions.length}</div>
              <p className="text-sm text-slate-400">Sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800 cursor-pointer hover:border-slate-700 transition" onClick={() => router.push('/review')}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-400">{dueFlashcards}</div>
              <p className="text-sm text-slate-400">Due for review</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">{totalLearnings}</div>
              <p className="text-sm text-slate-400">Things learned</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-white">{flashcards.length}</div>
              <p className="text-sm text-slate-400">Total flashcards</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Sessions */}
          <div className="md:col-span-2">
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-white">Recent Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                {sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </div>
                    <p className="text-slate-400 text-sm">No sessions yet</p>
                    <p className="text-slate-500 text-xs mt-1">Start a session with the desktop app</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400">Session</TableHead>
                        <TableHead className="text-slate-400">Duration</TableHead>
                        <TableHead className="text-slate-400">Learnings</TableHead>
                        <TableHead className="text-slate-400">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sessions.slice(0, 5).map((session) => (
                        <TableRow key={session.id} className="border-slate-800">
                          <TableCell>
                            <div className="font-medium text-white text-sm">{session.title}</div>
                            {session.summary && (
                              <div className="text-slate-500 text-xs truncate max-w-xs">{session.summary}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-slate-300 text-sm">{formatDuration(session.duration)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="bg-slate-800 text-slate-300 hover:bg-slate-800">
                              {session.learningMoments.length}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-slate-400 text-sm">{formatDate(session.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {/* Learnings */}
            {totalLearnings > 0 && (
              <Card className="bg-slate-900 border-slate-800 mt-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium text-white">Recent Learnings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sessions.flatMap(s => s.learningMoments).slice(0, 5).map((lm) => (
                    <div key={lm.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/50 group">
                      <Badge variant="outline" className={`text-xs shrink-0 ${
                        lm.type === 'concept' ? 'border-blue-500/50 text-blue-400' :
                        lm.type === 'tip' ? 'border-green-500/50 text-green-400' :
                        lm.type === 'error_fix' ? 'border-red-500/50 text-red-400' :
                        'border-slate-500/50 text-slate-400'
                      }`}>
                        {lm.type}
                      </Badge>
                      <p className="text-sm text-slate-300 flex-1">{lm.content}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-white h-7 px-2"
                        onClick={async () => {
                          const front = prompt('Flashcard question:', `What is ${lm.type}?`)
                          if (!front) return
                          const back = prompt('Answer:', lm.content)
                          if (!back) return
                          try {
                            await fetch('/api/flashcards/from-learning', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json', 'x-api-key': user?.apiKey || '' },
                              body: JSON.stringify({ learningId: lm.id, front, back, category: lm.type })
                            })
                            window.location.reload()
                          } catch (e) { console.error(e) }
                        }}
                      >
                        + Card
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* API Key */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-white">Connect Desktop App</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400 mb-3">
                  Copy this key to the Vibeless desktop app settings.
                </p>
                <div className="flex gap-2">
                  <code className="flex-1 text-xs bg-slate-800 px-3 py-2 rounded-md text-slate-300 font-mono truncate">
                    {user.apiKey}
                  </code>
                  <Button size="sm" variant="secondary" onClick={copyApiKey} className="shrink-0 bg-slate-800 hover:bg-slate-700 text-white">
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            {dueFlashcards > 0 && (
              <Card className="bg-blue-600/10 border-blue-500/20">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-white">{dueFlashcards} cards due</div>
                      <p className="text-xs text-slate-400">Ready for review</p>
                    </div>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => router.push('/review')}>
                    Start Review
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
