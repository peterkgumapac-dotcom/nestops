import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const { documentType, propertyName, status } = await req.json()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `You are a property management assistant. Draft a professional email to request a compliance document from a property owner.

Document type: ${documentType}
Property: ${propertyName}
Current status: ${status}

Return ONLY valid JSON in this exact format with no markdown:
{"subject": "email subject here", "body": "email body here"}

The email body should be professional, clear, and request the document urgently if it is expired or missing. Use \\n for line breaks in the body.`,
      },
    ],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  try {
    const parsed = JSON.parse(text)
    return NextResponse.json(parsed)
  } catch {
    return NextResponse.json({
      subject: `Action Required: ${documentType} — ${propertyName}`,
      body: `Dear Owner,\n\nWe are writing to inform you that the ${documentType} for ${propertyName} is currently ${status} and requires your immediate attention.\n\nPlease provide the updated document at your earliest convenience.\n\nBest regards,\nAfterStay Operations Team`,
    })
  }
}
