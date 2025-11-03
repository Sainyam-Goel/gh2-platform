import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function middleware(req: NextRequest){
  const url = new URL(req.url)
  if(url.pathname.startsWith('/login')) return NextResponse.next()
  // client-side stores api key; here we just allow navigation
  return NextResponse.next()
}

export const config = { matcher: ['/((?!_next/|favicon.ico).*)'] }
