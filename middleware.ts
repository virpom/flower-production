import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

const AUTH_LOGIN_PATH = '/auth/login';
const ADMIN_DASHBOARD_PATH = '/admin/orders';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Сначала ищем токен в cookie
  let token = request.cookies.get('auth_token')?.value;

  // 2. Если в cookie нет, ищем в заголовке Authorization
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  const payload = token ? await verifyToken(token) : null;
  const isAuthenticated = !!payload;

  // Исключаем служебные пути
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Обработка страницы входа
  if (pathname === AUTH_LOGIN_PATH) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL(ADMIN_DASHBOARD_PATH, request.url));
    }
    return NextResponse.next();
  }

  // Защита роутов админ-панели (UI)
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated || payload?.role !== 'admin') {
      const response = NextResponse.redirect(new URL(AUTH_LOGIN_PATH, request.url));
      response.cookies.delete('auth_token');
      return response;
    }
    return NextResponse.next();
  }

  // Защита API роутов
  if (pathname.startsWith('/api/')) {
    const isPublicApiRoute =
      (request.method === 'GET' && (pathname.startsWith('/api/products') || pathname.startsWith('/api/categories') || pathname.startsWith('/api/settings'))) ||
      (request.method === 'POST' && pathname.startsWith('/api/orders'));

    if (isPublicApiRoute) {
      return NextResponse.next();
    }

    // Все остальные API-запросы требуют прав администратора
    if (!isAuthenticated || payload?.role !== 'admin') {
      const errorResponse = !isAuthenticated
        ? { error: 'Требуется аутентификация' }
        : { error: 'Доступ запрещен. Требуются права администратора.' };
      const status = !isAuthenticated ? 401 : 403;
      return NextResponse.json(errorResponse, { status });
    }
    
    // Если пользователь — авторизованный админ, добавляем информацию в заголовки
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', (payload as any).userId);
    requestHeaders.set('x-user-role', (payload as any).role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// Конфигурация middleware
export const config = {
  matcher: ['/admin/:path*', '/api/:path*', '/auth/login'],
}; 