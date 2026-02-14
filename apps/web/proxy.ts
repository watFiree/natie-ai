import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { getAuthStatus } from './lib/api/default/default';

export async function proxy(request: NextRequest) {
  try {
    const cookieStore = await cookies();

    const cookiesList = cookieStore.getAll();
    const cookieHeader = cookiesList
      .map((c) => `${c.name}=${c.value}`)
      .join('; ');
    const response = await getAuthStatus({
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (response.status === 401) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

export const config = {
  matcher: ['/app/:path*'],
};
