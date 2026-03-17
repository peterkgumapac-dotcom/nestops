import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    propertyName,
    wifiName,
    checkInTime,
    checkOutTime,
    // Library enrichment fields
    description,
    amenities,
    houseRules,
    localRestaurants,
    localAttractions,
    localTransport,
    heatingInstructions,
    accessInstructions,
    city,
  } = body

  const encoder = new TextEncoder()

  const amenitiesList = Array.isArray(amenities) ? amenities.join(', ') : ''
  const restaurantList = Array.isArray(localRestaurants) ? localRestaurants.join('; ') : ''
  const attractionList = Array.isArray(localAttractions) ? localAttractions.join('; ') : ''
  const rulesContext = houseRules ? `Smoking: ${houseRules.smokingAllowed ? 'allowed' : 'not allowed'}, Pets: ${houseRules.petsAllowed ? 'allowed' : 'not allowed'}, Parties: ${houseRules.partiesAllowed ? 'allowed' : 'not allowed'}, Quiet hours: ${houseRules.quietHours ?? 'not specified'}, Additional: ${(houseRules.additionalRules ?? []).join('; ')}` : ''

  const stream = new ReadableStream({
    async start(controller) {
      const send = (field: string, chunk: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ field, chunk })}\n\n`))
      }

      try {
        // Welcome message
        const welcomePrompt = description
          ? `Write a warm, welcoming 2-3 sentence welcome message for guests staying at "${propertyName}" in ${city ?? 'Norway'}. The property is described as: "${description}". Amenities include: ${amenitiesList}. Be friendly and make them feel at home. No heading, just the message.`
          : `Write a warm, welcoming 2-3 sentence welcome message for guests staying at "${propertyName}". Be friendly and make them feel at home. No heading, just the message.`

        const welcomeStream = await client.messages.stream({
          model: 'claude-sonnet-4-5-20251001',
          max_tokens: 200,
          messages: [{ role: 'user', content: welcomePrompt }],
        })
        for await (const chunk of welcomeStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            send('welcome', chunk.delta.text)
          }
        }

        // House rules
        const rulesPrompt = rulesContext
          ? `Write 5-6 concise house rules for "${propertyName}" (check-in: ${checkInTime ?? '15:00'}, check-out: ${checkOutTime ?? '11:00'}). Use these property rules as context: ${rulesContext}. Format as bullet points starting with •. No heading.`
          : `Write 5-6 concise house rules for "${propertyName}" (check-in: ${checkInTime ?? '15:00'}, check-out: ${checkOutTime ?? '11:00'}). Format as bullet points starting with •. No heading.`

        const rulesStream = await client.messages.stream({
          model: 'claude-sonnet-4-5-20251001',
          max_tokens: 250,
          messages: [{ role: 'user', content: rulesPrompt }],
        })
        for await (const chunk of rulesStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            send('rules', chunk.delta.text)
          }
        }

        // How-to guides
        const howtoContext = [
          `WiFi: ${wifiName ?? 'provided on arrival'}`,
          heatingInstructions ? `Heating: ${heatingInstructions}` : null,
          accessInstructions ? `Access/Entry: ${accessInstructions}` : null,
        ].filter(Boolean).join('. ')

        const howtoStream = await client.messages.stream({
          model: 'claude-sonnet-4-5-20251001',
          max_tokens: 250,
          messages: [{
            role: 'user',
            content: `Write helpful how-to instructions for guests at "${propertyName}". Use this real property info: ${howtoContext}. Cover: WiFi setup, heating/temperature control, and checkout procedure. Format as bullet points starting with •. Be specific using the real details. No heading.`,
          }],
        })
        for await (const chunk of howtoStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            send('howto', chunk.delta.text)
          }
        }

        // Local tips
        const localContext = [
          restaurantList ? `Nearby restaurants: ${restaurantList}` : null,
          attractionList ? `Nearby attractions: ${attractionList}` : null,
          localTransport ? `Transport: ${localTransport}` : null,
        ].filter(Boolean).join('. ')

        const tipsPrompt = localContext
          ? `Write 4-5 local tips for guests at "${propertyName}" in ${city ?? 'Norway'}. Use these real details: ${localContext}. Cover dining, sightseeing, and transport. Format as bullet points starting with •. Be specific and mention actual names. No heading.`
          : `Write 4-5 local tips for guests in ${city ?? 'Norway'}. Cover dining, transport, and activities. Format as bullet points starting with •. No heading.`

        const tipsStream = await client.messages.stream({
          model: 'claude-sonnet-4-5-20251001',
          max_tokens: 200,
          messages: [{ role: 'user', content: tipsPrompt }],
        })
        for await (const chunk of tipsStream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            send('tips', chunk.delta.text)
          }
        }
      } catch {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Generation failed' })}\n\n`))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
