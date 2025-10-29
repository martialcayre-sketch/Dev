import { NextResponse } from 'next/server';

import { adminDb } from '@/app/../lib/firebase/admin';

export async function POST(req: Request) {
  const { identifier } = await req.json();
  if (!identifier) return NextResponse.json({ error: 'Missing identifier' }, { status: 400 });
  const snap = await adminDb()
    .collection('users')
    .where('username', '==', String(identifier))
    .limit(1)
    .get();
  if (snap.empty) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const data = snap.docs[0].data() as any;
  return NextResponse.json({ email: data.email });
}
