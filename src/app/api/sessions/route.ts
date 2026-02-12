import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    const sessions = await prisma.session.findMany({
      where: { userId: user.id },
      include: {
        learningMoments: true,
        flashcards: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json({ error: 'Failed to get sessions' }, { status: 500 })
  }
}
