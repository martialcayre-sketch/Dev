import { responseSchema } from '@neuronutrition/core';
import { type NextRequest } from 'next/server';
import { z } from 'zod';

// Additional validation for the API request
const createResponseSchema = z.object({
  questionnaireCode: z.string(),
  answers: responseSchema.shape.answers,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionnaireCode, answers } = createResponseSchema.parse(body);

    // TODO: Save response to database
    const sessionId = `${questionnaireCode}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    return new Response(JSON.stringify({ sessionId }), {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new Response(JSON.stringify({ errors: err.format() }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Une erreur inattendue est survenue' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
