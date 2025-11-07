import { DashboardShell } from '@/components/layout/DashboardShell';
import { useFirebaseUser } from '@/hooks/useFirebaseUser';
import { functions } from '@/lib/firebase';
import { httpsCallable } from 'firebase/functions';
import {
  AlertCircle,
  Check,
  ChevronLeft,
  Copy,
  Loader2,
  Mail,
  Send,
  UsersRound,
} from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';

interface CreatePatientInvitationResponse {
  success: boolean;
  message: string;
  invitationLink?: string;
  error?: string;
}

export default function PatientCreatePage() {
  const { user } = useFirebaseUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitationLink, setInvitationLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    firstname: '',
    lastname: '',
    phone: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    setInvitationLink(null);

    try {
      if (!user) {
        throw new Error('Vous devez être connecté pour créer une invitation');
      }

      // Validation
      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('Email invalide');
      }

      const createPatientInvitation = httpsCallable<any, CreatePatientInvitationResponse>(
        functions,
        'createPatientInvitation'
      );

      const result = await createPatientInvitation({
        email: formData.email.trim(),
        firstname: formData.firstname.trim() || null,
        lastname: formData.lastname.trim() || null,
        phone: formData.phone.trim() || null,
      });

      if (result.data.success && result.data.invitationLink) {
        setSuccess(true);
        setInvitationLink(result.data.invitationLink);
        // Reset form
        setFormData({
          email: '',
          firstname: '',
          lastname: '',
          phone: '',
        });
      } else {
        throw new Error(result.data.error || "Erreur lors de la création de l'invitation");
      }
    } catch (err: any) {
      console.error('Error creating invitation:', err);
      setError(err.message || "Erreur lors de la création de l'invitation");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (invitationLink) {
      await navigator.clipboard.writeText(invitationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/patients"
            className="rounded-xl bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-nn-primary-500/20 p-2 text-nn-primary-200">
              <UsersRound className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/60">Patients</p>
              <h1 className="text-2xl font-semibold text-white">Inviter un nouveau patient</h1>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && invitationLink && (
          <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-lg bg-green-500/20 p-2">
                <Check className="h-5 w-5 text-green-400" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-semibold text-green-200">Invitation créée avec succès !</h3>
                  <p className="mt-1 text-sm text-green-300/80">
                    Un email d'invitation a été envoyé au patient. Vous pouvez également partager le
                    lien ci-dessous.
                  </p>
                </div>

                {/* Invitation Link */}
                <div className="space-y-2">
                  <label className="text-xs font-medium uppercase tracking-wider text-green-300/70">
                    Lien d'invitation
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={invitationLink}
                      readOnly
                      className="flex-1 rounded-lg border border-green-500/30 bg-green-950/30 px-4 py-2 text-sm text-green-100"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/20 px-4 py-2 text-sm font-medium text-green-200 transition hover:bg-green-500/30"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4" />
                          Copié
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4" />
                          Copier
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-400" />
              <div>
                <h3 className="font-semibold text-red-200">Erreur</h3>
                <p className="mt-1 text-sm text-red-300/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Info Box */}
            <div className="rounded-xl border border-nn-primary-500/20 bg-nn-primary-500/10 p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 flex-shrink-0 text-nn-primary-300" />
                <div className="text-sm text-white/80">
                  <p className="font-medium text-white">
                    Le patient recevra un email avec un lien d'invitation
                  </p>
                  <p className="mt-1 text-white/60">
                    L'invitation est valable 24 heures. Le patient pourra créer son compte et
                    accéder à la plateforme.
                  </p>
                </div>
              </div>
            </div>

            {/* Email (required) */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@example.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-nn-primary-500/50 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/20"
                disabled={loading}
              />
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Prénom</label>
              <input
                type="text"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                placeholder="Jean"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-nn-primary-500/50 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/20"
                disabled={loading}
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Nom</label>
              <input
                type="text"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                placeholder="Dupont"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-nn-primary-500/50 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/20"
                disabled={loading}
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Téléphone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+33 6 12 34 56 78"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-nn-primary-500/50 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/20"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Link
                to="/patients"
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-center font-medium text-white transition hover:bg-white/10"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading || !formData.email}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-nn-primary-500 px-6 py-3 font-medium text-white transition hover:bg-nn-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Créer l'invitation
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/60">
          <p className="font-medium text-white/80">💡 Conseil :</p>
          <ul className="mt-2 space-y-1 pl-4">
            <li>• Vérifiez que l'adresse email du patient est correcte</li>
            <li>
              • Le patient peut créer son compte avec Google, Facebook, LinkedIn ou un mot de passe
            </li>
            <li>• L'invitation expire après 24 heures</li>
            <li>• Un email automatique sera envoyé au patient avec toutes les instructions</li>
          </ul>
        </div>
      </div>
    </DashboardShell>
  );
}
