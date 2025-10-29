import { zodResolver } from '@hookform/resolvers/zod';
import {
  type QuestionnaireDTO,
  type ResponseDTO,
  type ItemDTO,
  type OptionDTO,
} from '@neuronutrition/core';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface FormErrorProps {
  children: React.ReactNode;
}

export function FormError({ children }: FormErrorProps) {
  if (!children) return null;
  return <p className="text-sm font-medium text-destructive">{children}</p>;
}

interface Props {
  code: string;
  onSubmit: (response: ResponseDTO) => Promise<void>;
  isSubmitting?: boolean;
}

// Define the form validation schema
const formSchema = z.object({
  answers: z.array(
    z.object({
      itemId: z.string(),
      value: z.number(),
    })
  ),
});

type FormValues = z.infer<typeof formSchema>;

export function QuestionnaireForm({ code, onSubmit, isSubmitting }: Props) {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});

  const {
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      answers: [],
    },
  });

  useEffect(() => {
    const loadQuestionnaire = async () => {
      try {
        const res = await fetch(`/api/questionnaires/${code}`);
        if (!res.ok) {
          throw new Error('Failed to load questionnaire');
        }
        const data = await res.json();
        setQuestionnaire(data);
      } catch (err) {
        setError('Impossible de charger le questionnaire');
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestionnaire();
  }, [code]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (error || !questionnaire) {
    return <div className="text-red-500">{error || 'Erreur inattendue'}</div>;
  }

  const handleAnswerChange = (itemId: string, value: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [itemId]: parseInt(value, 10),
    }));
  };

  const onSubmitForm = async () => {
    const answers = Object.entries(selectedAnswers).map(([itemId, value]) => ({
      itemId,
      value,
    }));

    if (answers.length < questionnaire.items.length) {
      return;
    }

    await onSubmit({ answers });
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8">
      {questionnaire.items.map((item: ItemDTO, index: number) => (
        <div key={item.id} className="space-y-4">
          <div className="flex gap-2">
            <span className="font-medium">{index + 1}.</span>
            <span>{item.text}</span>
          </div>

          <RadioGroup
            value={selectedAnswers[item.id]?.toString()}
            onValueChange={(value) => handleAnswerChange(item.id, value)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            {item.options.map((option: OptionDTO) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option.value.toString()}
                  id={`${item.id}-${option.value}`}
                  disabled={isSubmitting}
                />
                <Label htmlFor={`${item.id}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>

          {!selectedAnswers[item.id] && <FormError>Cette réponse est requise</FormError>}
        </div>
      ))}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting || Object.keys(selectedAnswers).length < questionnaire.items.length}
      >
        {isSubmitting ? 'Envoi en cours...' : 'Soumettre mes réponses'}
      </Button>
    </form>
  );
}
