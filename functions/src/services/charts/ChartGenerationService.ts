/**
 * 🧠 NeuroNutrition - Service de Génération de Graphiques
 *
 * Service backend pour générer des graphiques SVG/JSON pour les frontends
 */

import type { GenericScoringResult, QuestionnaireType } from '../scoring/UnifiedScoringService';

export interface ChartConfig {
  type: 'radar' | 'bar' | 'line' | 'pie';
  title: string;
  subtitle?: string;
  width: number;
  height: number;
  colors: string[];
  ageVariant?: 'adult' | 'teen' | 'kid';
}

export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }>;
}

export interface GeneratedChart {
  type: string;
  config: ChartConfig;
  data: ChartData;
  svg?: string; // SVG généré pour export
  metadata: {
    generatedAt: string;
    questionnaireType: QuestionnaireType;
    patientUid: string;
    version: string;
  };
}

/**
 * 🎨 Service principal de génération de graphiques
 */
export class ChartGenerationService {
  private static readonly VERSION = '1.0.0';

  /**
   * 🎯 Point d'entrée principal pour générer un graphique
   */
  public static async generateChart(
    questionnaireType: QuestionnaireType,
    scoringResult: GenericScoringResult,
    patientUid: string,
    chartType: 'radar' | 'bar' | 'line' | 'pie' = 'radar',
    ageVariant: 'adult' | 'teen' | 'kid' = 'adult'
  ): Promise<GeneratedChart> {
    const config = this.getChartConfig(questionnaireType, chartType, ageVariant);
    const data = this.transformScoringToChartData(questionnaireType, scoringResult, ageVariant);

    let svg: string | undefined;
    if (chartType === 'radar' || chartType === 'bar') {
      svg = await this.generateSVG(config, data, ageVariant);
    }

    return {
      type: chartType,
      config,
      data,
      svg,
      metadata: {
        generatedAt: new Date().toISOString(),
        questionnaireType,
        patientUid,
        version: this.VERSION,
      },
    };
  }

  /**
   * 📊 Configuration des graphiques par type de questionnaire
   */
  private static getChartConfig(
    questionnaireType: QuestionnaireType,
    chartType: string,
    ageVariant: 'adult' | 'teen' | 'kid'
  ): ChartConfig {
    const baseConfigs: Record<QuestionnaireType, Partial<ChartConfig>> = {
      dnsm: {
        title: this.getAgeAdaptedTitle('Profil Neurotransmetteurs DNSM', ageVariant),
        subtitle: 'Dopamine, Noradrénaline, Sérotonine, Mélatonine',
        colors: ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6'],
      },
      'life-journey': {
        title: this.getAgeAdaptedTitle('Bilan des 7 Sphères de Vie', ageVariant),
        subtitle: 'Énergie, Sommeil, Digestion, Poids, Moral, Mobilité, Social',
        colors: ['#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#06B6D4', '#F97316', '#84CC16'],
      },
      stress: {
        title: this.getAgeAdaptedTitle('Profil de Stress', ageVariant),
        subtitle: '7 dimensions du stress',
        colors: ['#EF4444', '#F59E0B', '#84CC16', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'],
      },
      nutrition: {
        title: this.getAgeAdaptedTitle('Bilan Nutritionnel', ageVariant),
        colors: ['#84CC16', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899'],
      },
      sommeil: {
        title: this.getAgeAdaptedTitle('Qualité du Sommeil', ageVariant),
        colors: ['#1E293B', '#475569', '#64748B', '#94A3B8'],
      },
      'plaintes-et-douleurs': {
        title: this.getAgeAdaptedTitle('Profil Symptômes', ageVariant),
        colors: ['#EF4444', '#F59E0B', '#84CC16', '#06B6D4'],
      },
    };

    const base = baseConfigs[questionnaireType] || {};

    return {
      type: chartType as any,
      title: base.title || 'Résultats',
      subtitle: base.subtitle,
      width: ageVariant === 'kid' ? 400 : 500,
      height: ageVariant === 'kid' ? 400 : 400,
      colors: base.colors || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'],
      ageVariant,
    };
  }

  /**
   * 🎨 Adaptation des titres selon l'âge
   */
  private static getAgeAdaptedTitle(
    baseTitle: string,
    ageVariant: 'adult' | 'teen' | 'kid'
  ): string {
    if (ageVariant === 'kid') {
      const kidTitles: Record<string, string> = {
        'Profil Neurotransmetteurs DNSM': '🧠 Comment tu te sens ?',
        'Bilan des 7 Sphères de Vie': '🌈 Ta vie en couleurs',
        'Profil de Stress': '😰 Ton niveau de stress',
        'Bilan Nutritionnel': '🍎 Ce que tu manges',
        'Qualité du Sommeil': '😴 Comme tu dors',
        'Profil Symptômes': '🤕 Ce qui te fait mal',
      };
      return kidTitles[baseTitle] || `🌟 ${baseTitle}`;
    }

    if (ageVariant === 'teen') {
      const teenTitles: Record<string, string> = {
        'Profil Neurotransmetteurs DNSM': '🧑 Ton profil neuro',
        'Bilan des 7 Sphères de Vie': '⭐ Tes 7 domaines de vie',
        'Profil de Stress': '💪 Ton stress',
        'Bilan Nutritionnel': '🥗 Ton alimentation',
        'Qualité du Sommeil': '🌙 Ton sommeil',
        'Profil Symptômes': '⚡ Tes symptômes',
      };
      return teenTitles[baseTitle] || `💫 ${baseTitle}`;
    }

    return baseTitle;
  }

  /**
   * 🔄 Transformation des scores en données graphiques
   */
  private static transformScoringToChartData(
    questionnaireType: QuestionnaireType,
    scoringResult: GenericScoringResult,
    ageVariant: 'adult' | 'teen' | 'kid'
  ): ChartData {
    const labels = this.getLabelsForQuestionnaire(questionnaireType, ageVariant);
    const values = Object.values(scoringResult.scores).filter((score) => typeof score === 'number');

    return {
      labels,
      datasets: [
        {
          label: this.getDatasetLabel(questionnaireType, ageVariant),
          data: values.slice(0, labels.length), // Assurer correspondance labels/données
          backgroundColor: this.getBackgroundColors(questionnaireType),
          borderColor: '#1F2937',
          fill: questionnaireType === 'dnsm' || questionnaireType === 'life-journey', // Radar fill
        },
      ],
    };
  }

  /**
   * 🏷️ Labels adaptés par questionnaire et âge
   */
  private static getLabelsForQuestionnaire(
    questionnaireType: QuestionnaireType,
    ageVariant: 'adult' | 'teen' | 'kid'
  ): string[] {
    const labelSets: Record<QuestionnaireType, Record<string, string[]>> = {
      dnsm: {
        adult: ['Dopamine', 'Noradrénaline', 'Sérotonine', 'Mélatonine'],
        teen: ['Motivation', 'Énergie', 'Humeur', 'Sommeil'],
        kid: ['😊 Envie', '⚡ Force', '🌈 Joie', '😴 Dodo'],
      },
      'life-journey': {
        adult: ['Énergie', 'Sommeil', 'Digestion', 'Poids', 'Moral', 'Mobilité', 'Social'],
        teen: ['Énergie', 'Sommeil', 'Digestion', 'Poids', 'Moral', 'Sport', 'Amis'],
        kid: [
          '💪 Force',
          '😴 Dodo',
          '🍽️ Ventre',
          '⚖️ Poids',
          '😊 Sourire',
          '🏃 Bouger',
          '👫 Copains',
        ],
      },
      stress: {
        adult: [
          'Fatigue',
          'Irritabilité',
          'Anxiété',
          'Concentration',
          'Sommeil',
          'Appétit',
          'Motivation',
        ],
        teen: [
          'Fatigue',
          'Énervement',
          'Stress',
          'Concentration',
          'Sommeil',
          'Appétit',
          'Motivation',
        ],
        kid: [
          '😴 Fatigué',
          '😤 Fâché',
          '😰 Peur',
          '🤔 Attention',
          '🛌 Dodo',
          '🍽️ Faim',
          '🎯 Envie',
        ],
      },
      nutrition: {
        adult: ['Fruits/Légumes', 'Céréales', 'Protéines', 'Laitages', 'Graisses', 'Sucres'],
        teen: ['Fruits/Légumes', 'Féculents', 'Protéines', 'Laitages', 'Graisses', 'Sucres'],
        kid: ['🥕 Légumes', '🍞 Pain', '🥩 Viande', '🥛 Lait', '🫒 Huile', '🍭 Bonbons'],
      },
      sommeil: {
        adult: ['Endormissement', 'Réveils', 'Durée', 'Qualité'],
        teen: ['Endormissement', 'Réveils', 'Durée', 'Récupération'],
        kid: ["😴 S'endormir", '😵 Se réveiller', '⏰ Temps', '🌟 Bien dormi'],
      },
      'plaintes-et-douleurs': {
        adult: ['Intensité', 'Fréquence', 'Impact', 'Localisation'],
        teen: ['Douleur', 'Souvent', 'Gêne', 'Où'],
        kid: ['🤕 Mal', '📅 Souvent', '😢 Gêne', '👆 Où'],
      },
    };

    return (
      labelSets[questionnaireType]?.[ageVariant] ||
      labelSets[questionnaireType]?.adult || ['Catégorie 1', 'Catégorie 2', 'Catégorie 3']
    );
  }

  /**
   * 🎨 Couleurs de fond par questionnaire
   */
  private static getBackgroundColors(questionnaireType: QuestionnaireType): string[] {
    const colors: Record<QuestionnaireType, string[]> = {
      dnsm: ['#3B82F6', '#EF4444', '#10B981', '#8B5CF6'],
      'life-journey': ['#F59E0B', '#8B5CF6', '#10B981', '#EF4444', '#06B6D4', '#F97316', '#84CC16'],
      stress: ['#EF4444', '#F59E0B', '#84CC16', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'],
      nutrition: ['#84CC16', '#F59E0B', '#EF4444', '#06B6D4', '#8B5CF6', '#EC4899'],
      sommeil: ['#1E293B', '#475569', '#64748B', '#94A3B8'],
      'plaintes-et-douleurs': ['#EF4444', '#F59E0B', '#84CC16', '#06B6D4'],
    };

    return colors[questionnaireType] || ['#3B82F6', '#EF4444', '#10B981', '#F59E0B'];
  }

  /**
   * 📊 Label du dataset selon questionnaire et âge
   */
  private static getDatasetLabel(
    questionnaireType: QuestionnaireType,
    ageVariant: 'adult' | 'teen' | 'kid'
  ): string {
    if (ageVariant === 'kid') {
      return 'Tes résultats';
    } else if (ageVariant === 'teen') {
      return 'Tes scores';
    }
    return 'Vos résultats';
  }

  /**
   * 🎨 Génération SVG simplifiée (pour export)
   */
  private static async generateSVG(
    config: ChartConfig,
    data: ChartData,
    ageVariant: 'adult' | 'teen' | 'kid'
  ): Promise<string> {
    // Génération SVG simplifiée - en production utiliser une lib comme D3.js ou Chart.js
    const { width, height, title, colors } = config;
    const dataset = data.datasets[0];
    const maxValue = Math.max(...dataset.data);

    let svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`;

    // Titre adapté à l'âge
    const titleY = ageVariant === 'kid' ? 30 : 25;
    const titleSize = ageVariant === 'kid' ? 18 : 16;
    svg += `<text x="${
      width / 2
    }" y="${titleY}" text-anchor="middle" font-size="${titleSize}" font-weight="bold">${title}</text>`;

    // Graphique en barres simple
    const barWidth = (width - 60) / data.labels.length;
    const graphHeight = height - 80;

    data.labels.forEach((label, i) => {
      const value = dataset.data[i] || 0;
      const barHeight = (value / maxValue) * graphHeight * 0.8;
      const x = 30 + i * barWidth;
      const y = height - 50 - barHeight;

      // Barre
      svg += `<rect x="${x + barWidth * 0.1}" y="${y}" width="${
        barWidth * 0.8
      }" height="${barHeight}" fill="${colors[i] || '#3B82F6'}" rx="2"/>`;

      // Label
      const labelSize = ageVariant === 'kid' ? 10 : 9;
      svg += `<text x="${x + barWidth / 2}" y="${
        height - 30
      }" text-anchor="middle" font-size="${labelSize}">${label}</text>`;

      // Valeur
      svg += `<text x="${x + barWidth / 2}" y="${
        y - 5
      }" text-anchor="middle" font-size="12" font-weight="bold">${value}%</text>`;
    });

    svg += '</svg>';
    return svg;
  }
}
