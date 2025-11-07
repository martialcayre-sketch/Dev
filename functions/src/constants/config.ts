export const REGION = process.env.FUNCTIONS_REGION || 'europe-west1';
export const PATIENT_APP_BASE_URL = (
  process.env.PATIENT_APP_BASE_URL || 'https://neuronutrition-app-patient.web.app'
).replace(/\/$/, '');
export const PRACTITIONER_APP_BASE_URL = (
  process.env.PRACTITIONER_APP_BASE_URL || 'https://neuronutrition-app-practitioner.web.app'
).replace(/\/$/, '');
export const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';
