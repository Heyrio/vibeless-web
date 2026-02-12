import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Get flashcards due for review
export async function GET(req: NextRequest) {
  try {
    const apiKey = req.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({ where: { apiKey } })
    if (!user) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
    }

    const dueCards = await prisma.flashcard.findMany({
      where: {
        userId: user.id,
        nextReview: { lte: new Date() }
      },
      orderBy: { nextReview: 'asc' },
      take: 20,
    })

    return NextResponse.json(dueCards)
  } catch (error) {
    console.error('Get flashcards error:', error)
    return NextResponse.json({ error: 'Failed to get flashcards' }, { status: 500 })
  }
}

// Create a new flashcard
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

    const { front, back, category, sessionId } = await req.json()

    const flashcard = await prisma.flashcard.create({
      data: {
        userId: user.id,
        front,
        back,
        category,
        sessionId,
      }
    })

    return NextResponse.json(flashcard)
  } catch (error) {
    console.error('Create flashcard error:', error)
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 })
  }
}
