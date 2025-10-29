import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set('authToken', token, { httpOnly: true, path: '/' });
  return res;
}
