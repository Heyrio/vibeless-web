import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Electron app sends session data here
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

    const { title, summary, transcript, duration, flashcards, learningMoments } = await req.json()

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        title,
        summary,
        transcript: JSON.stringify(transcript),
        duration,
        flashcards: flashcards ? {
          create: flashcards.map((fc: { front: string; back: string; category?: string }) => ({
            userId: user.id,
            front: fc.front,
            back: fc.back,
            category: fc.category,
          }))
        } : undefined,
        learningMoments: learningMoments ? {
          create: learningMoments.map((lm: { type: string; content: string; context?: string; timestamp?: number }) => ({
            type: lm.type,
            content: lm.content,
            context: lm.context,
            timestamp: lm.timestamp,
          }))
        } : undefined,
      },
      include: {
        flashcards: true,
        learningMoments: true,
      }
    })

    return NextResponse.json(session)
  } catch (error) {
    console.error('Sync session error:', error)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
