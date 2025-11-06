import { DashboardShell } from '@/components/layout/DashboardShell';
import { auth, firestore } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AlertCircle, ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AnamnesePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    poids: '',
    taille: '',
    imc: '',
    tourTaille: '',
    antecedentsMedicaux: [] as string[],
    autresAntecedents: '',
    antecedentsChirurgicaux: [] as string[],
    autresChirurgie: '',
    antecedentsFamiliaux: [] as string[],
    autresAntecedentsFamiliaux: '',
    medicamentsEnCours: '',
    complementsAlimentaires: '',
    activitePhysique: '',
    tabac: '',
    tabacQuantite: '',
    alcool: '',
    alcoolQuantite: '',
    sommeil: '',
    stress: '',
    regimeAlimentaire: '',
    allergiesAlimentaires: '',
    intolerance: '',
    exclusionsAlimentaires: '',
    habitudesAlimentaires: '',
    apportsLiquides: '',
    objectifsConsultation: '',
    autresInformations: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        navigate('/', { replace: true });
      } else {
        setUser(currentUser);
        await loadExistingData(currentUser.uid);
      }
      setLoading(false);
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadExistingData = async (uid: string) => {
    try {
      const anamneseDoc = await getDoc(doc(firestore, 'patients', uid, 'consultation', 'anamnese'));
      if (anamneseDoc.exists()) {
        setFormData((prev) => ({ ...prev, ...(anamneseDoc.data() as any) }));
      }
    } catch (error) {
      console.error('Error loading anamnese data:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated: any = { ...prev, [name]: value };
      if (name === 'poids' || name === 'taille') {
        const poids = parseFloat(name === 'poids' ? value : prev.poids);
        const taille = parseFloat(name === 'taille' ? value : prev.taille) / 100;
        if (poids && taille) {
          updated.imc = (poids / (taille * taille)).toFixed(1);
        }
      }
      return updated;
    });
  };

  const handleCheckboxChange = (field: string, value: string) => {
    setFormData((prev: any) => {
      const arr: string[] = prev[field] || [];
      const exists = arr.includes(value);
      const next = exists ? arr.filter((v) => v !== value) : [...arr, value];
      return { ...prev, [field]: next };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      await setDoc(
        doc(firestore, 'patients', user.uid, 'consultation', 'anamnese'),
        { ...formData, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      setMessage("✅ Fiche d'anamnèse enregistrée avec succès !");
      setTimeout(() => navigate('/dashboard/consultation', { replace: true }), 2000);
    } catch (error: any) {
      console.error('Error saving anamnese:', error);
      setMessage("❌ Erreur lors de l'enregistrement : " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

  const antecedentsMedicauxOptions = [
    'Diabète',
    'Hypertension artérielle',
    'Hypercholestérolémie',
    'Maladies cardiovasculaires',
    'Maladies respiratoires',
    'Maladies digestives',
    'Allergies',
    'Maladies auto-immunes',
  ];

  const antecedentsChirurgicauxOptions = [
    'Chirurgie digestive',
    'Chirurgie cardiaque',
    'Chirurgie orthopédique',
    'Chirurgie ORL',
    'Autre chirurgie',
  ];

  const antecedentsFamiliauxOptions = [
    'Diabète',
    'Hypertension',
    'Obésité',
    'Maladies cardiovasculaires',
    'Cancer',
    'Maladies neurologiques',
    'Autres',
  ];

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => navigate('/dashboard/consultation')}
            className="mb-3 flex items-center gap-2 text-sm text-nn-primary-400 transition hover:text-nn-primary-300"
            aria-label="Retour à l'espace consultation"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Retour à l'espace consultation
          </button>
          <h1 className="text-3xl font-bold text-white" id="anamnese-title">
            Fiche d'Anamnèse
          </h1>
          <p className="mt-2 text-white/70">Vos antécédents médicaux et habitudes de vie</p>
        </div>

        {message && (
          <div
            className={`flex items-center gap-3 rounded-xl p-4 ${
              message.includes('✅')
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border border-red-500/30 bg-red-500/10 text-red-400'
            }`}
            role={message.includes('✅') ? 'status' : 'alert'}
            aria-live={message.includes('✅') ? 'polite' : 'assertive'}
          >
            {message.includes('✅') ? (
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            ) : (
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
            )}
            <span>{message}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          aria-labelledby="anamnese-title"
          autoComplete="on"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">📏</span> Mesures Anthropométriques
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Poids (kg) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="poids"
                  name="poids"
                  value={formData.poids}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-label="Poids (kg)"
                  step="0.1"
                  placeholder="70.5"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Taille (cm) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  id="taille"
                  name="taille"
                  value={formData.taille}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-label="Taille (cm)"
                  step="0.1"
                  placeholder="175"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  IMC (calculé)
                </label>
                <input
                  type="text"
                  id="imc"
                  name="imc"
                  value={formData.imc}
                  disabled
                  aria-label="IMC (calculé)"
                  className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/50 transition"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Tour de taille (cm)
                </label>
                <input
                  type="number"
                  id="tourTaille"
                  name="tourTaille"
                  value={formData.tourTaille}
                  onChange={handleChange}
                  aria-label="Tour de taille (cm)"
                  step="0.1"
                  placeholder="85"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">🏥</span> Antécédents Médicaux
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {antecedentsMedicauxOptions.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={formData.antecedentsMedicaux.includes(option)}
                      onChange={() => handleCheckboxChange('antecedentsMedicaux', option)}
                      className="h-5 w-5 rounded border-white/20 bg-white/5 text-nn-primary-600 focus:ring-2 focus:ring-nn-primary-500"
                    />
                    <span className="text-white/90">{option}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Autres antécédents médicaux / Précisions
                </label>
                <textarea
                  name="autresAntecedents"
                  value={formData.autresAntecedents}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Détaillez ici vos autres antécédents médicaux..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">🔬</span> Antécédents Chirurgicaux
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {antecedentsChirurgicauxOptions.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={formData.antecedentsChirurgicaux.includes(option)}
                      onChange={() => handleCheckboxChange('antecedentsChirurgicaux', option)}
                      className="h-5 w-5 rounded border-white/20 bg-white/5 text-nn-primary-600 focus:ring-2 focus:ring-nn-primary-500"
                    />
                    <span className="text-white/90">{option}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Détails des interventions chirurgicales
                </label>
                <textarea
                  name="autresChirurgie"
                  value={formData.autresChirurgie}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Décrivez vos interventions chirurgicales (type, date, complications éventuelles)..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">👪</span> Antécédents Familiaux
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {antecedentsFamiliauxOptions.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                  >
                    <input
                      type="checkbox"
                      checked={formData.antecedentsFamiliaux.includes(option)}
                      onChange={() => handleCheckboxChange('antecedentsFamiliaux', option)}
                      className="h-5 w-5 rounded border-white/20 bg-white/5 text-nn-primary-600 focus:ring-2 focus:ring-nn-primary-500"
                    />
                    <span className="text-white/90">{option}</span>
                  </label>
                ))}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Précisions sur les antécédents familiaux
                </label>
                <textarea
                  name="autresAntecedentsFamiliaux"
                  value={formData.autresAntecedentsFamiliaux}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Précisez les antécédents familiaux..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">💊</span> Traitements en Cours
            </h2>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Médicaments actuels
                </label>
                <textarea
                  name="medicamentsEnCours"
                  value={formData.medicamentsEnCours}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Listez vos médicaments..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Compléments alimentaires et vitamines
                </label>
                <textarea
                  name="complementsAlimentaires"
                  value={formData.complementsAlimentaires}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Listez vos compléments..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">🏃</span> Habitudes de Vie
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Activité physique
                </label>
                <select
                  id="activitePhysique"
                  name="activitePhysique"
                  value={formData.activitePhysique}
                  onChange={handleChange}
                  aria-label="Activité physique"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500 [color-scheme:dark]"
                >
                  <option value="">Sélectionner</option>
                  <option value="Sédentaire">Sédentaire</option>
                  <option value="Légère (1-2x/semaine)">Légère (1-2x/semaine)</option>
                  <option value="Modérée (3-4x/semaine)">Modérée (3-4x/semaine)</option>
                  <option value="Intense (5-7x/semaine)">Intense (5-7x/semaine)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">Tabac</label>
                <select
                  id="tabac"
                  name="tabac"
                  value={formData.tabac}
                  onChange={handleChange}
                  aria-label="Tabac"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500 [color-scheme:dark]"
                >
                  <option value="">Sélectionner</option>
                  <option value="Non-fumeur">Non-fumeur</option>
                  <option value="Ex-fumeur">Ex-fumeur</option>
                  <option value="Fumeur occasionnel">Fumeur occasionnel</option>
                  <option value="Fumeur régulier">Fumeur régulier</option>
                </select>
              </div>
              {formData.tabac && formData.tabac !== 'Non-fumeur' && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/90">
                    Quantité (cigarettes/jour ou années)
                  </label>
                  <input
                    type="text"
                    id="tabacQuantite"
                    name="tabacQuantite"
                    value={formData.tabacQuantite}
                    onChange={handleChange}
                    aria-label="Quantité de tabac"
                    placeholder="ex: 10 cigarettes/jour depuis 5 ans"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                  />
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Consommation d'alcool
                </label>
                <select
                  id="alcool"
                  name="alcool"
                  value={formData.alcool}
                  onChange={handleChange}
                  aria-label="Consommation d'alcool"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500 [color-scheme:dark]"
                >
                  <option value="">Sélectionner</option>
                  <option value="Jamais">Jamais</option>
                  <option value="Occasionnelle">Occasionnelle</option>
                  <option value="Régulière modérée">Régulière modérée</option>
                  <option value="Régulière importante">Régulière importante</option>
                </select>
              </div>
              {formData.alcool && formData.alcool !== 'Jamais' && (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/90">
                    Quantité / Fréquence
                  </label>
                  <input
                    type="text"
                    id="alcoolQuantite"
                    name="alcoolQuantite"
                    value={formData.alcoolQuantite}
                    onChange={handleChange}
                    aria-label="Quantité d'alcool"
                    placeholder="ex: 2 verres de vin le week-end"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                  />
                </div>
              )}
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Qualité du sommeil
                </label>
                <select
                  id="sommeil"
                  name="sommeil"
                  value={formData.sommeil}
                  onChange={handleChange}
                  aria-label="Qualité du sommeil"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500 [color-scheme:dark]"
                >
                  <option value="">Sélectionner</option>
                  <option value="Très bon">Très bon</option>
                  <option value="Bon">Bon</option>
                  <option value="Moyen">Moyen</option>
                  <option value="Mauvais">Mauvais</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Niveau de stress
                </label>
                <select
                  id="stress"
                  name="stress"
                  value={formData.stress}
                  onChange={handleChange}
                  aria-label="Niveau de stress"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500 [color-scheme:dark]"
                >
                  <option value="">Sélectionner</option>
                  <option value="Faible">Faible</option>
                  <option value="Modéré">Modéré</option>
                  <option value="Élevé">Élevé</option>
                  <option value="Très élevé">Très élevé</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">🍽️</span> Habitudes Alimentaires
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/90">
                    Régime alimentaire
                  </label>
                  <select
                    id="regimeAlimentaire"
                    name="regimeAlimentaire"
                    value={formData.regimeAlimentaire}
                    onChange={handleChange}
                    aria-label="Régime alimentaire"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500 [color-scheme:dark]"
                  >
                    <option value="">Sélectionner</option>
                    <option value="Omnivore">Omnivore</option>
                    <option value="Végétarien">Végétarien</option>
                    <option value="Végétalien">Végétalien</option>
                    <option value="Pescétarien">Pescétarien</option>
                    <option value="Sans gluten">Sans gluten</option>
                    <option value="Sans lactose">Sans lactose</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white/90">
                    Apports liquides (L/jour)
                  </label>
                  <input
                    type="text"
                    id="apportsLiquides"
                    name="apportsLiquides"
                    value={formData.apportsLiquides}
                    onChange={handleChange}
                    aria-label="Apports liquides (L/jour)"
                    placeholder="ex: 1.5 litre"
                    className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Allergies alimentaires
                </label>
                <input
                  type="text"
                  name="allergiesAlimentaires"
                  value={formData.allergiesAlimentaires}
                  onChange={handleChange}
                  placeholder="ex: Arachides, Crustacés, Lactose..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Intolérances alimentaires
                </label>
                <input
                  type="text"
                  name="intolerance"
                  value={formData.intolerance}
                  onChange={handleChange}
                  placeholder="ex: Gluten, Lactose, FODMAP..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Exclusions alimentaires (par choix)
                </label>
                <input
                  type="text"
                  name="exclusionsAlimentaires"
                  value={formData.exclusionsAlimentaires}
                  onChange={handleChange}
                  placeholder="ex: Viande rouge, Produits laitiers..."
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Décrivez vos habitudes alimentaires
                </label>
                <textarea
                  name="habitudesAlimentaires"
                  value={formData.habitudesAlimentaires}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Décrivez une journée type : petit-déjeuner, déjeuner, dîner, collations..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">🎯</span> Objectifs et Informations Complémentaires
            </h2>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Objectifs de la consultation <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="objectifsConsultation"
                  value={formData.objectifsConsultation}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Quels sont vos objectifs ? ..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Autres informations importantes
                </label>
                <textarea
                  name="autresInformations"
                  value={formData.autresInformations}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Toute autre information utile..."
                  className="w-full resize-none rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/dashboard/consultation')}
              className="flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white transition-all hover:bg-white/20"
            >
              <span className="inline-flex items-center gap-2">
                <ArrowLeft className="h-5 w-5" />
                Annuler
              </span>
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-nn-primary-600 to-nn-accent-600 px-6 py-3 font-semibold text-white transition-all hover:shadow-lg hover:shadow-nn-primary-500/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                  Enregistrement...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Enregistrer
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
