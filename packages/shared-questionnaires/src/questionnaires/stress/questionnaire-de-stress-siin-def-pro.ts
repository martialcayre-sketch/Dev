import type { Questionnaire } from '../../types';

export const questionnaire_de_stress_siin_def_pro: Questionnaire = {
  metadata: {
    id: 'questionnaire-de-stress-siin-def-pro',
    title: `questionnaire de stress siin def pro`,
    category: 'stress',
  },
  questions: [
  {
    id: 'block-01',
    label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonnée  Questionnaire :  Stress  Veuillez remplir spontanément, sans trop réfléchir, le questionnaire individuel suivant composé de 21 questions. Chaque question se réfère aux dernières semaines de façon générale. Les réponses seront cotées 0, 1 ou 2.  N°   Ces dernières semaines je   ressens… Rarement = 0/Parfois = 1/Souvent = 2   0   1   2  A1   J’ai du mal à me réveiller le matin, je dois souvent prendre un café ou des stimulants  A2   Je me sens vite fatigué(e), même sans effort  A3   J’ai des troubles de la concentration, j’oublie des choses facilement  A4   Je me sens moins en forme au quotidien  A5   J’ai parfois des coups de pompe, des vertiges, une faiblesse soudaine  A6   Je suis démotivé(e), je n’ai goût à rien et j’ai tendance à remettre à demain ce que je dois faire  A7   J’ai parfois la tête vide, je suis distrait(e)  B8   Je me sens tendu(e) et nerveux(se), souvent agité(e)  B9   Je rencontre des difficultés pour m’endormir, je pense souvent à des soucis  B10   Je suis nerveux(se), inquiet(e) et parfois anxieux(se)  B11   Je n’arrive pas à prendre du temps pour décompresser, me détendre  B12   Je me réveille souvent dans la nuit ou fin de nuit  B13   Un rien me stress, m’énerve et me fait réagir  B14   Je suis très exigeant(e), envers moi-même et les autres  C15   J’ai souvent mal au dos, à la nuque ou des maux de tête  C16   J’ai des palpitations cardiaques, des tremblements  C17   J’ai une respiration courte et rapide, je suis essoufflé(e), je soupire souvent  C18   J’ai parfois un nœud creux de l’estomac, la gorge serrée  C19   J’ai des troubles digestifs ou intestinaux, des douleurs au ventre  C20   J’ai des secousses musculaires, au niveau du visage, des paupières  C21   Je fume, je bois de l’alcool ou prends d’autres substances pour me stimuler ou me calmer  Score total questions 1 à 7  Score total questions 8 à 14  Score total questions   15   à   21  Score total des 21 questions`,
    type: 'textarea',
  },
  {
    id: 'block-02',
    label: `S.I.I.N.- Scientific Institute for Intelligent Nutrition Institut Scientifique pour une Nutrition Raisonnée  Commentaire pour les professionnels de santé et de soins : « Pro »  Questionnaire score  < 4   Oriente vers les conseils de vie « antistress  5 à 14  Avec une majorité de réponses A   :  oriente vers le   protocole "dopaminergique»   durant 15 jours puis réévaluation du score  Avec une majorité de réponses B :  oriente cers le   protocole «   sérotoinergique »   durant 15 jours puis réévaluation du score  Avec une majorité de réponses C :  oriente vers le   protocole «   mixte dopaminergique + sérotoninergique   »   10 jours puis réévaluation  > 15   Oriente vers le   protocole «   mixte dopaminergique + sérotoninergique   »   durant 10 jours puis réévaluation du score`,
    type: 'textarea',
  }
  ],
};
