import {getToken} from 'next-auth/jwt';
import {NextResponse} from 'next/server';

export async function middleware(req) {
    const token = await getToken({req, secret: process.env.NEXTAUTH_SECRET});
    const {pathname} = req.nextUrl;

    const currentTime = Math.floor(Date.now() / 1000);

    const isTokenExpired = token && token.exp < currentTime;

    const userRole = token?.type;

    if (token && pathname === '/') {
        return NextResponse.redirect(new URL('/jewelry', req.url));
    }

    if (token && !isTokenExpired && pathname.startsWith('/jewelry')) {
        return NextResponse.next();
    }

    if (pathname.startsWith('/auction') && (!token || (userRole !== 'admin' && userRole !== 'user-auction') || isTokenExpired)) {
        return NextResponse.redirect(new URL('/jewelry', req.url));
    }


    if ((!token || !userRole || isTokenExpired) && (pathname.startsWith('/auction') || pathname.startsWith('/jewelry'))) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/',  '/jewelry/:path*'],
};
