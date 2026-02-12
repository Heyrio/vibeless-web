import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Create a flashcard from a learning moment
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

    const { learningId, front, back, category } = await req.json()

    // Verify the learning moment belongs to this user's session
    const learning = await prisma.learningMoment.findUnique({
      where: { id: learningId },
      include: { session: true }
    })

    if (!learning || learning.session.userId !== user.id) {
      return NextResponse.json({ error: 'Learning not found' }, { status: 404 })
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        userId: user.id,
        sessionId: learning.sessionId,
        front,
        back,
        category: category || learning.type,
      }
    })

    return NextResponse.json(flashcard)
  } catch (error) {
    console.error('Create flashcard from learning error:', error)
    return NextResponse.json({ error: 'Failed to create flashcard' }, { status: 500 })
  }
}
