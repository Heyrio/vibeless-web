'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  BookOpen,
  Layers,
  Clock,
  ArrowRight,
  Copy,
  Check,
  Zap,
  TrendingUp,
} from 'lucide-react'

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
  const totalFlashcards = flashcards.length

  if (!user) return null

  return (
    <div className="p-8">

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sessions</p>
                <p className="text-3xl font-semibold mt-1">{sessions.length}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Things Learned</p>
                <p className="text-3xl font-semibold mt-1">{totalLearnings}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Flashcards</p>
                <p className="text-3xl font-semibold mt-1">{totalFlashcards}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                <Layers className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-chart-1/20 bg-chart-1/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due for Review</p>
                <p className="text-3xl font-semibold mt-1">{dueFlashcards}</p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-chart-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Review Prompt */}
          {dueFlashcards > 0 && (
            <Card className="border-chart-1/20 bg-chart-1/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-chart-1/10 flex items-center justify-center">
                      <Zap className="h-6 w-6 text-chart-1" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{dueFlashcards} cards ready for review</h3>
                      <p className="text-sm text-muted-foreground">
                        Keep your knowledge fresh with spaced repetition
                      </p>
                    </div>
                  </div>
                  <Button onClick={() => router.push('/review')}>
                    Start Review
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Sessions */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-base font-medium">Recent Sessions</CardTitle>
              <Link href="/sessions">
                <Button variant="ghost" size="sm" className="text-muted-foreground">
                  View all
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium mb-1">No sessions yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start a session with the desktop app to begin learning
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 4).map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{session.title}</p>
                        {session.summary && (
                          <p className="text-sm text-muted-foreground truncate mt-0.5">
                            {session.summary}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <Badge variant="secondary" className="shrink-0">
                          {session.learningMoments.length} learnings
                        </Badge>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDuration(session.duration)}
                        </span>
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                          {formatDate(session.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Learnings */}
          {totalLearnings > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-4">
                <CardTitle className="text-base font-medium">Recent Learnings</CardTitle>
                <Link href="/learnings">
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    View all
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions
                    .flatMap(s => s.learningMoments)
                    .slice(0, 4)
                    .map((lm) => (
                      <div
                        key={lm.id}
                        className="flex items-start gap-3 p-4 rounded-lg bg-muted/50"
                      >
                        <Badge
                          variant="outline"
                          className={
                            lm.type === 'concept'
                              ? 'border-chart-1/50 text-chart-1 bg-chart-1/10'
                              : lm.type === 'tip'
                              ? 'border-chart-2/50 text-chart-2 bg-chart-2/10'
                              : lm.type === 'error_fix'
                              ? 'border-chart-4/50 text-chart-4 bg-chart-4/10'
                              : 'border-chart-5/50 text-chart-5 bg-chart-5/10'
                          }
                        >
                          {lm.type.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm flex-1">{lm.content}</p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Connect App */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Connect Desktop App</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Copy this API key to the Vibeless desktop app to sync your sessions.
              </p>
              <div className="flex gap-2">
                <code className="flex-1 text-xs bg-muted px-3 py-2.5 rounded-md font-mono truncate">
                  {user.apiKey}
                </code>
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={copyApiKey}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Study Progress */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Study Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Cards Reviewed</span>
                  <span className="font-medium">
                    {totalFlashcards - dueFlashcards} / {totalFlashcards}
                  </span>
                </div>
                <Progress
                  value={totalFlashcards > 0 ? ((totalFlashcards - dueFlashcards) / totalFlashcards) * 100 : 0}
                  className="h-2"
                />
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Concepts</span>
                  <span>
                    {sessions.flatMap(s => s.learningMoments).filter(l => l.type === 'concept').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Tips</span>
                  <span>
                    {sessions.flatMap(s => s.learningMoments).filter(l => l.type === 'tip').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Error Fixes</span>
                  <span>
                    {sessions.flatMap(s => s.learningMoments).filter(l => l.type === 'error_fix').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-muted-foreground">Patterns</span>
                  <span>
                    {sessions.flatMap(s => s.learningMoments).filter(l => l.type === 'pattern').length}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => router.push('/review')}
              >
                <Layers className="mr-2 h-4 w-4" />
                Review Flashcards
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => router.push('/learnings')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Learnings
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={() => router.push('/sessions')}
              >
                <Clock className="mr-2 h-4 w-4" />
                View Sessions
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
