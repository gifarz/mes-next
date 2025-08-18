import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(req: NextRequest) {
    const token = req.cookies.get('accessToken')?.value

    if (!token) {
        return NextResponse.redirect(new URL('/auth', req.url))
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)

        const role = payload.role as string | undefined
        const path = req.nextUrl.pathname

        // If Operator, restrict access
        if (role === 'Operator') {
            const allowedPaths = ['/app/track', '/app/settings']
            const isAllowed = allowedPaths.some((allowed) => path.startsWith(allowed))

            if (!isAllowed) {
                return NextResponse.redirect(new URL('/app/track', req.url))
            }
        }
        return NextResponse.next()
    } catch (err) {
        console.error('JWT verification failed', err)
        return NextResponse.redirect(new URL('/auth', req.url))
    }
}

export const config = {
    matcher: ['/app/:path*'],
}
