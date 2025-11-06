// Types for DayFlow 360 – Alimentation SIIN
import type { Interpretation } from './interpretation';

export type DayFlowAxis = 'AIA' | 'SER' | 'DOP' | 'NEU' | 'CON';
export const DAYFLOW_AXES: DayFlowAxis[] = ['AIA', 'SER', 'DOP', 'NEU', 'CON'];

export type SceneKey = 'matin' | 'midi' | 'apresmidi' | 'soir' | 'global';
export const SCENES: SceneKey[] = ['matin', 'midi', 'apresmidi', 'soir', 'global'];

export type Choice = 0 | 1 | 2; // 0=faible,1=moyen,2=optimal

export interface SceneAnswers {
  [questionId: string]: Choice;
}

export interface DayFlowAnswers {
  matin: SceneAnswers;
  midi: SceneAnswers;
  apresmidi: SceneAnswers;
  soir: SceneAnswers;
  global: SceneAnswers;
}

export type AxisScores = Record<DayFlowAxis, number>; // 0..100

export interface DayFlowScores {
  axes: AxisScores; // normalisés 0..100
  total: number; // moyenne générale 0..100
}

export interface DayFlowPayload {
  version: string;
  createdAt?: any; // serverTimestamp when persisted
  updatedAt?: any; // serverTimestamp when persisted
  uid?: string; // filled server-side or by caller
  id?: string; // doc id when saved
  answers: DayFlowAnswers;
  scores: DayFlowScores;
  radarInverted?: AxisScores; // même échelle 0..100 (zone plus grande = déficit plus grand)
  meta?: {
    device?: string;
    userAgent?: string;
    locale?: string;
    context?: 'patient' | 'praticien';
  };
  interpretation?: Interpretation; // Ajouté lors de la soumission
}
