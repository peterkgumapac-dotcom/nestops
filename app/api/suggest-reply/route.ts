import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { requestTitle, requestDescription, requestType } = await req.json()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 300,
    messages: [
      {
        role: 'user',
        content: `You are a property management assistant. Write a professional, concise reply to this ${requestType} request.

Request: ${requestTitle}
Details: ${requestDescription}

Write only the reply message text (2-3 sentences max). Be helpful and action-oriented.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  return NextResponse.json({ suggestion: text })
}
