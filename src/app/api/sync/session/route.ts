import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface AnalysisResult {
  summary: string
  learningMoments: { type: string; content: string }[]
  flashcards: { front: string; back: string; category: string }[]
}

async function analyzeTranscript(transcript: string[]): Promise<AnalysisResult> {
  const geminiKey = process.env.GEMINI_API_KEY
  if (!geminiKey) {
    console.log('No Gemini API key, skipping analysis')
    return { summary: '', learningMoments: [], flashcards: [] }
  }

  const conversationText = transcript.join('\n')

  const prompt = `Analyze this coding conversation and extract learning insights.

CONVERSATION:
${conversationText}

Respond with ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "summary": "A 1-2 sentence summary of what was discussed",
  "learningMoments": [
    {"type": "concept", "content": "Brief description of a concept learned"},
    {"type": "tip", "content": "A useful tip that was shared"},
    {"type": "error_fix", "content": "How an error was resolved"},
    {"type": "pattern", "content": "A coding pattern or best practice"}
  ],
  "flashcards": [
    {"front": "Question about a concept", "back": "Answer explaining it", "category": "Topic"}
  ]
}

Rules:
- Only include ACTUAL insights from the conversation, not generic ones
- Keep flashcard questions specific and answers concise
- Types can be: concept, tip, error_fix, pattern, syntax
- If there's nothing meaningful to extract, return empty arrays
- Return ONLY the JSON object, nothing else`

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 2048,
          }
        })
      }
    )

    if (!response.ok) {
      console.error('Gemini API error:', response.status)
      return { summary: '', learningMoments: [], flashcards: [] }
    }

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Parse JSON from response (handle potential markdown code blocks)
    let jsonStr = text.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```json?\n?/g, '').replace(/```$/g, '').trim()
    }

    const result = JSON.parse(jsonStr) as AnalysisResult
    console.log('Analysis result:', result)
    return result
  } catch (error) {
    console.error('Analysis error:', error)
    return { summary: '', learningMoments: [], flashcards: [] }
  }
}

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

    const { title, transcript, duration } = await req.json()

    // Analyze transcript with AI to extract insights
    const analysis = await analyzeTranscript(transcript)

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        title: title || `Coding Session`,
        summary: analysis.summary || null,
        transcript: JSON.stringify(transcript),
        duration,
        flashcards: analysis.flashcards.length > 0 ? {
          create: analysis.flashcards.map((fc) => ({
            userId: user.id,
            front: fc.front,
            back: fc.back,
            category: fc.category,
          }))
        } : undefined,
        learningMoments: analysis.learningMoments.length > 0 ? {
          create: analysis.learningMoments.map((lm) => ({
            type: lm.type,
            content: lm.content,
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
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: 'Sync failed', details: message }, { status: 500 })
  }
}
