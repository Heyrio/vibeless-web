'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      // Done with all cards
      setCards([])
    }
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
          <span className="text-gray-400">
            {cards.length > 0 ? `${currentIndex + 1} / ${cards.length}` : 'Review'}
          </span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {cards.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-semibold mb-2">All caught up!</h2>
            <p className="text-gray-400 mb-8">No flashcards due for review right now.</p>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition"
            >
              Back to Dashboard
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Card */}
            <div
              className="bg-[#12121a] rounded-2xl p-8 border border-gray-800 min-h-[300px] flex flex-col cursor-pointer"
              onClick={() => setShowAnswer(true)}
            >
              {currentCard.category && (
                <span className="text-xs text-blue-400 mb-4">{currentCard.category}</span>
              )}

              <div className="flex-1 flex items-center justify-center">
                <p className="text-xl text-center">
                  {showAnswer ? currentCard.back : currentCard.front}
                </p>
              </div>

              {!showAnswer && (
                <p className="text-center text-gray-500 text-sm mt-4">
                  Click to reveal answer
                </p>
              )}
            </div>

            {/* Rating buttons */}
            {showAnswer && (
              <div className="space-y-4">
                <p className="text-center text-gray-400 text-sm">How well did you remember?</p>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleReview(1)}
                    className="py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition"
                  >
                    Again
                  </button>
                  <button
                    onClick={() => handleReview(3)}
                    className="py-3 bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 rounded-lg transition"
                  >
                    Hard
                  </button>
                  <button
                    onClick={() => handleReview(4)}
                    className="py-3 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition"
                  >
                    Good
                  </button>
                  <button
                    onClick={() => handleReview(5)}
                    className="py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition"
                  >
                    Easy
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
