declare module '@neuronutrition/shared-core' {
  export interface PatientAgeData {
    birthDate?: string | Date;
    uid: string;
  }

  export interface AgeDetectionResult {
    ageInYears: number;
    variant: 'adult' | 'teen' | 'kid';
    isValid: boolean;
    error?: string;
  }

  export function detectPatientAge(patient: PatientAgeData): AgeDetectionResult;
  export function canAssignQuestionnaires(patient: PatientAgeData): {
    canAssign: boolean;
    reason?: string;
    requiresIdentification: boolean;
  };
}

declare module '@neuronutrition/shared-questionnaires' {
  export function getQuestionnaireById(id: string): any;
  export function getAvailableTemplates(): any[];
  export function getLibraryStats(): any;
}
