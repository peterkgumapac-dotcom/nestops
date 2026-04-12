import { readFileSync } from 'fs'
import { join } from 'path'

export const runtime = 'nodejs'

let cached: string | null = null

export async function GET() {
  if (!cached) {
    cached = readFileSync(join(process.cwd(), 'public', 'landing.html'), 'utf-8')
  }
  return new Response(cached, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=300, stale-while-revalidate=60',
    },
  })
}
