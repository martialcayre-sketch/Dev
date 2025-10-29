import { NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  const cookieHeader = (req as any).headers.get('cookie') as string | undefined;
  const token = cookieHeader
    ?.split(';')
    .map((p) => p.trim())
    .find((p) => p.startsWith('authToken='))
    ?.slice('authToken='.length);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const uid = decoded.uid;
    const meDoc = await adminDb().collection('users').doc(uid).get();
    const me = meDoc.data() as any;
    if (me?.role !== 'practitioner')
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { patientUid, action } = await req.json();
    if (!patientUid || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const batch = adminDb().batch();
    const userRef = adminDb().collection('users').doc(patientUid);
    const patientRef = adminDb().collection('patients').doc(patientUid);
    batch.update(patientRef, { status: action === 'approve' ? 'approved' : 'rejected' });
    batch.update(userRef, { approvedByPractitioner: action === 'approve' });
    await batch.commit();

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}
