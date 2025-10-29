import { z } from 'zod';

// Base schemas
export const optionSchema = z.object({
  value: z.number(),
  label: z.string(),
});

export const itemSchema = z.object({
  id: z.string(),
  text: z.string(),
  options: z.array(optionSchema),
});

export const questionnaireSchema = z.object({
  code: z.string(),
  title: z.string(),
  description: z.string().optional(),
  items: z.array(itemSchema),
});

export const answerSchema = z.object({
  itemId: z.string(),
  value: z.number(),
});

export const responseSchema = z.object({
  answers: z.array(answerSchema),
});

// HAD specific schemas
export const hadItemSchema = itemSchema.extend({
  subscale: z.enum(['anxiety', 'depression']),
  scoring: z.enum(['normal', 'reversed']),
});

export const hadQuestionnaireSchema = questionnaireSchema.extend({
  items: z.array(hadItemSchema),
});

// Types
export type OptionDTO = z.infer<typeof optionSchema>;
export type ItemDTO = z.infer<typeof itemSchema>;
export type QuestionnaireDTO = z.infer<typeof questionnaireSchema>;
export type AnswerDTO = z.infer<typeof answerSchema>;
export type ResponseDTO = z.infer<typeof responseSchema>;

export type HADItemDTO = z.infer<typeof hadItemSchema>;
export type HADQuestionnaireDTO = z.infer<typeof hadQuestionnaireSchema>;
