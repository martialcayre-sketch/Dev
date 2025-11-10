import { auth } from '@/lib/firebase';
import api from '@/services/api';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Tooltip as RadarTooltip,
  ResponsiveContainer,
} from 'recharts';

// Types - Support scoring pondéré SIIN
export type LJValue = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 9 | 12;
export type SphereKey =
  | 'sommeil'
  | 'rythme'
  | 'stress'
  | 'activite'
  | 'toxiques'
  | 'relations'
  | 'alimentation';

type Question = {
  id: string;
  label: string;
  options: Array<{ label: string; value: LJValue }>;
};

type Sphere = {
  key: SphereKey;
  title: string;
  emoji: string;
  color: string;
  questions: Question[];
  maxScore: number; // Score maximum pour cette sphère
  thresholds: { satisfaisant: number; insuffisant: number }; // Seuils d'interprétation SIIN
};

export type LifeJourneyResult = {
  answers: Record<SphereKey, Record<string, LJValue>>;
  scores: Record<SphereKey, { raw: number; max: number; percent: number }>; // Scores bruts et en %
  global: number; // 0..100
  completedAt: string; // ISO string
};

// Data - Questions exactes du document SIIN "Questionnaire contextuel de mode de vie"
const SPHERES: Sphere[] = [
  {
    key: 'sommeil',
    title: 'Votre sommeil',
    emoji: '🌙',
    color: 'indigo',
    maxScore: 28,
    thresholds: { satisfaisant: 15, insuffisant: 10 },
    questions: [
      {
        id: 'qualite_sommeil',
        label: 'Estimez-vous avoir un sommeil satisfaisant ?',
        options: [
          { label: 'Excellent sommeil', value: 4 },
          { label: 'Tout à fait satisfaisant', value: 3 },
          { label: 'Plutôt satisfaisant', value: 2 },
          { label: 'Peu satisfaisant', value: 1 },
          { label: 'Pas du tout satisfaisant', value: 0 },
        ],
      },
      {
        id: 'difficultes_sommeil',
        label: 'Avez-vous des difficultés pour vous endormir ou pour rester endormi ?',
        options: [
          { label: 'Jamais', value: 4 },
          { label: 'Légère', value: 3 },
          { label: 'Moyenne', value: 2 },
          { label: 'Importante', value: 1 },
          { label: 'Extrême', value: 0 },
        ],
      },
      {
        id: 'reveil',
        label: 'Comment vous sentez-vous le matin au réveil ?',
        options: [
          { label: 'Reposé et en forme', value: 4 },
          { label: 'À la fois en forme et un peu fatigué', value: 3 },
          { label: 'Fatigué', value: 2 },
          { label: 'Très fatigué et sans énergie', value: 1 },
          { label: 'Épuisé', value: 0 },
        ],
      },
      {
        id: 'duree_sommeil',
        label: "Combien d'heures de sommeil avez-vous en moyenne ?",
        options: [
          { label: '> 8h30', value: 4 },
          { label: '7h30 à 8h30', value: 3 },
          { label: '6h30 à 7h30', value: 2 },
          { label: '5h30 à 6h30', value: 1 },
          { label: '< 5h30', value: 0 },
        ],
      },
      {
        id: 'manque_sommeil',
        label: 'Estimez-vous manquer de temps de sommeil ?',
        options: [
          { label: 'Pas du tout', value: 12 },
          { label: 'Légèrement', value: 9 },
          { label: 'Moyennement', value: 6 },
          { label: 'Importante', value: 3 },
          { label: 'Extrêmement', value: 0 },
        ],
      },
    ],
  },
  {
    key: 'rythme',
    title: 'Votre rythme biologique',
    emoji: '⏰',
    color: 'violet',
    maxScore: 28,
    thresholds: { satisfaisant: 15, insuffisant: 10 },
    questions: [
      {
        id: 'ecoute_rythme',
        label: "Le soir lorsque je ressens l'envie de dormir je m'écoute et je respecte mon rythme",
        options: [
          { label: 'le plus souvent', value: 4 },
          { label: 'Fréquemment', value: 3 },
          { label: 'Très occasionnellement', value: 2 },
          { label: 'Rarement', value: 1 },
          { label: 'Jamais', value: 0 },
        ],
      },
      {
        id: 'horaires_reguliers',
        label:
          'Avez-vous des horaires de sommeil réguliers ? (heures de lever et de coucher régulières)',
        options: [
          { label: 'Oui toujours', value: 8 },
          { label: 'Variable mais très fréquent', value: 6 },
          { label: 'Irrégulier', value: 4 },
          { label: 'Très irrégulier', value: 2 },
          { label: 'Jamais', value: 0 },
        ],
      },
      {
        id: 'travail_poste',
        label:
          'Dans votre métier, avez-vous un travail posté, un travail de nuit, les décalages horaires ?',
        options: [
          { label: 'Non, jamais', value: 8 },
          { label: 'Très rarement', value: 6 },
          { label: 'Fréquemment', value: 4 },
          { label: 'Régulièrement', value: 2 },
          { label: 'Tout le temps', value: 0 },
        ],
      },
      {
        id: 'ecrans_soir',
        label:
          'Regardez-vous des écrans lumineux le soir après 20 heures (téléphone, ordinateur, tablette)',
        options: [
          { label: 'Jamais', value: 4 },
          { label: 'Très rarement', value: 3 },
          { label: 'Occasionnellement', value: 2 },
          { label: 'Fréquemment', value: 1 },
          { label: 'Oui le plus souvent', value: 0 },
        ],
      },
      {
        id: 'sommeil_avant_minuit',
        label: 'Avez-vous des heures de sommeil avant minuit ?',
        options: [
          { label: 'Oui toujours', value: 4 },
          { label: 'Oui au moins 3 à 4 x /sem', value: 3 },
          { label: 'Oui au moins 1 à 2 x /sem', value: 2 },
          { label: 'Rarement', value: 1 },
          { label: 'Jamais', value: 0 },
        ],
      },
    ],
  },
  {
    key: 'stress',
    title: 'Votre adaptation et le stress',
    emoji: '🧘',
    color: 'emerald',
    maxScore: 28,
    thresholds: { satisfaisant: 18, insuffisant: 10 },
    questions: [
      {
        id: 'reaction_stress',
        label: 'Comment réagissez-vous en situation de stress habituellement ?',
        options: [
          { label: 'Prise de recul et sérénité toujours', value: 8 },
          { label: 'Prise de recul le plus souvent', value: 6 },
          { label: 'Stress occasionnel et vulnérable', value: 4 },
          { label: 'Stress fréquent', value: 2 },
          { label: 'Dépassé', value: 0 },
        ],
      },
      {
        id: 'troubles_stress',
        label:
          'Lors de situations stressantes imprévues, ressentez-vous des troubles (palpitations, angoisse, insomnie, troubles digestifs...) ?',
        options: [
          { label: 'Jamais', value: 4 },
          { label: 'Rarement', value: 3 },
          { label: 'Occasionnelle', value: 2 },
          { label: 'Fréquemment', value: 1 },
          { label: 'Toujours', value: 0 },
        ],
      },
      {
        id: 'source_stress',
        label:
          'Estimez-vous que votre vie personnelle, familiale ou professionnelle est une source de stress ?',
        options: [
          { label: 'Peu de stress', value: 4 },
          { label: 'Stress modéré', value: 3 },
          { label: 'Stress occasionnel', value: 2 },
          { label: 'Stressé, par à-coups', value: 1 },
          { label: 'Très stressé en permanence', value: 0 },
        ],
      },
      {
        id: 'entourage_stress',
        label:
          'Est-ce que vos proches ou votre entourage disent de vous que vous êtes une personne très stressée ?',
        options: [
          { label: 'Jamais', value: 4 },
          { label: 'Rarement', value: 3 },
          { label: 'Occasionnelle', value: 2 },
          { label: 'Fréquemment', value: 1 },
          { label: 'Toujours', value: 0 },
        ],
      },
      {
        id: 'gestion_stress',
        label:
          'Pratiquez-vous une méthode de gestion du stress (relaxation, sophrologie, yoga, méditation, jardinage, promenade dans la nature...) ?',
        options: [
          { label: 'Oui très efficace', value: 8 },
          { label: 'Oui mais efficacité insuffisant', value: 6 },
          { label: 'Parfois', value: 4 },
          { label: 'Très rarement', value: 2 },
          { label: 'Non, jamais', value: 0 },
        ],
      },
    ],
  },
  {
    key: 'activite',
    title: 'Votre activité physique',
    emoji: '🏃',
    color: 'amber',
    maxScore: 20,
    thresholds: { satisfaisant: 14, insuffisant: 7 },
    questions: [
      {
        id: 'activite_intense',
        label:
          'À quelle fréquence pratiquez-vous une activité physique ou sportive intense ? (dans votre métier ou vos loisirs)',
        options: [
          { label: 'Régulièrement ≥ 7h/sem', value: 4 },
          { label: '3 à 6h/sem', value: 3 },
          { label: '1 à 3h/sem', value: 2 },
          { label: '< 1h/sem', value: 1 },
          { label: 'Je ne pratique pas', value: 0 },
        ],
      },
      {
        id: 'activite_moderee',
        label:
          'À quelle fréquence avez-vous une activité physique modérée ? (type marche sans essoufflement)',
        options: [
          { label: 'Régulièrement ≥ 7h/sem', value: 4 },
          { label: '3 à 6h/sem', value: 3 },
          { label: '1 à 3h/sem', value: 2 },
          { label: '< 1h/sem', value: 1 },
          { label: 'Je ne pratique pas', value: 0 },
        ],
      },
      {
        id: 'activite_douce',
        label:
          'À quelle fréquence avez-vous une activité corporelle "douce" ? (type séance de gymnastique, yoga, stretching...)',
        options: [
          { label: 'Oui tous les jours', value: 4 },
          { label: 'plusieurs fois par semaine', value: 3 },
          { label: 'Une fois par semaine', value: 2 },
          { label: 'Occasionnellement', value: 1 },
          { label: 'Jamais', value: 0 },
        ],
      },
      {
        id: 'niveau_quotidien',
        label: "Quel est votre niveau d'activité dans votre vie quotidienne ?",
        options: [
          { label: 'Je suis actif(ve) régulièrement', value: 4 },
          { label: 'Plutôt actif(ve)', value: 3 },
          { label: 'Variable', value: 2 },
          { label: 'Je suis plutôt modéré', value: 1 },
          { label: 'Je suis plutôt inactif(ve)', value: 0 },
        ],
      },
      {
        id: 'temps_assis',
        label: "Quel est votre temps passé assis, immobile sans bouger (d'affilée) ?",
        options: [
          { label: 'Jamais plus de 30 minutes', value: 4 },
          { label: "Jamais plus d'1 heure", value: 3 },
          { label: 'Jamais plus de 2h', value: 2 },
          { label: 'Entre 3 et 5h/jour', value: 1 },
          { label: 'Plus de 5h/jour', value: 0 },
        ],
      },
    ],
  },
  {
    key: 'toxiques',
    title: 'Votre exposition aux toxiques',
    emoji: '🚫',
    color: 'rose',
    maxScore: 28,
    thresholds: { satisfaisant: 15, insuffisant: 10 },
    questions: [
      {
        id: 'environnement_pollue',
        label:
          'Êtes-vous exposé à un environnement pollué ou potentiellement toxique ? (lieu de travail, Pollution industrielle, fumée, bruit excessif...)',
        options: [
          { label: 'Jamais', value: 4 },
          { label: 'Rarement', value: 3 },
          { label: 'Occasionnellement', value: 2 },
          { label: 'Fréquemment', value: 1 },
          { label: 'Très fréquemment', value: 0 },
        ],
      },
      {
        id: 'tabac',
        label: 'Consommez-vous du tabac ?',
        options: [
          { label: "Je n'ai jamais fumé", value: 12 },
          { label: "J'ai arrêté de fumer", value: 9 },
          { label: 'Je fume très occasionnellement', value: 6 },
          { label: 'Je souhaite arrêter de fumer', value: 3 },
          { label: 'Je suis fumeur au quotidien', value: 0 },
        ],
      },
      {
        id: 'cannabis',
        label: 'Consommez-vous du cannabis ou autre drogue... ?',
        options: [
          { label: 'Jamais', value: 4 },
          { label: 'Exceptionnellement', value: 3 },
          { label: 'Occasionnellement', value: 2 },
          { label: 'Fréquemment', value: 1 },
          { label: 'Régulièrement', value: 0 },
        ],
      },
      {
        id: 'alcool',
        label:
          "Consommez-vous de l'alcool (vin, bière, apéritif, autres boissons alcoolisées...) ?",
        options: [
          { label: 'Jamais', value: 4 },
          { label: 'Occasionnellement', value: 3 },
          { label: 'Parfois', value: 2 },
          { label: 'Fréquemment', value: 1 },
          { label: 'Une fois par jour ou plus', value: 0 },
        ],
      },
      {
        id: 'produits_grilles',
        label:
          'Consommez-vous des produits très cuits ou grillés (barbecue, pain grillé, friture...) ?',
        options: [
          { label: 'Jamais ou occasionnellement rarement', value: 4 },
          { label: '1 fois/semaine', value: 3 },
          { label: '2 à 3 fois/semaine', value: 2 },
          { label: 'Plus de 3 fois/semaine', value: 1 },
          { label: 'Tous les jours', value: 0 },
        ],
      },
    ],
  },
  {
    key: 'relations',
    title: 'Votre relation aux autres',
    emoji: '🤝',
    color: 'blue',
    maxScore: 20,
    thresholds: { satisfaisant: 14, insuffisant: 7 },
    questions: [
      {
        id: 'isolement',
        label: "J'ai peu de contacts, je me sens isolé, je souffre de solitude",
        options: [
          { label: 'Jamais', value: 4 },
          { label: 'Rarement', value: 3 },
          { label: 'Occasionnellement', value: 2 },
          { label: 'le plus souvent', value: 1 },
          { label: 'toujours en effet', value: 0 },
        ],
      },
      {
        id: 'activites_sociales',
        label: "J'ai de nombreuses activités sociales, des réseaux sociaux importants",
        options: [
          { label: 'Tout à fait', value: 4 },
          { label: 'Plutôt actif(ve)', value: 3 },
          { label: 'Moyen', value: 2 },
          { label: 'Pas très actif(ve)', value: 1 },
          { label: 'Pas du tout', value: 0 },
        ],
      },
      {
        id: 'relations_toxiques',
        label:
          'Dans mon quotidien je souffre de relations familiales ou professionnelles toxiques, de harcèlement',
        options: [
          { label: 'Jamais', value: 4 },
          { label: 'Très rarement', value: 3 },
          { label: 'Parfois', value: 2 },
          { label: 'Fréquemment', value: 1 },
          { label: 'Oui', value: 0 },
        ],
      },
      {
        id: 'conflits_familiaux',
        label:
          'Au sein de ma famille, parents, enfants, conjoints, je ressens de nombreux conflits',
        options: [
          { label: 'Jamais', value: 4 },
          { label: 'Très rarement', value: 3 },
          { label: 'Parfois', value: 2 },
          { label: 'Fréquemment', value: 1 },
          { label: 'Oui', value: 0 },
        ],
      },
      {
        id: 'communication',
        label: "J'ai des facilités de communication et d'expression de mon ressenti",
        options: [
          { label: 'Tout à fait', value: 4 },
          { label: 'Plutôt', value: 3 },
          { label: 'Selon les circonstances', value: 2 },
          { label: "j'ai plutôt des difficultés", value: 1 },
          { label: "j'ai beaucoup de difficultés", value: 0 },
        ],
      },
    ],
  },
  {
    key: 'alimentation',
    title: 'Votre mode alimentaire',
    emoji: '🍽️',
    color: 'teal',
    maxScore: 28, // 7 questions × 4 points
    thresholds: { satisfaisant: 21, insuffisant: 11 },
    questions: [
      {
        id: 'recommandations_pnns',
        label:
          "Je connais et j'adopte les recommandations d'alimentation-santé (telles que celles du PNNS 4)",
        options: [
          { label: 'Toujours', value: 4 },
          { label: 'Régulièrement', value: 3 },
          { label: 'Occasionnellement', value: 2 },
          { label: 'Rarement', value: 1 },
          { label: 'Jamais', value: 0 },
        ],
      },
      {
        id: 'aliments_sains',
        label:
          "Je favorise l'achat et la consommation des aliments sains, de saison, peu transformés, complets et bio",
        options: [
          { label: 'Toujours', value: 4 },
          { label: 'Très fréquemment', value: 3 },
          { label: 'Régulièrement', value: 2 },
          { label: 'Rarement même jamais', value: 1 },
          { label: 'Jamais', value: 0 },
        ],
      },
      {
        id: 'limite_charcuterie',
        label: 'Je limite la consommation de charcuterie, viande rouge',
        options: [
          { label: 'Toujours', value: 4 },
          { label: 'Très fréquemment', value: 3 },
          { label: 'Occasionnellement', value: 2 },
          { label: 'Rarement', value: 1 },
          { label: 'Jamais', value: 0 },
        ],
      },
      {
        id: 'limite_sucre_sel',
        label: 'Je limite la consommation de produits salés, de sucreries et de boissons sucrées',
        options: [
          { label: 'Toujours', value: 4 },
          { label: 'Très fréquemment', value: 3 },
          { label: 'Occasionnellement', value: 2 },
          { label: 'Rarement', value: 1 },
          { label: 'Jamais', value: 0 },
        ],
      },
      {
        id: 'produits_vegetaux',
        label:
          'Je favorise la consommation de produits végétaux, fruits, légumes, légumes secs, noix...',
        options: [
          { label: 'Toujours', value: 4 },
          { label: 'Très fréquemment', value: 3 },
          { label: 'Occasionnellement', value: 2 },
          { label: 'Rarement', value: 1 },
          { label: 'Jamais', value: 0 },
        ],
      },
      {
        id: 'poissons_huiles',
        label: "Je favorise la consommation de poissons gras, d'huile de colza ou d'olive",
        options: [
          { label: 'Toujours', value: 4 },
          { label: 'Très fréquemment', value: 3 },
          { label: 'Occasionnellement', value: 2 },
          { label: 'Rarement', value: 1 },
          { label: 'Jamais', value: 0 },
        ],
      },
      {
        id: 'cuisine_saine',
        label:
          'Je favorise une cuisine saine, fait maison, limitant les cuissons excessives (BBQ, fritures...)',
        options: [
          { label: 'Toujours', value: 4 },
          { label: 'Très fréquemment', value: 3 },
          { label: 'Occasionnellement', value: 2 },
          { label: 'Rarement', value: 1 },
          { label: 'Jamais', value: 0 },
        ],
      },
    ],
  },
];

// Calcul du score brut pour une sphère (somme des points)
function sphereRawScore(sphere: Sphere, answers: Record<string, LJValue>): number {
  return sphere.questions.reduce((sum, q) => {
    const val = answers[q.id];
    return sum + (val !== undefined ? val : 0);
  }, 0);
}

// Interprétation du score SIIN
function sphereInterpretation(sphere: Sphere, rawScore: number): string {
  if (rawScore >= sphere.thresholds.satisfaisant) return 'satisfaisant';
  if (rawScore >= sphere.thresholds.insuffisant) return 'insuffisant';
  return 'non satisfaisant';
}

export default function LifeJourney7Spheres(props: {
  onSubmit?: (result: LifeJourneyResult) => void;
  disabled?: boolean;
}) {
  const { onSubmit, disabled = false } = props;
  const [active, setActive] = useState<SphereKey | null>(null);
  const [answers, setAnswers] = useState<Record<SphereKey, Record<string, LJValue>>>({
    sommeil: {},
    rythme: {},
    stress: {},
    activite: {},
    toxiques: {},
    relations: {},
    alimentation: {},
  });
  const [isSaving, setIsSaving] = useState(false);
  // On Node + browser type mismatch (setTimeout returns number in browsers, Timeout in Node typings via @types/node).
  // Use ReturnType<typeof setTimeout> for compatibility across environments.
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const counts = useMemo(() => {
    const perSphere = Object.fromEntries(
      SPHERES.map((s) => [s.key, Object.keys(answers[s.key] || {}).length])
    ) as Record<SphereKey, number>;
    const total = Object.values(perSphere).reduce((a, b) => a + b, 0);
    const totalQuestions = SPHERES.reduce((sum, s) => sum + s.questions.length, 0);
    return { perSphere, total, totalQuestions };
  }, [answers]);

  const perSphereScores = useMemo(() => {
    const out = {} as Record<SphereKey, { raw: number; max: number; percent: number }>;
    for (const s of SPHERES) {
      const raw = sphereRawScore(s, answers[s.key] || {});
      const percent = Math.round((raw / s.maxScore) * 100);
      out[s.key] = { raw, max: s.maxScore, percent };
    }
    return out;
  }, [answers]);

  const globalScore = useMemo(() => {
    const percents = Object.values(perSphereScores).map((s) => s.percent);
    if (percents.length === 0) return 0;
    return Math.round(percents.reduce((a, b) => a + b, 0) / percents.length);
  }, [perSphereScores]);

  const radarData = useMemo(
    () =>
      SPHERES.map((s) => ({
        axis: s.title,
        score: perSphereScores[s.key]?.percent || 0,
      })),
    [perSphereScores]
  );

  // Auto-save avec debounce (1.5s)
  const autoSave = useCallback(async () => {
    const user = auth.currentUser;
    if (!user || disabled) return;

    try {
      setIsSaving(true);
      // Aplatir les réponses pour l'API
      const responses: Record<string, number> = {};
      for (const [sphere, qMap] of Object.entries(answers)) {
        for (const [qid, val] of Object.entries(qMap as Record<string, number>)) {
          responses[`${sphere}.${qid}`] = Number(val);
        }
      }
      // Ajouter les scores
      for (const [sphere, sc] of Object.entries(perSphereScores)) {
        responses[`score.${sphere}`] = sc.percent;
      }
      responses['score.global'] = globalScore;

      await api.saveQuestionnaireResponses(user.uid, 'life-journey', responses);
      console.log('[LifeJourney] Auto-saved');
    } catch (error) {
      console.warn('[LifeJourney] Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  }, [answers, perSphereScores, globalScore, disabled]);

  // Déclencher l'auto-save avec debounce quand answers change
  useEffect(() => {
    if (
      Object.keys(answers.sommeil).length === 0 &&
      Object.keys(answers.rythme).length === 0 &&
      Object.keys(answers.stress).length === 0 &&
      Object.keys(answers.activite).length === 0 &&
      Object.keys(answers.toxiques).length === 0 &&
      Object.keys(answers.relations).length === 0 &&
      Object.keys(answers.alimentation).length === 0
    ) {
      // Pas encore de réponses, skip
      return;
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      autoSave();
    }, 1500);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [answers, autoSave]);

  const allAnswered = counts.total === counts.totalQuestions;

  // Shuffle options to avoid cognitive bias - memoized per question
  const shuffledOptions = useMemo(() => {
    const result: Record<string, Array<{ label: string; value: LJValue }>> = {};
    for (const sphere of SPHERES) {
      for (const question of sphere.questions) {
        const shuffled = [...question.options].sort(() => Math.random() - 0.5);
        result[question.id] = shuffled;
      }
    }
    return result;
  }, []);

  function setValue(s: SphereKey, qid: string, value: LJValue) {
    setAnswers((prev) => ({
      ...prev,
      [s]: { ...(prev[s] || {}), [qid]: value },
    }));
  }

  function buildResult(): LifeJourneyResult {
    return {
      answers,
      scores: perSphereScores,
      global: globalScore,
      completedAt: new Date().toISOString(),
    };
  }

  function submitIfComplete() {
    if (!allAnswered) return;
    onSubmit?.(buildResult());
  }

  // Lightweight runtime tests (dev feedback only)
  if (import.meta && import.meta.env && import.meta.env.DEV) {
    const totalQs = SPHERES.reduce((acc, s) => acc + s.questions.length, 0);
    console.assert(totalQs === 34, `[LifeJourney] Expected 34 questions, got ${totalQs}`);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h2 className="text-2xl font-bold text-white">Mode de vie – 7 Sphères Vitales</h2>
          <p className="text-white/70">Questionnaire contextuel de mode de vie (SIIN)</p>
        </div>
      </div>

      {/* Global progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs text-white/60">
            {counts.total} / {counts.totalQuestions} répondues
          </div>
          {isSaving && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white/10 border-t-nn-primary-500" />
              Sauvegarde...
            </div>
          )}
        </div>
        <div className="h-2 w-full overflow-hidden rounded bg-white/10">
          <div
            className="h-2 bg-nn-primary-500 transition-all"
            style={{ width: `${(counts.total / counts.totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Spheres grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {SPHERES.map((s) => {
          const answered = counts.perSphere[s.key] || 0;
          const score = perSphereScores[s.key];
          const interpretation = sphereInterpretation(s, score?.raw || 0);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => !disabled && setActive(s.key)}
              disabled={disabled}
              className={`group rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white/10'}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl" aria-hidden>
                    {s.emoji}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                    {score && (
                      <p className="text-xs text-white/60">
                        {score.raw}/{score.max} pts ({interpretation})
                      </p>
                    )}
                  </div>
                </div>
                <span className="rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-xs text-white/70">
                  {answered}/{s.questions.length}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded bg-white/10">
                <div
                  className={`h-1.5 bg-${s.color}-400`}
                  style={{ width: `${(answered / s.questions.length) * 100}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Radar + summary */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-white/90">Radar des scores</h4>
            <span className="text-xs text-white/60">Score global: {globalScore} / 100</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer>
              <RadarChart data={radarData} outerRadius={90}>
                <PolarGrid />
                <PolarAngleAxis dataKey="axis" stroke="#CBD5E1" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tickCount={6} stroke="#CBD5E1" />
                <RadarTooltip formatter={(v: any) => `${v} / 100`} labelFormatter={(l) => `${l}`} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.35}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <h4 className="mb-3 text-sm font-semibold text-white/90">Synthèse par sphère</h4>
          <div className="space-y-2">
            {SPHERES.map((s) => {
              const score = perSphereScores[s.key];
              return (
                <div key={s.key} className="grid grid-cols-[1.5rem_1fr_auto] items-center gap-3">
                  <span className="text-lg" aria-hidden>
                    {s.emoji}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm text-white/90">{s.title}</p>
                      <p className="text-xs text-white/60">
                        {score?.raw || 0}/{score?.max || 0}
                      </p>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded bg-white/10">
                      <div
                        className={`h-1.5 bg-${s.color}-400`}
                        style={{ width: `${score?.percent || 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="rounded border border-white/10 bg-slate-900 px-2 py-0.5 text-[11px] text-white/70">
                    {counts.perSphere[s.key] || 0}/{s.questions.length}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <button
              type="button"
              disabled={!allAnswered || disabled}
              onClick={submitIfComplete}
              className="rounded-lg bg-nn-primary-500 px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Terminer et valider
            </button>
          </div>
        </div>
      </div>

      {/* Active sphere panel */}
      {active && (
        <div
          className="fixed inset-0 z-40 flex items-end bg-black/50 p-3 sm:items-center sm:justify-center"
          onClick={() => !disabled && setActive(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/10 bg-slate-950 p-5 shadow-lg transition-all duration-200"
            onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
          >
            {(() => {
              const s = SPHERES.find((x) => x.key === active)!;
              const score = perSphereScores[s.key];
              return (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl" aria-hidden>
                        {s.emoji}
                      </span>
                      <div>
                        <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                        {score && (
                          <p className="text-sm text-white/60">
                            Score: {score.raw}/{score.max} pts ({sphereInterpretation(s, score.raw)}
                            )
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActive(null)}
                      className="rounded-lg border border-white/15 px-3 py-1.5 text-white/80 hover:bg-white/10"
                    >
                      Fermer
                    </button>
                  </div>

                  <div className="space-y-3">
                    {s.questions.map((q, idx) => {
                      const val = answers[s.key]?.[q.id];
                      return (
                        <div
                          key={q.id}
                          className="rounded-xl border border-white/10 bg-slate-900 p-3"
                        >
                          <div className="mb-2">
                            <p className="text-sm font-medium text-white">
                              <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] text-white/70">
                                {idx + 1}
                              </span>
                              {q.label}
                            </p>
                          </div>
                          <div className="space-y-1">
                            {shuffledOptions[q.id]?.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setValue(s.key, q.id, opt.value)}
                                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                                  val === opt.value
                                    ? 'border-nn-primary-500 bg-nn-primary-500/20 text-white'
                                    : 'border-white/10 bg-slate-800 text-white/80 hover:bg-slate-700'
                                }`}
                              >
                                <span className="font-medium">{opt.label}</span>
                                <span className="ml-2 text-xs text-white/50">
                                  ({opt.value} pts)
                                </span>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-white/60">
                      Répondu : {counts.perSphere[s.key] || 0} / {s.questions.length}
                    </div>
                    <button
                      type="button"
                      onClick={() => setActive(null)}
                      className="rounded-lg bg-nn-primary-500 px-3 py-1.5 text-white"
                    >
                      Valider la sphère
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
