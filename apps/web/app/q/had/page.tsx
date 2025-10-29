'use client';

import { type ResponseDTO } from '@neuronutrition/core';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { QuestionnaireForm } from '@/components/QuestionnaireForm';
import { ErrorMessage } from '@/components/ui/error-message';

export default function HadQuestionnairePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (response: ResponseDTO) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionnaireCode: 'HAD',
          answers: response.answers,
        }),
      });

      if (!res.ok) {
        throw new Error('Erreur lors de la soumission du questionnaire');
      }

      const { sessionId } = await res.json();

      // Navigate to the confirmation page
      router.push(`/q/had/thank-you?sessionId=${sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur inattendue est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold mb-6">
        Questionnaire d&apos;auto-évaluation HAD
        <span className="text-sm font-normal text-muted-foreground ml-2">
          (Hospital Anxiety and Depression Scale)
        </span>
      </h1>

      <div className="bg-card rounded-lg p-6 shadow-sm">
        <p className="text-muted-foreground mb-6">
          Ce questionnaire aide à évaluer votre état émotionnel. Veuillez répondre spontanément à
          chaque question en sélectionnant la réponse qui correspond le mieux à ce que vous
          ressentez.
        </p>

        {error && <ErrorMessage message={error} className="mb-6" />}

        <QuestionnaireForm code="HAD" onSubmit={handleSubmit} isSubmitting={isSubmitting} />

        <div className="mt-6 text-sm text-muted-foreground">
          Vos réponses sont confidentielles et seront utilisées uniquement dans le cadre de votre
          suivi.
        </div>
      </div>
    </div>
  );
}
