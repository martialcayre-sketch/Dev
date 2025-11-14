/**
 * Page d'identification V3.1 - Version simplifiée pour assignation de questionnaires par âge
 * Remplace l'ancienne page d'identification complexe par un formulaire simple
 * axé sur l'âge et les informations essentielles
 */

import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { ArrowLeft, CheckCircle2, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface IdentificationData {
  firstname: string;
  lastname: string;
  sexe: 'M' | 'F' | 'Autre' | '';
  dateNaissance: string;
  taille?: number;
  poids?: number;
  telephone?: string;
  profession?: string;
  personneUrgence?: string;
  telephoneUrgence?: string;
}

export default function IdentificationSimplePage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useFirebaseUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  const [formData, setFormData] = useState<IdentificationData>({
    firstname: '',
    lastname: '',
    sexe: '',
    dateNaissance: '',
    taille: undefined,
    poids: undefined,
    telephone: '',
    profession: '',
    personneUrgence: '',
    telephoneUrgence: '',
  });

  useEffect(() => {
    if (!user || authLoading) return;

    const checkIdentificationStatus = async () => {
      try {
        const response = await fetch('/api/patients/identification/status', {
          headers: {
            Authorization: `Bearer ${await user.getIdToken()}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.identificationCompleted) {
            setAlreadyCompleted(true);
          }
        }

        // Auto-remplir depuis le profil utilisateur
        if (user.displayName) {
          const nameParts = user.displayName.split(' ');
          setFormData((prev) => ({
            ...prev,
            firstname: nameParts[0] || '',
            lastname: nameParts.slice(1).join(' ') || '',
          }));
        }

        if (user.phoneNumber) {
          setFormData((prev) => ({
            ...prev,
            telephone: user.phoneNumber || '',
          }));
        }
      } catch (error) {
        console.error('Error checking identification status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkIdentificationStatus();

    checkIdentificationStatus();
  }, [user, authLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'taille' || name === 'poids'
          ? value === ''
            ? undefined
            : parseFloat(value)
          : value,
    }));
  };

  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const monthDiff = now.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const getAgeGroup = (age: number): string => {
    if (age <= 12) return 'enfant';
    if (age <= 18) return 'adolescent';
    return 'adulte';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/patients/identification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la sauvegarde');
      }

      if (data.success) {
        const age = calculateAge(formData.dateNaissance);
        const ageGroup = getAgeGroup(age);

        setSuccess(true);
        setMessage(
          `✅ Identification complétée ! Vous avez ${age} ans (groupe ${ageGroup}). ` +
            `${data.questionnaires?.count || 0} questionnaires ont été assignés.`
        );

        // Rediriger vers les questionnaires après 3 secondes
        setTimeout(() => {
          navigate('/dashboard/questionnaires');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error saving identification:', error);
      setMessage(`❌ Erreur: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardShell>
        <div className="flex h-96 items-center justify-center">
          <div className="text-white/60">Chargement...</div>
        </div>
      </DashboardShell>
    );
  }

  if (alreadyCompleted) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
            <h1 className="mt-4 text-2xl font-bold text-emerald-100">
              Identification déjà complétée
            </h1>
            <p className="mt-2 text-emerald-200/80">
              Votre identification a déjà été effectuée. Vos questionnaires sont disponibles.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white hover:bg-white/10"
              >
                Retour au dashboard
              </button>
              <button
                onClick={() => navigate('/dashboard/questionnaires')}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700"
              >
                Voir mes questionnaires
              </button>
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div>
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-3 flex items-center gap-2 text-sm text-nn-primary-400 transition hover:text-nn-primary-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">🎯 Compléter mon identification</h1>
          <p className="mt-2 text-white/70">
            Pour vous proposer des questionnaires adaptés, nous avons besoin de quelques
            informations.
          </p>
        </div>

        {message && (
          <div
            className={`flex items-center gap-3 rounded-xl p-4 ${
              success
                ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border border-red-500/30 bg-red-500/10 text-red-400'
            }`}
          >
            {success ? <CheckCircle2 className="h-5 w-5" /> : <User className="h-5 w-5" />}
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations essentielles */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">👤 Informations personnelles</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Prénom <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 focus:border-nn-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Nom de famille <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 focus:border-nn-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Date de naissance <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  name="dateNaissance"
                  value={formData.dateNaissance}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 focus:border-nn-primary-500 focus:outline-none [color-scheme:dark]"
                />
                {formData.dateNaissance && (
                  <p className="mt-1 text-xs text-nn-accent-300">
                    🎂 Âge: {calculateAge(formData.dateNaissance)} ans (
                    {getAgeGroup(calculateAge(formData.dateNaissance))})
                  </p>
                )}
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Sexe <span className="text-red-400">*</span>
                </label>
                <select
                  name="sexe"
                  value={formData.sexe}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 focus:border-nn-primary-500 focus:outline-none [color-scheme:dark]"
                >
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>
          </div>

          {/* Informations complémentaires */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">
              📏 Informations complémentaires (optionnel)
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Taille (cm)
                </label>
                <input
                  type="number"
                  name="taille"
                  value={formData.taille || ''}
                  onChange={handleChange}
                  min="50"
                  max="250"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 focus:border-nn-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">Poids (kg)</label>
                <input
                  type="number"
                  name="poids"
                  value={formData.poids || ''}
                  onChange={handleChange}
                  min="10"
                  max="500"
                  step="0.1"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 focus:border-nn-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 focus:border-nn-primary-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">Profession</label>
                <input
                  type="text"
                  name="profession"
                  value={formData.profession}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 focus:border-nn-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Contact d'urgence */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="mb-4 text-xl font-bold text-white">🚨 Contact d'urgence (optionnel)</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white/90">
                  Personne à contacter
                </label>
                <input
                  type="text"
                  name="personneUrgence"
                  value={formData.personneUrgence}
                  onChange={handleChange}
                  placeholder="Nom et prénom"
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 focus:border-nn-primary-500 focus:outline-none"
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
                  className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white/90 placeholder-white/40 focus:border-nn-primary-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-white hover:bg-white/20"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-gradient-to-r from-nn-primary-600 to-nn-accent-600 px-6 py-3 font-semibold text-white hover:shadow-lg hover:shadow-nn-primary-500/30 disabled:opacity-50"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white" />
                  Sauvegarde...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Save className="h-5 w-5" />
                  Compléter mon identification
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
