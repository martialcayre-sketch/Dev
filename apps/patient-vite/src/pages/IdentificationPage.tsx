import { DashboardShell } from '@/components/layout/DashboardShell';
import { auth, firestore } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AlertCircle, ArrowLeft, CheckCircle2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AddressSuggestion {
  properties: {
    label: string;
    postcode: string;
    city: string;
    street?: string;
  };
}

export default function IdentificationPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    nomNaissance: '',
    dateNaissance: '',
    lieuNaissance: '',
    sexe: '',

    adresse: '',
    codePostal: '',
    ville: '',
    pays: 'France',
    telephone: '',
    telephoneMobile: '',
    email: '',

    numeroSecuriteSociale: '',
    regimeSecuriteSociale: '',
    mutuelleName: '',
    mutuelleNumero: '',

    situationMatrimoniale: '',
    nombreEnfants: '',
    personneAContacter: '',
    telephoneUrgence: '',
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
      const identificationDoc = await getDoc(
        doc(firestore, 'patients', uid, 'consultation', 'identification')
      );
      if (identificationDoc.exists()) {
        setFormData((prev) => ({ ...prev, ...(identificationDoc.data() as any) }));
      } else {
        // Auto-remplissage depuis le compte Google/social
        const currentUser = auth.currentUser;
        if (currentUser) {
          const updates: any = {};

          // Email
          if (currentUser.email) {
            updates.email = currentUser.email;
          }

          // Nom et prénom depuis displayName
          if (currentUser.displayName) {
            const nameParts = currentUser.displayName.split(' ');
            if (nameParts.length >= 2) {
              updates.prenom = nameParts[0];
              updates.nom = nameParts.slice(1).join(' ');
            } else if (nameParts.length === 1) {
              updates.prenom = nameParts[0];
            }
          }

          // Téléphone depuis phoneNumber
          if (currentUser.phoneNumber) {
            updates.telephoneMobile = currentUser.phoneNumber;
          }

          setFormData((prev) => ({ ...prev, ...updates }));
        }
      }

      // Toujours mettre à jour l'email avec l'email actuel
      if (auth.currentUser?.email) {
        setFormData((prev) => ({ ...prev, email: auth.currentUser!.email! }));
      }
    } catch (error) {
      console.error('Error loading identification data:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Recherche d'adresses via l'API gouvernementale française
  const searchAddress = async (query: string) => {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`
      );
      const data = await response.json();
      setAddressSuggestions(data.features || []);
      setShowAddressSuggestions(true);
    } catch (error) {
      console.error('Error searching address:', error);
    }
  };

  // Gestion du changement d'adresse avec debounce
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, adresse: value }));
    searchAddress(value);
  };

  // Sélection d'une suggestion d'adresse
  const selectAddress = (suggestion: AddressSuggestion) => {
    const { properties } = suggestion;
    setFormData((prev) => ({
      ...prev,
      adresse: properties.street || properties.label.split(',')[0],
      codePostal: properties.postcode,
      ville: properties.city,
    }));
    setShowAddressSuggestions(false);
    setAddressSuggestions([]);
  };

  // Recherche de ville par code postal
  const searchCityByPostcode = async (postcode: string) => {
    if (postcode.length !== 5) return;

    try {
      const response = await fetch(
        `https://api-adresse.data.gouv.fr/search/?q=${postcode}&type=municipality&limit=5`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const city = data.features[0].properties.city;
        setFormData((prev) => ({ ...prev, ville: city }));
      }
    } catch (error) {
      console.error('Error searching city:', error);
    }
  };

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, codePostal: value }));
    if (value.length === 5) {
      searchCityByPostcode(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      await setDoc(
        doc(firestore, 'patients', user.uid, 'consultation', 'identification'),
        { ...formData, updatedAt: new Date().toISOString() },
        { merge: true }
      );
      setMessage("✅ Fiche d'identification enregistrée avec succès !");
      setTimeout(() => navigate('/dashboard/consultation', { replace: true }), 2000);
    } catch (error: any) {
      console.error('Error saving identification:', error);
      setMessage("❌ Erreur lors de l'enregistrement : " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return null;

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
          <h1 className="text-3xl font-bold text-white" id="identification-title">
            Fiche d'Identification
          </h1>
          <p className="mt-2 text-white/70">Vos informations personnelles et administratives</p>
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

        {/* Info : données pré-remplies */}
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/30 bg-blue-500/10 p-4 text-blue-300">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold">Informations pré-remplies</p>
            <p className="mt-1 text-blue-200/80">
              Certains champs sont automatiquement remplis depuis votre compte de connexion.
              Vérifiez et complétez les informations manquantes.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          aria-labelledby="identification-title"
          autoComplete="on"
        >
          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">👤</span> Identité
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Nom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-label="Nom"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Prénom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-label="Prénom"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Nom de naissance (si différent)
                </label>
                <input
                  type="text"
                  id="nomNaissance"
                  name="nomNaissance"
                  value={formData.nomNaissance}
                  onChange={handleChange}
                  aria-label="Nom de naissance"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Date de naissance <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  id="dateNaissance"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-label="Date de naissance"
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500 [color-scheme:dark]"
                />
                <p className="mt-1 text-xs text-white/50">
                  Le calendrier natif de votre navigateur s'ouvrira
                </p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Lieu de naissance
                </label>
                <input
                  type="text"
                  id="lieuNaissance"
                  name="lieuNaissance"
                  value={formData.lieuNaissance}
                  onChange={handleChange}
                  aria-label="Lieu de naissance"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Sexe <span className="text-red-400">*</span>
                </label>
                <select
                  id="sexe"
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                  required
                  aria-required="true"
                  aria-label="Sexe"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500 [color-scheme:dark]"
                >
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">📞</span> Coordonnées
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="relative md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Adresse <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleAddressChange}
                  onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 200)}
                  onFocus={() => formData.adresse.length >= 3 && setShowAddressSuggestions(true)}
                  required
                  aria-required="true"
                  aria-label="Adresse"
                  placeholder="Commencez à taper votre adresse..."
                  autoComplete="off"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
                {showAddressSuggestions && addressSuggestions.length > 0 && (
                  <div className="absolute z-50 mt-1 w-full rounded-xl border border-white/10 bg-slate-900 shadow-xl">
                    {addressSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectAddress(suggestion)}
                        className="w-full px-4 py-3 text-left text-sm text-white/90 transition hover:bg-white/5 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="font-medium">{suggestion.properties.label}</div>
                        <div className="text-xs text-white/60">
                          {suggestion.properties.postcode} {suggestion.properties.city}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Code postal <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="codePostal"
                  value={formData.codePostal}
                  onChange={handlePostcodeChange}
                  required
                  maxLength={5}
                  placeholder="Ex: 75001"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Ville <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="ville"
                  value={formData.ville}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Pays <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="pays"
                  value={formData.pays}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Téléphone mobile <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  name="telephoneMobile"
                  value={formData.telephoneMobile}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                  className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/50 placeholder-white/40 outline-none transition"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">🏥</span> Sécurité Sociale
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Numéro de sécurité sociale <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="numeroSecuriteSociale"
                  value={formData.numeroSecuriteSociale}
                  onChange={handleChange}
                  required
                  maxLength={15}
                  placeholder="1 23 45 67 890 123 45"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Régime de sécurité sociale
                </label>
                <input
                  type="text"
                  name="regimeSecuriteSociale"
                  value={formData.regimeSecuriteSociale}
                  onChange={handleChange}
                  placeholder="ex: Régime général"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">Mutuelle</label>
                <input
                  type="text"
                  name="mutuelleName"
                  value={formData.mutuelleName}
                  onChange={handleChange}
                  placeholder="Nom de la mutuelle"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Numéro de mutuelle
                </label>
                <input
                  type="text"
                  name="mutuelleNumero"
                  value={formData.mutuelleNumero}
                  onChange={handleChange}
                  placeholder="Numéro d'adhérent"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
            <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-white">
              <span className="text-3xl">👨‍👩‍👧‍👦</span> Situation Familiale
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Situation matrimoniale
                </label>
                <select
                  name="situationMatrimoniale"
                  value={formData.situationMatrimoniale}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500 [color-scheme:dark]"
                >
                  <option value="">Sélectionner</option>
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Pacsé(e)">Pacsé(e)</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf(ve)">Veuf(ve)</option>
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Nombre d'enfants
                </label>
                <input
                  type="number"
                  name="nombreEnfants"
                  value={formData.nombreEnfants}
                  onChange={handleChange}
                  min="0"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Personne à contacter en cas d'urgence
                </label>
                <input
                  type="text"
                  name="personneAContacter"
                  value={formData.personneAContacter}
                  onChange={handleChange}
                  placeholder="Nom et prénom"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Téléphone d'urgence
                </label>
                <input
                  type="tel"
                  name="telephoneUrgence"
                  value={formData.telephoneUrgence}
                  onChange={handleChange}
                  placeholder="Numéro de téléphone"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 outline-none transition focus:border-transparent focus:ring-2 focus:ring-nn-primary-500"
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
