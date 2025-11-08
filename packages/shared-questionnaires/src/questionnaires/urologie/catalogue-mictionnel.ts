import type { Questionnaire } from '../../types';

export const catalogue_mictionnel: Questionnaire = {
  metadata: {
    id: 'catalogue-mictionnel',
    title: `catalogue mictionnel`,
    category: 'urologie',
  },
  questions: [
  {
    id: 'block-01',
    label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonnée  Questionnaire :  Catalogue Mictionnel : CHU de Nice  Il vous a été demandé de faire un calendrier ou catalogue mictionnel.  Ce recueil de données a pour but d'étudier le plus précisément possible « le fonctionnement de votre vessie » dans votre vie quotidienne et ainsi de mieux comprendre les paramètres en cause de vos troubles urinaires.  Il peut également servir à contrôler ou surveiller le résultat d'un traitement médical et/ou chirurgical,  Il ne faut donc pas modifier vos habitudes alimentaires, vos boissons et votre façon d'aller aux toilettes.  Pour effectuer ce calendrier mictionnel :   Il vous est demandé de le faire sur 3 jours (non obligatoirement consécutifs)  •   Du premier lever du matin (quand vous commencez votre journée)  •   Jusqu’au premier lever du lendemain matin (pendant 24 heures, nuit comprise).  Chaque jour choisi pour ces mesures il faut :  •   Noter l'heure de chaque miction (action d'aller uriner) en commençant par la première  miction du matin avec intention de se lever (quand vous commencez votre journée).  •   Noter l’heure du LEVER et du COUCHER  •   Mesurer la quantité de chaque miction en millilitres à l'aide d'un verre mesureur  (3 euros dans le commerce)  Faire l'addition de ces quantités mesurées par jour (pour obtenir la quantité d'urine par 24h).  Signaler dans la case « Fuites » :  •   la survenue de fuites et leur importance (+, ++ ou +++),  •   les circonstances de survenue de ces fuites   (T = toux, M = marche, U=Urgenturie, Ins = insensible, etc).  Signaler dans la case « Urgence »  •   la survenue des Urgences et leur importance (+, ++ ou +++),  Signaler également tout autre symptôme remarquable. Nous vous remercions de suivre attentivement ces conseils pour la réalisation la plus précise de votre catalogue mictionnel.`,
    type: 'textarea',
  },
  {
    id: 'block-02',
    label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonnée  Jour 1   Date :  Heure   Volume uriné  (en ml)  Si fuite  (+ à +++)  Si urgence  (+ à +++)  Si douleurs  (1 à 10)  Total du nombre de  mictions :  Volume total :   Total nombre  de fuites :  Total nombre  d’urgences :`,
    type: 'textarea',
  },
  {
    id: 'block-03',
    label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonnée  Jour 2   Date :  Heure   Volume uriné  (en ml)  Si fuite  (+ à +++)  Si urgence  (+ à +++)  Si douleurs  (1 à 10)  Total du nombre de  mictions :  Volume total :   Total nombre  de fuites :  Total nombre  d’urgences :`,
    type: 'textarea',
  },
  {
    id: 'block-04',
    label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonnée  Jour 3   Date :  Heure   Volume uriné  (en ml)  Si fuite  (+ à +++)  Si urgence  (+ à +++)  Si douleurs  (1 à 10)  Total du nombre de  mictions :  Volume total :   Total nombre  de fuites :  Total nombre  d’urgences :`,
    type: 'textarea',
  }
  ],
};
