import type { Questionnaire } from '../../types';

export const questionnaire_test_dependance_a_la_nicotine_fagerstrom_pro: Questionnaire = {
  metadata: {
    id: 'questionnaire-test-dependance-a-la-nicotine-fagerstrom-pro',
    title: `questionnaire test dependance a la nicotine fagerstrom pro`,
    category: 'tabacologie',
  },
  questions: [
  {
    id: 'block-01',
    label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonnée  Questionnaire  Test de dépendance à la nicotine (Fagerstrom)  Combien de temps après votre réveil fumez-vous votre première cigarette ?  3   Dans les 5 premières minutes  2   Entre 6 et 30 minutes  1   Entre 31 et 60 minutes  0   Après 60   minutes  Trouvez-vous difficile de vous abstenir de fumer dans les endroits où c’est interdit ?  1   Oui  0   Non  A quelle cigarette de la journée vous sera-t-il plus difficile de renoncer ?  1   La première le matin  0   N’importe quelle autre  Combien de cigarettes fumez-vous par jour ?  0   10 au moins  1   11 à 20  2   21 à 30  3   31 ou plus  Fumez - vous à un rythme plus soutenu le matin que l’après - midi   ?  1   Oui  0   Non  Fumez-vous lorsque vous êtes si malade que vous devez rester au lit presque toute la journée ?  1   Oui  0   Non  TOTAL :`,
    type: 'textarea',
  },
  {
    id: 'block-02',
    label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonnée  Interprétation des résultats  0 à 2 : pas de dépendance à la nicotine  3 à 4 : faible dépendance à la nicotine  5 à 6 : moyenne dépendance à la nicotine  7 à 10 : forte ou très forte dépendance à la nicotine.  La dépendance à la nicotine n’est que l’un des aspects à considérer dans le sevrage tabagique.  Si la dépendance physique à la nicotine est évidente (Fagerström   >   5), le médecin doit commencer le sevrage par la prescription de substituts nicotiniques.  D’autres aspects du tabagisme doivent être également pris en compte notamment la motivation, l’humeur, le niveau de stress, le mode de vie et le mode alimentaire.  L’accompagnement et le coaching sont indispensables pour optimiser les chances de réussite d’un sevrage tabagique, pour favoriser le sevrage dans des conditions de bien-être et de performance évitait les conséquences de l’arrêt du tabac notamment sur le bien de poids excessif.`,
    type: 'textarea',
  }
  ],
};
