import type { Questionnaire } from '../../types';

export const questionnaire_agenda_du_sommeil_def: Questionnaire = {
  metadata: {
    id: 'questionnaire-agenda-du-sommeil-def',
    title: `questionnaire agenda du sommeil def`,
    category: 'sommeil',
  },
  questions: [
  {
    id: 'block-01',
    label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonnée  Questionnaire :   Agenda du sommeil - éveil  Jours   Hypnotique  (cocher)  19 h  20 h  21 h  22 h  23 h  00 h  1h   2h   3h   4h   5h   6h   7h   8h   9h   10 h  11 h  12 h  13 h  14 h  15 h  16 h  17 h  18 h  Qualité du  sommeil  Qualité de l’éveil   Remarques  Lun  Mar  Mer  Jeu  Ven  Sam  Dim  Lun  Mar  Mer  Jeu  Ven  Sam  Dim  Lun  Mar  Mer  Jeu  Ven  Sam  Dim`,
    type: 'textarea',
  },
  {
    id: 'block-02',
    label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonnée  Mode d’utilisation  Heure d’extinction de la lumière   O   Fatigue   Qualité du sommeil : noter de 1 à 10 dans la case  /// Périodes de sommeil   Envie de dormir   Qualité de l’éveil : noter de 1 à 10 dans la case  (__) Périodes d’éveil nocturne   Sieste involontaire   (état dans la journée, en forme ou non)  Heure du lever   Sieste volontaire   Traitement : en cas de prise d’hypnotique : cocher la case  Consigne au patient :  Remplir l’agenda :  •   Chaque matin, en fonction des souvenirs de la nuit (inutile de regarder sa montre pendant la nuit, ce qui perturberait davantage le sommeil : l’agenda n’est pas un outil de précision)  •   Chaque soir, pour relater l’état du patient pendant la journée.  Tenir l’agenda sur l’ensemble de la période d’observation des 21j ou 3 semaines, de façon à obtenir un aperçu des variations de sommeil au fil du temps.`,
    type: 'textarea',
  }
  ],
};
