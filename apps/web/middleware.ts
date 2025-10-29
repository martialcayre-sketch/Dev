import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

async function getRoleAndStatus(token: string | undefined) {
  if (!token) return { role: null, emailVerified: false, approved: false };
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const userDoc = await adminDb().collection('users').doc(uid).get();
    const data = userDoc.exists ? (userDoc.data() as any) : {};
    return {
      role: data.role ?? null,
      emailVerified: decoded.email_verified ?? false,
      approved: data.approvedByPractitioner ?? false,
    };
  } catch {
    return { role: null, emailVerified: false, approved: false };
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('authToken')?.value;
  const { role, emailVerified, approved } = await getRoleAndStatus(token);

  const isPractitionerRoute = pathname.startsWith('/praticien');
  const isPatientRoute = pathname.startsWith('/patient');

  if (isPractitionerRoute) {
    if (role !== 'practitioner') {
      const url = req.nextUrl.clone();
      url.pathname = '/praticien/login';
      return NextResponse.redirect(url);
    }
  }

  if (isPatientRoute) {
    if (role !== 'patient') {
      const url = req.nextUrl.clone();
      url.pathname = '/patient/login';
      return NextResponse.redirect(url);
    }
    if (!emailVerified) {
      const url = req.nextUrl.clone();
      url.pathname = '/patient/login';
      url.searchParams.set('reason', 'email-not-verified');
      return NextResponse.redirect(url);
    }
    if (!approved) {
      const url = req.nextUrl.clone();
      url.pathname = '/patient/login';
      url.searchParams.set('reason', 'approval-pending');
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/praticien/:path*', '/patient/:path*'],
};
