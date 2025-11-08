import type { Questionnaire } from '../../types';

export const questionnaire_de_fatigue_de_pichot_pro_def: Questionnaire = {
  metadata: {
    id: 'questionnaire-de-fatigue-de-pichot-pro-def',
    title: `questionnaire de fatigue de pichot pro def`,
    category: 'sommeil',
  },
  questions: [
  {
    id: 'block-01',
    label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonnée  Questionnaire de fatigue de Pichot  Parmi les 8 propositions suivantes, déterminez celles qui correspondent le mieux à votre état en affectant une note entre 0 et 4 :  (0 = pas du tout ; 1 = un peu ; 2 = moyennement ; 3 = beaucoup ; 4 = extrêmement)  0   1   2   3   4  Je manque d’énergie  Tout me demande un effort  Je me sens faible à certains endroits du corps  J’ai les bras ou les jambes lourdes  Je me sens fatigué sans raison  J’ai envie de m’allonger pour me reposer  J’ai du mal à me concentrer  Je me sens fatigué, lourd et raide  Score : total des points  La fatigue est définie comme une sensation d’affaiblissement physique ou psychique qui survient normalement à la suite d’un effort soutenu, et qui impose la mise au repos.  Cependant, cette fatigue physiologique peut devenir pathologique lorsque la personne se sent handicapée, invalidée ou gênée par rapport à son niveau de forme habituelle pour effectuer ses activités quotidiennes.  L’échelle subjective de Pichot mesure l’importance de cette gêne, handicap.  Un score total > 22 est un signe de fatigue  Le sommeil peut être inefficace, il existe de nombreuses causes à la fatigue qui doivent être explorées.`,
    type: 'textarea',
  }
  ],
};
