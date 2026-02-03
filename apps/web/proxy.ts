import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { getAuthStatus } from './lib/client/default/default';

export async function proxy(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const cookiesList = cookieStore.getAll()
    const cookieHeader = cookiesList.reduce((prev, cur) => prev + `;${cur.name}=${cur.value}`, '')
    const response = await getAuthStatus({
      headers: {
        Cookie: cookieHeader
      }
    });

    console.log('status', response);

    if (response.status === 401) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.log(error)
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }
}

export const config = {
  matcher: ['/app/:path*'],
};
