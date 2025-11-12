/**
 * Type de question dans un questionnaire
 */
type QuestionType = 'select' | 'number' | 'textarea' | 'scale' | 'slider' | 'multiple-choice';
/**
 * Schéma de couleur pour les questions d'échelle
 */
type ColorScheme = 'fatigue' | 'douleurs' | 'digestion' | 'surpoids' | 'insomnie' | 'moral' | 'mobilite';
/**
 * Type d'échelle
 */
type ScaleType = '0-4' | '0-10' | '1-5';
/**
 * Option de réponse avec points optionnels
 */
interface QuestionOption {
    label: string;
    value: string | number;
    points?: number;
}
/**
 * Question de questionnaire
 */
interface Question {
    id: string;
    label: string;
    section?: string;
    type?: QuestionType;
    scale?: boolean;
    scaleType?: ScaleType;
    colorScheme?: ColorScheme;
    minLabel?: string;
    maxLabel?: string;
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: number;
    labels?: Record<number, string>;
    options?: string[] | QuestionOption[];
    description?: string;
    required?: boolean;
    helpText?: string;
}
/**
 * Section d'un questionnaire
 */
interface QuestionnaireSection {
    id: string;
    title: string;
    description?: string;
    questions: Question[];
}
/**
 * Catégorie médicale
 */
type MedicalCategory = 'alimentaire' | 'cancerologie' | 'cardiologie' | 'gastro-enterologie' | 'gerontologie' | 'mode-de-vie' | 'mode-de-vie-siin' | 'neuro-psychologie' | 'pediatrie' | 'pneumologie' | 'rhumatologie' | 'sommeil' | 'stress' | 'tabacologie' | 'urologie';
/**
 * Métadonnées d'un questionnaire
 */
interface QuestionnaireMetadata {
    id: string;
    title: string;
    category: MedicalCategory;
    description?: string;
    estimatedDuration?: number;
    version?: string;
    author?: string;
    tags?: string[];
}
/**
 * Questionnaire complet
 */
interface Questionnaire {
    metadata: QuestionnaireMetadata;
    sections?: QuestionnaireSection[];
    questions?: Question[];
}
/**
 * Réponse à une question
 */
interface QuestionResponse {
    questionId: string;
    value: string | number | string[];
    timestamp?: Date;
}
/**
 * Réponses complètes à un questionnaire
 */
interface QuestionnaireResponse {
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
interface QuestionnaireResult {
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
interface NeurotransmitterTheme {
    prefix: string;
    label: string;
    description?: string;
}
/**
 * Constantes pour les neurotransmetteurs
 */
declare const NEUROTRANSMITTER_THEMES: readonly NeurotransmitterTheme[];
/**
 * Statut de questionnaire patient
 */
type QuestionnaireStatus = 'pending' | 'in_progress' | 'submitted' | 'completed' | 'reopened';
/**
 * Document questionnaire patient (Firestore)
 */
interface QuestionnaireDoc {
    id: string;
    title: string;
    status: QuestionnaireStatus;
    responses: Record<string, number | string>;
    assignedAt?: Date;
    updatedAt?: Date;
    submittedAt?: Date | null;
    completedAt?: Date | null;
}
/**
 * Élément d'inbox praticien
 */
interface PractitionerInboxItem {
    id: string;
    type: 'questionnaire_submission';
    patientId: string;
    questionnaireId: string;
    questionnaireTitle: string;
    status: 'new' | 'read' | 'archived';
    submittedAt: Date;
}

declare const evaluation_des_apports_caloriques_et_proteiques_alimentaires_selon_le_pr_l_monnier_def_patient: Questionnaire;

declare const monnier_def_pro: Questionnaire;

declare const questionnaire_alimentaire_de_diete_mediterraneenne_def: Questionnaire;

declare const questionnaire_alimentaire_siin_def_pro: Questionnaire;

declare const questionnaire_cancero_qlq_br23_def_pro: Questionnaire;

declare const questionnaire_cancero_qlq_c30_def_pro: Questionnaire;

declare const questionnaire_troubles_fonctionnels_cardio_metabolique_def_pro: Questionnaire;

declare const questionnaire_de_bristol_pro_def: Questionnaire;

declare const questionnaire_troubles_fonctionnels_digestifs_et_intestinaux_def_my_et_pro: Questionnaire;

declare const score_de_francis_des_troubles_fonctionnels_intestinaux_def_pro: Questionnaire;

declare const questionnaire_sarcopenie_pro: Questionnaire;

declare const tinetti: Questionnaire;

declare const mes_plaintes_actuelles_et_troubles_ressentis: Questionnaire;

declare const questionnaire_contextuel_mode_de_vie_pro_def: Questionnaire;

declare const questionnaire_dactivite_et_de_depense_energetique_globale_siin_def_pro: Questionnaire;

declare const auto_anxiete_def_pro: Questionnaire;

declare const bdi_echelle_de_depression_de_beck_def_pro: Questionnaire;

declare const dependance_a_internet_def_pro: Questionnaire;

declare const echelle_ecab_def_pro: Questionnaire;

declare const grille_de_zarit_mesure_de_la_charge_des_proches_aidants_def_pro: Questionnaire;

declare const hamilton_def_pro: Questionnaire;

declare const hit_de_patients_migraineux_def_pro: Questionnaire;

declare const hypersensibilite_au_deficit_en_magnesium_def_pro: Questionnaire;

declare const idtas_ae_auto_eval_depression_trouble_affectif_saisonnier_def_pro: Questionnaire;

declare const madrs_echelle_de_depression_def_pro: Questionnaire;

declare const maladie_dalzheimer_def_pro: Questionnaire;

declare const mini_mental_state_examination_mmse_def_pro: Questionnaire;

declare const questionnaire_audit_alcool_def_pro: Questionnaire;

declare const questionnaire_de_dependance_a_un_medicament_def_pro: Questionnaire;

declare const questionnaire_de_scoff_def_pro: Questionnaire;

declare const questionnaire_dopamine_noradrenaline_serotonine_melatonine_def_my_et_pro: Questionnaire;

declare const questionnaire_fonctionnel_dhyperexcitabilite_def_pro: Questionnaire;

declare const questionnaire_reperage_des_troubles_dementiels_def_pro: Questionnaire;

declare const questionnaire_test_des_5_mots_def_pro: Questionnaire;

declare const questionnaire_the_work_addiction_risk_test_wart_def_pro: Questionnaire;

declare const test_echelle_had_def_my_et_pro: Questionnaire;

declare const upps_impulsivite_def_pro: Questionnaire;

declare const conners_enseignant_version2_courte: Questionnaire;

declare const echelle_de_conners_tdah_interpretation: Questionnaire;

declare const echelle_de_matinalite_vesperalite_pour_l_enfant_def_pro: Questionnaire;

declare const questionnaire_bpco_def_pro: Questionnaire;

declare const first_def_pro: Questionnaire;

declare const mesure_de_limpact_de_la_fibromyalgie_def_pro: Questionnaire;

declare const echelle_de_somnolence_depsworth_my_et_pro_ok: Questionnaire;

declare const echelle_multidimensionnelle_de_fatigue_pro_def: Questionnaire;

declare const echelle_syndrome_des_jambes_sans_repos_irls_def_pro: Questionnaire;

declare const questionnaire_agenda_du_sommeil_def: Questionnaire;

declare const questionnaire_chronotype_de_horn_def_my_et_pro: Questionnaire;

declare const questionnaire_de_berlin_apnee_du_sommeil_def_pro: Questionnaire;

declare const questionnaire_de_fatigue_de_pichot_pro_def: Questionnaire;

declare const questionnaire_du_sommeil_psqi_def_my_et_pro: Questionnaire;

declare const questionnaire_de_karasek_def_pro: Questionnaire;

declare const questionnaire_de_stress_de_cungi_def_pro: Questionnaire;

declare const questionnaire_de_stress_siin_def_pro: Questionnaire;

declare const questionnaire_echelle_de_stress_de_cohen_pss_pro: Questionnaire;

declare const questionnaire_echelle_devaluation_bms_burn_out_def_pro: Questionnaire;

declare const questionnaire_echelle_devaluation_dass_21_pp_pro: Questionnaire;

declare const questionnaire_dependance_au_cannabis_def_pro: Questionnaire;

declare const questionnaire_di_franza_nicotine_def_pro: Questionnaire;

declare const questionnaire_test_dependance_a_la_nicotine_fagerstrom_pro: Questionnaire;

declare const test_motivation_a_larret_du_tabac_lagrue_et_legeron_def_pro: Questionnaire;

declare const test_qct2_de_gilliard_questionnaire_de_comportement_tabagique_def_pro: Questionnaire;

declare const catalogue_mictionnel: Questionnaire;

declare const ipss_international_prostate_score_symptom_pro: Questionnaire;

declare function getAllQuestionnaires(): Questionnaire[];
declare function getQuestionnaireById(id: string): Questionnaire | undefined;
declare function getQuestionnairesByCategory(category: string): Questionnaire[];

export { type ColorScheme, type MedicalCategory, NEUROTRANSMITTER_THEMES, type NeurotransmitterTheme, type PractitionerInboxItem, type Question, type QuestionOption, type QuestionResponse, type QuestionType, type Questionnaire, type QuestionnaireDoc, type QuestionnaireMetadata, type QuestionnaireResponse, type QuestionnaireResult, type QuestionnaireSection, type QuestionnaireStatus, type ScaleType, auto_anxiete_def_pro, bdi_echelle_de_depression_de_beck_def_pro, catalogue_mictionnel, conners_enseignant_version2_courte, dependance_a_internet_def_pro, echelle_de_conners_tdah_interpretation, echelle_de_matinalite_vesperalite_pour_l_enfant_def_pro, echelle_de_somnolence_depsworth_my_et_pro_ok, echelle_ecab_def_pro, echelle_multidimensionnelle_de_fatigue_pro_def, echelle_syndrome_des_jambes_sans_repos_irls_def_pro, evaluation_des_apports_caloriques_et_proteiques_alimentaires_selon_le_pr_l_monnier_def_patient, first_def_pro, getAllQuestionnaires, getQuestionnaireById, getQuestionnairesByCategory, grille_de_zarit_mesure_de_la_charge_des_proches_aidants_def_pro, hamilton_def_pro, hit_de_patients_migraineux_def_pro, hypersensibilite_au_deficit_en_magnesium_def_pro, idtas_ae_auto_eval_depression_trouble_affectif_saisonnier_def_pro, ipss_international_prostate_score_symptom_pro, madrs_echelle_de_depression_def_pro, maladie_dalzheimer_def_pro, mes_plaintes_actuelles_et_troubles_ressentis, mesure_de_limpact_de_la_fibromyalgie_def_pro, mini_mental_state_examination_mmse_def_pro, monnier_def_pro, questionnaire_agenda_du_sommeil_def, questionnaire_alimentaire_de_diete_mediterraneenne_def, questionnaire_alimentaire_siin_def_pro, questionnaire_audit_alcool_def_pro, questionnaire_bpco_def_pro, questionnaire_cancero_qlq_br23_def_pro, questionnaire_cancero_qlq_c30_def_pro, questionnaire_chronotype_de_horn_def_my_et_pro, questionnaire_contextuel_mode_de_vie_pro_def, questionnaire_dactivite_et_de_depense_energetique_globale_siin_def_pro, questionnaire_de_berlin_apnee_du_sommeil_def_pro, questionnaire_de_bristol_pro_def, questionnaire_de_dependance_a_un_medicament_def_pro, questionnaire_de_fatigue_de_pichot_pro_def, questionnaire_de_karasek_def_pro, questionnaire_de_scoff_def_pro, questionnaire_de_stress_de_cungi_def_pro, questionnaire_de_stress_siin_def_pro, questionnaire_dependance_au_cannabis_def_pro, questionnaire_di_franza_nicotine_def_pro, questionnaire_dopamine_noradrenaline_serotonine_melatonine_def_my_et_pro, questionnaire_du_sommeil_psqi_def_my_et_pro, questionnaire_echelle_de_stress_de_cohen_pss_pro, questionnaire_echelle_devaluation_bms_burn_out_def_pro, questionnaire_echelle_devaluation_dass_21_pp_pro, questionnaire_fonctionnel_dhyperexcitabilite_def_pro, questionnaire_reperage_des_troubles_dementiels_def_pro, questionnaire_sarcopenie_pro, questionnaire_test_dependance_a_la_nicotine_fagerstrom_pro, questionnaire_test_des_5_mots_def_pro, questionnaire_the_work_addiction_risk_test_wart_def_pro, questionnaire_troubles_fonctionnels_cardio_metabolique_def_pro, questionnaire_troubles_fonctionnels_digestifs_et_intestinaux_def_my_et_pro, score_de_francis_des_troubles_fonctionnels_intestinaux_def_pro, test_echelle_had_def_my_et_pro, test_motivation_a_larret_du_tabac_lagrue_et_legeron_def_pro, test_qct2_de_gilliard_questionnaire_de_comportement_tabagique_def_pro, tinetti, upps_impulsivite_def_pro };
