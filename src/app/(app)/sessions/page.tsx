'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Search,
  Clock,
  BookOpen,
  Layers,
  Calendar,
  ChevronRight,
} from 'lucide-react'

interface LearningMoment {
  id: string
  type: string
  content: string
}

interface Session {
  id: string
  title: string
  summary: string | null
  duration: number | null
  createdAt: string
  learningMoments: LearningMoment[]
  flashcards: { id: string }[]
}

export default function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
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

  const filteredSessions = sessions.filter(s =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.summary?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const hrs = Math.floor(mins / 60)
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}m`
    }
    return `${mins}m`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0)
  const totalLearnings = sessions.reduce((sum, s) => sum + s.learningMoments.length, 0)
  const totalFlashcards = sessions.reduce((sum, s) => sum + s.flashcards.length, 0)

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
        <p className="text-muted-foreground">
          Your coding session history and learnings
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{formatDuration(totalDuration)}</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{totalLearnings}</p>
                <p className="text-sm text-muted-foreground">Learnings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Layers className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{totalFlashcards}</p>
                <p className="text-sm text-muted-foreground">Flashcards</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Sessions List */}
      {filteredSessions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">
              {sessions.length === 0 ? 'No sessions yet' : 'No results found'}
            </p>
            <p className="text-sm text-muted-foreground">
              {sessions.length === 0
                ? 'Start using the Vibeless desktop app to record your coding sessions'
                : 'Try adjusting your search'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session) => (
            <Card key={session.id} className="overflow-hidden">
              <CardContent className="p-0">
                <button
                  onClick={() => setExpandedSession(
                    expandedSession === session.id ? null : session.id
                  )}
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium truncate">{session.title || 'Untitled Session'}</h3>
                      </div>
                      {session.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {session.summary}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(session.duration)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(session.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant="secondary">
                        {session.learningMoments.length} learnings
                      </Badge>
                      <Badge variant="outline">
                        {session.flashcards.length} cards
                      </Badge>
                      <ChevronRight
                        className={`h-5 w-5 text-muted-foreground transition-transform ${
                          expandedSession === session.id ? 'rotate-90' : ''
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded Content */}
                {expandedSession === session.id && session.learningMoments.length > 0 && (
                  <div className="border-t border-border p-4 bg-muted/30">
                    <h4 className="text-sm font-medium mb-3">Learnings from this session</h4>
                    <div className="space-y-2">
                      {session.learningMoments.map((lm) => (
                        <div
                          key={lm.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-background"
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
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
