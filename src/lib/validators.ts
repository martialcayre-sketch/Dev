import * as Yup from 'yup';

export const emailSchema = Yup.string().email('Email invalide').required('Email requis');
export const passwordSchema = Yup.string()
  .min(8, '8 caractères minimum')
  .required('Mot de passe requis');
export const displayNameSchema = Yup.string()
  .min(2, 'Trop court')
  .max(100, 'Trop long')
  .required('Nom requis');

export const practitionerRegisterSchema = Yup.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
});

export const patientRegisterSchema = Yup.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: displayNameSchema,
  chosenPractitionerId: Yup.string().required('Choisissez un praticien'),
});

export const loginSchema = Yup.object({
  email: emailSchema,
  password: passwordSchema,
});
