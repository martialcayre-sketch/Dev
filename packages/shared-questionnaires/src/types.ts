/**
 * Type de question dans un questionnaire
 */
export type QuestionType =
  | 'select'
  | 'number'
  | 'textarea'
  | 'scale'
  | 'slider'
  | 'multiple-choice';

/**
 * Variantes d'âge pour adaptation questionnaires
 */
export type AgeVariant = 'adult' | 'teen' | 'kid';

/**
 * Schéma de couleur pour les questions d'échelle
 */
export type ColorScheme =
  | 'fatigue'
  | 'douleurs'
  | 'digestion'
  | 'surpoids'
  | 'insomnie'
  | 'moral'
  | 'mobilite';

/**
 * Type d'échelle
 */
export type ScaleType = '0-4' | '0-10' | '1-5';

/**
 * Option de réponse avec points optionnels
 */
export interface QuestionOption {
  label: string;
  value: string | number;
  points?: number;
}

/**
 * Question de questionnaire
 */
export interface Question {
  id: string;
  label: string;
  section?: string;
  type?: QuestionType;

  // Pour les questions à échelle
  scale?: boolean;
  scaleType?: ScaleType;
  colorScheme?: ColorScheme;
  minLabel?: string;
  maxLabel?: string;

  // Pour les questions slider
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number;
  labels?: Record<number, string>;

  // Pour les questions à choix
  options?: string[] | QuestionOption[];

  // Métadonnées
  description?: string;
  required?: boolean;
  helpText?: string;
}

/**
 * Section d'un questionnaire
 */
export interface QuestionnaireSection {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
}

/**
 * Catégorie médicale
 */
export type MedicalCategory =
  | 'alimentaire'
  | 'cancerologie'
  | 'cardiologie'
  | 'gastro-enterologie'
  | 'gerontologie'
  | 'mode-de-vie'
  | 'mode-de-vie-siin'
  | 'neuro-psychologie'
  | 'pediatrie'
  | 'pneumologie'
  | 'rhumatologie'
  | 'sommeil'
  | 'stress'
  | 'tabacologie'
  | 'urologie';

/**
 * Métadonnées d'un questionnaire
 */
export interface QuestionnaireMetadata {
  id: string;
  title: string;
  category: MedicalCategory;
  description?: string;
  estimatedDuration?: number; // en minutes
  version?: string;
  author?: string;
  tags?: string[];
  // 🧠 Support variantes d'âge
  ageVariant?: AgeVariant;
  baseTemplateId?: string; // ID du template de base
}

/**
 * Questionnaire complet
 */
export interface Questionnaire {
  metadata: QuestionnaireMetadata;
  sections?: QuestionnaireSection[];
  questions?: Question[];
}

/**
 * Réponse à une question
 */
export interface QuestionResponse {
  questionId: string;
  value: string | number | string[];
  timestamp?: Date;
}

/**
 * Réponses complètes à un questionnaire
 */
export interface QuestionnaireResponse {
  questionnaireId: string;
  patientId: string;
  practitionerId?: string;
  responses: QuestionResponse[];
  startedAt?: Date;
  completedAt?: Date;
  score?: number;
  interpretation?: string;
}

/**
 * Résultat calculé d'un questionnaire
 */
export interface QuestionnaireResult {
  questionnaireId: string;
  totalScore: number;
  sectionScores?: Record<string, number>;
  interpretation: string;
  recommendations?: string[];
  severity?: 'low' | 'moderate' | 'high' | 'very-high';
}

/**
 * Thème de neurotransmetteur
 */
export interface NeurotransmitterTheme {
  prefix: string;
  label: string;
  description?: string;
}

/**
 * Constantes pour les neurotransmetteurs
 */
export const NEUROTRANSMITTER_THEMES: readonly NeurotransmitterTheme[] = [
  { prefix: 'd', label: 'Dopamine', description: 'Motivation, plaisir, récompense' },
  { prefix: 'n', label: 'Noradrénaline', description: 'Attention, vigilance, énergie' },
  { prefix: 's', label: 'Sérotonine', description: 'Humeur, bien-être, sommeil' },
  { prefix: 'm', label: 'Mélatonine', description: 'Sommeil, rythme circadien' },
] as const;

/**
 * Statut de questionnaire patient
 */
export type QuestionnaireStatus =
  | 'pending' // Assigné, non démarré
  | 'in_progress' // En cours de remplissage
  | 'submitted' // Soumis au praticien (verrouillé)
  | 'completed' // Validé par le praticien
  | 'reopened'; // Rouvert par le praticien pour modification

/**
 * Document questionnaire patient (Firestore)
 */
export interface QuestionnaireDoc {
  id: string;
  title: string;
  status: QuestionnaireStatus;
  responses: Record<string, number | string>;
  assignedAt?: Date;
  updatedAt?: Date;
  submittedAt?: Date | null;
  completedAt?: Date | null;
  // 🧠 Informations patient pour adaptation
  patientAge?: number;
  ageVariant?: AgeVariant;
  requiresParentAssistance?: boolean;
}

/**
 * Élément d'inbox praticien
 */
export interface PractitionerInboxItem {
  id: string;
  type: 'questionnaire_submission';
  patientId: string;
  questionnaireId: string;
  questionnaireTitle: string;
  status: 'new' | 'read' | 'archived';
  submittedAt: Date;
}
