'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  RotateCcw,
  Check,
  Layers,
  ArrowLeft,
} from 'lucide-react'

interface Flashcard {
  id: string
  front: string
  back: string
  category?: string
}

export default function Review() {
  const [cards, setCards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [loading, setLoading] = useState(true)
  const [apiKey, setApiKey] = useState('')
  const [reviewedCount, setReviewedCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const key = localStorage.getItem('vibeless_api_key')
    if (!key) {
      router.push('/')
      return
    }
    setApiKey(key)

    fetch('/api/flashcards', {
      headers: { 'x-api-key': key }
    })
      .then(res => res.json())
      .then(data => {
        setCards(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [router])

  const currentCard = cards[currentIndex]
  const totalCards = cards.length + reviewedCount
  const progress = totalCards > 0 ? ((reviewedCount) / totalCards) * 100 : 0

  const handleReview = async (quality: number) => {
    if (!currentCard) return

    await fetch('/api/flashcards/review', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        flashcardId: currentCard.id,
        quality
      })
    })

    setShowAnswer(false)
    setReviewedCount(prev => prev + 1)

    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setCards([])
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
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Review Flashcards</h1>
            <p className="text-muted-foreground">
              {cards.length > 0
                ? `${cards.length} cards remaining`
                : 'Spaced repetition review'}
            </p>
          </div>
          {totalCards > 0 && (
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Progress</p>
              <p className="text-lg font-semibold">
                {reviewedCount} / {totalCards}
              </p>
            </div>
          )}
        </div>
        {totalCards > 0 && (
          <Progress value={progress} className="mt-4 h-2" />
        )}
      </div>

      {/* Content */}
      {cards.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-chart-2/10 flex items-center justify-center mx-auto mb-6">
              <Check className="h-8 w-8 text-chart-2" />
            </div>
            <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {reviewedCount > 0
                ? `Great job! You reviewed ${reviewedCount} cards. Come back later for more.`
                : 'No flashcards due for review right now. Keep learning to create more cards!'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="secondary" onClick={() => router.push('/learnings')}>
                <Layers className="h-4 w-4 mr-2" />
                Browse Learnings
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Flashcard */}
          <Card
            className="cursor-pointer transition-all hover:border-muted-foreground/50"
            onClick={() => !showAnswer && setShowAnswer(true)}
          >
            <CardContent className="p-8 min-h-[300px] flex flex-col">
              {currentCard.category && (
                <Badge variant="secondary" className="w-fit mb-4">
                  {currentCard.category}
                </Badge>
              )}

              <div className="flex-1 flex items-center justify-center py-8">
                <p className="text-xl text-center leading-relaxed">
                  {showAnswer ? currentCard.back : currentCard.front}
                </p>
              </div>

              {!showAnswer && (
                <p className="text-center text-sm text-muted-foreground">
                  Click to reveal answer
                </p>
              )}

              {showAnswer && (
                <div className="text-center pt-4 border-t border-border">
                  <Badge variant="outline" className="text-muted-foreground">
                    Answer
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rating Buttons */}
          {showAnswer && (
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                How well did you remember?
              </p>
              <div className="grid grid-cols-4 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleReview(1)}
                  className="h-auto py-4 flex-col gap-1 border-chart-4/50 hover:bg-chart-4/10 hover:text-chart-4 hover:border-chart-4"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span className="text-sm font-medium">Again</span>
                  <span className="text-xs text-muted-foreground">&lt;1m</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReview(3)}
                  className="h-auto py-4 flex-col gap-1 border-chart-3/50 hover:bg-chart-3/10 hover:text-chart-3 hover:border-chart-3"
                >
                  <span className="text-lg">Hard</span>
                  <span className="text-xs text-muted-foreground">1d</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReview(4)}
                  className="h-auto py-4 flex-col gap-1 border-chart-2/50 hover:bg-chart-2/10 hover:text-chart-2 hover:border-chart-2"
                >
                  <span className="text-lg">Good</span>
                  <span className="text-xs text-muted-foreground">3d</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReview(5)}
                  className="h-auto py-4 flex-col gap-1 border-chart-1/50 hover:bg-chart-1/10 hover:text-chart-1 hover:border-chart-1"
                >
                  <span className="text-lg">Easy</span>
                  <span className="text-xs text-muted-foreground">7d</span>
                </Button>
              </div>
            </div>
          )}

          {/* Keyboard shortcuts hint */}
          <p className="text-center text-xs text-muted-foreground">
            Tip: Press Space to reveal, then 1-4 to rate
          </p>
        </div>
      )}
    </div>
  )
}
