import { NextResponse } from 'next/server';

import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function POST(req: Request) {
  try {
    const { uid, email, username, practitionerUsername } = await req.json();
    if (!uid || !email || !username || !practitionerUsername) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Resolve practitioner by username
    const prSnap = await adminDb()
      .collection('practitioners')
      .where('username', '==', practitionerUsername)
      .limit(1)
      .get();
    const practitionerId = prSnap.empty ? practitionerUsername : prSnap.docs[0].id;

    // Create/merge user doc and patients doc
    await adminDb().runTransaction(async (tx) => {
      const userRef = adminDb().collection('users').doc(uid);
      const patientRef = adminDb().collection('patients').doc(uid);
      tx.set(
        userRef,
        {
          email,
          username,
          role: 'patient',
          practitionerId,
          chosenPractitionerId: practitionerId,
          emailVerified: false,
          approvedByPractitioner: false,
          approvalStatus: 'pending',
          createdAt: new Date(),
        },
        { merge: true }
      );
      tx.set(
        patientRef,
        {
          uid,
          practitionerId,
          status: 'pending',
          createdAt: new Date(),
        },
        { merge: true }
      );
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Server error' }, { status: 500 });
  }
}
