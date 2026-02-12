'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Plus,
  Layers,
  BookOpen,
  Lightbulb,
  Bug,
  Code,
} from 'lucide-react'

interface LearningMoment {
  id: string
  type: string
  content: string
  context: string | null
  timestamp: number | null
  sessionId: string
  createdAt: string
}

interface Session {
  id: string
  title: string
  createdAt: string
  learningMoments: LearningMoment[]
}

export default function Learnings() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [apiKey, setApiKey] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedLearning, setSelectedLearning] = useState<LearningMoment | null>(null)
  const [flashcardFront, setFlashcardFront] = useState('')
  const [flashcardBack, setFlashcardBack] = useState('')
  const [creating, setCreating] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const key = localStorage.getItem('vibeless_api_key')
    if (!key) {
      router.push('/')
      return
    }
    setApiKey(key)

    fetch('/api/sessions', { headers: { 'x-api-key': key } })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSessions(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const allLearnings = sessions.flatMap(s =>
    s.learningMoments.map(lm => ({
      ...lm,
      sessionTitle: s.title,
      sessionDate: s.createdAt,
    }))
  )

  const filteredLearnings = allLearnings.filter(lm => {
    const matchesSearch = lm.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lm.sessionTitle.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || lm.type === selectedType
    return matchesSearch && matchesType
  })

  const typeStats = {
    concept: allLearnings.filter(l => l.type === 'concept').length,
    tip: allLearnings.filter(l => l.type === 'tip').length,
    error_fix: allLearnings.filter(l => l.type === 'error_fix').length,
    pattern: allLearnings.filter(l => l.type === 'pattern').length,
  }

  const openCreateFlashcard = (learning: LearningMoment) => {
    setSelectedLearning(learning)
    setFlashcardFront('')
    setFlashcardBack(learning.content)
    setDialogOpen(true)
  }

  const createFlashcard = async () => {
    if (!selectedLearning || !flashcardFront || !flashcardBack) return
    setCreating(true)

    try {
      await fetch('/api/flashcards/from-learning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          learningId: selectedLearning.id,
          front: flashcardFront,
          back: flashcardBack,
          category: selectedLearning.type,
        }),
      })
      setDialogOpen(false)
    } catch (e) {
      console.error(e)
    } finally {
      setCreating(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'concept':
        return <BookOpen className="h-4 w-4" />
      case 'tip':
        return <Lightbulb className="h-4 w-4" />
      case 'error_fix':
        return <Bug className="h-4 w-4" />
      case 'pattern':
        return <Code className="h-4 w-4" />
      default:
        return <BookOpen className="h-4 w-4" />
    }
  }

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'concept':
        return 'border-chart-1/50 text-chart-1 bg-chart-1/10'
      case 'tip':
        return 'border-chart-2/50 text-chart-2 bg-chart-2/10'
      case 'error_fix':
        return 'border-chart-4/50 text-chart-4 bg-chart-4/10'
      case 'pattern':
        return 'border-chart-5/50 text-chart-5 bg-chart-5/10'
      default:
        return ''
    }
  }

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
        <h1 className="text-2xl font-semibold tracking-tight">Learnings</h1>
        <p className="text-muted-foreground">
          Browse and convert your learning moments into flashcards
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card
          className={`cursor-pointer transition-colors ${selectedType === 'concept' ? 'border-chart-1' : 'hover:border-muted-foreground/50'}`}
          onClick={() => setSelectedType(selectedType === 'concept' ? 'all' : 'concept')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-1/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-chart-1" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{typeStats.concept}</p>
                <p className="text-sm text-muted-foreground">Concepts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${selectedType === 'tip' ? 'border-chart-2' : 'hover:border-muted-foreground/50'}`}
          onClick={() => setSelectedType(selectedType === 'tip' ? 'all' : 'tip')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                <Lightbulb className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{typeStats.tip}</p>
                <p className="text-sm text-muted-foreground">Tips</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${selectedType === 'error_fix' ? 'border-chart-4' : 'hover:border-muted-foreground/50'}`}
          onClick={() => setSelectedType(selectedType === 'error_fix' ? 'all' : 'error_fix')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Bug className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{typeStats.error_fix}</p>
                <p className="text-sm text-muted-foreground">Error Fixes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${selectedType === 'pattern' ? 'border-chart-5' : 'hover:border-muted-foreground/50'}`}
          onClick={() => setSelectedType(selectedType === 'pattern' ? 'all' : 'pattern')}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
                <Code className="h-5 w-5 text-chart-5" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{typeStats.pattern}</p>
                <p className="text-sm text-muted-foreground">Patterns</p>
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
            placeholder="Search learnings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {filteredLearnings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium mb-1">
              {allLearnings.length === 0 ? 'No learnings yet' : 'No results found'}
            </p>
            <p className="text-sm text-muted-foreground">
              {allLearnings.length === 0
                ? 'Start coding sessions with the desktop app to capture learnings'
                : 'Try adjusting your search or filter'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredLearnings.map((learning) => (
            <Card key={learning.id} className="group">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                    learning.type === 'concept' ? 'bg-chart-1/10 text-chart-1' :
                    learning.type === 'tip' ? 'bg-chart-2/10 text-chart-2' :
                    learning.type === 'error_fix' ? 'bg-chart-4/10 text-chart-4' :
                    'bg-chart-5/10 text-chart-5'
                  }`}>
                    {getTypeIcon(learning.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className={getTypeBadgeStyle(learning.type)}>
                        {learning.type.replace('_', ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        from {learning.sessionTitle}
                      </span>
                    </div>
                    <p className="text-sm">{learning.content}</p>
                    {learning.context && (
                      <div className="mt-2 p-2 rounded bg-muted/50 font-mono text-xs text-muted-foreground overflow-x-auto">
                        {learning.context}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    onClick={() => openCreateFlashcard(learning)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Flashcard
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Flashcard Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Flashcard</DialogTitle>
            <DialogDescription>
              Turn this learning into a flashcard for spaced repetition review.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="front">Question (Front)</Label>
              <Input
                id="front"
                placeholder="What question will help you recall this?"
                value={flashcardFront}
                onChange={(e) => setFlashcardFront(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="back">Answer (Back)</Label>
              <Textarea
                id="back"
                placeholder="The answer..."
                value={flashcardBack}
                onChange={(e) => setFlashcardBack(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={createFlashcard} disabled={creating || !flashcardFront || !flashcardBack}>
              {creating ? 'Creating...' : 'Create Flashcard'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
