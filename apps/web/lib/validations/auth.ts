import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({
    message: 'Veuillez entrer une adresse email valide',
  }),
  password: z.string().min(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères',
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = loginSchema
  .extend({
    confirmPassword: z.string().min(8),
    role: z.enum(['patient', 'practitioner']),
    terms: z.boolean().refine((val) => val === true, {
      message: "Vous devez accepter les conditions d'utilisation",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email({
    message: 'Veuillez entrer une adresse email valide',
  }),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
