import { NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(req: Request) {
  const cookieHeader = (req as any).headers.get('cookie') as string | undefined;
  const token = cookieHeader
    ?.split(';')
    .map((p) => p.trim())
    .find((p) => p.startsWith('authToken='))
    ?.slice('authToken='.length);
  if (!token) return NextResponse.json({ emailVerified: false, approvedByPractitioner: false });
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const doc = await adminDb().collection('users').doc(uid).get();
    const data = doc.exists ? (doc.data() as any) : {};
    return NextResponse.json({
      emailVerified: decoded.email_verified ?? false,
      approvedByPractitioner: data.approvedByPractitioner ?? false,
    });
  } catch {
    return NextResponse.json({ emailVerified: false, approvedByPractitioner: false });
  }
}
