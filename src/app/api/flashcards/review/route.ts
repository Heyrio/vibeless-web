import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// SM-2 Spaced Repetition Algorithm
function calculateNextReview(quality: number, easeFactor: number, interval: number, repetitions: number) {
  // quality: 0-5 (0=complete blackout, 5=perfect recall)
  let newEaseFactor = easeFactor
  let newInterval = interval
  let newRepetitions = repetitions

  if (quality < 3) {
    // Failed - reset
    newRepetitions = 0
    newInterval = 1
  } else {
    // Passed
    newRepetitions += 1

    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 6
    } else {
      newInterval = Math.round(interval * easeFactor)
    }

    // Update ease factor
    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    if (newEaseFactor < 1.3) newEaseFactor = 1.3
  }

  const nextReview = new Date()
  nextReview.setDate(nextReview.getDate() + newInterval)

  return { newEaseFactor, newInterval, newRepetitions, nextReview }
}

// Review a flashcard
export async function POST(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { apiKey } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const { flashcardId, quality } = await req.json()

    if (quality < 0 || quality > 5) {
      return NextResponse.json({ error: 'Quality must be 0-5' }, { status: 400 })
    }

    const flashcard = await prisma.flashcard.findUnique({ where: { id: flashcardId } })
    if (!flashcard || flashcard.userId !== user.id) {
      return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 })
    }

    const { newEaseFactor, newInterval, newRepetitions, nextReview } = calculateNextReview(
      quality,
      flashcard.easeFactor,
      flashcard.interval,
      flashcard.repetitions
    )

    const updated = await prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        easeFactor: newEaseFactor,
        interval: newInterval,
        repetitions: newRepetitions,
        nextReview,
        lastReview: new Date(),
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Review flashcard error:', error)
    return NextResponse.json({ error: 'Review failed' }, { status: 500 })
  }
}
