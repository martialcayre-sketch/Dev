import { type NextRequest } from 'next/server';

import { hadQuestionnaire } from '@/data/questionnaires/had';

export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  if (params.code !== 'had') {
    return new Response('Not found', { status: 404 });
  }

  return new Response(JSON.stringify(hadQuestionnaire), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
