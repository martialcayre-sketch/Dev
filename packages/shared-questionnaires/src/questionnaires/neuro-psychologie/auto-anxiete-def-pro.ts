import type { Questionnaire } from '../../types';

export const auto_anxiete_def_pro: Questionnaire = {
  metadata: {
    id: 'auto-anxiete-def-pro',
    title: `Questionnaire d’auto-évaluation de l’anxiété`,
    category: 'neuro-psychologie',
  },
  questions: [
  {
    id: 'q1',
    label: `Nervosité ou sensation de tremblements 0 1 2 3 4`,
    type: 'textarea',
  },
  {
    id: 'q2',
    label: `Nausées, douleurs ou malaises d’estomac. 0 1 2 3 4`,
    type: 'textarea',
  },
  {
    id: 'q3',
    label: `Impression d’être effrayé subitement et 0 1 2 3 4`,
    type: 'textarea',
  },
  {
    id: 'q4',
    label: `Palpitations ou impression que votre cœur 0 1 2 3 4`,
    type: 'textarea',
  },
  {
    id: 'q5',
    label: `Difficulté importante à vous endormir. 0 1 2 3 4`,
    type: 'textarea',
  },
  {
    id: 'q6',
    label: `Difficulté à vous détendre. 0 1 2 3 4`,
    type: 'textarea',
  },
  {
    id: 'q7',
    label: `Tendance à sursauter facilement. 0 1 2 3 4`,
    type: 'textarea',
  },
  {
    id: 'q8',
    label: `Tendance à être facilement irritable ou 0 1 2 3 4`,
    type: 'textarea',
  },
  {
    id: 'q9',
    label: `Incapacité à vous libérer de pensées 0 1 2 3 4`,
    type: 'textarea',
  },
  {
    id: 'q10',
    label: `Tendance à vous éveiller très tôt le matin 0 1 2 3 4`,
    type: 'textarea',
  },
  {
    id: 'q11',
    label: `Vous sentir nerveux lorsque vous êtes seul. 0 1 2 3 4`,
    type: 'textarea',
  }
  ],
};
