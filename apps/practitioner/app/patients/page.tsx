"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import {
	AlertCircle,
	ArrowRight,
	CalendarClock,
	CheckCircle2,
	Hourglass,
	Loader2,
	Mail,
	Phone,
	Search,
	UserPlus,
	Users2,
} from "lucide-react";
import {
	Timestamp,
	collection,
	getDocs,
	limit,
	orderBy,
	query,
	where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { DashboardShell } from "@/components/layout/DashboardShell";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { firestore, functions } from "@/lib/firebase";

interface Patient {
	id: string;
	email: string;
	fullName?: string;
	phone?: string;
	status?: string;
	createdAt?: Date;
	upcomingConsultation?: Date | null;
}

export default function PatientsPage() {
	const { user } = useFirebaseUser();
	const [patients, setPatients] = useState<Patient[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(true);
	const [inviting, setInviting] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [invitePhone, setInvitePhone] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [inviteSuccess, setInviteSuccess] = useState(false);
    const [resendingId, setResendingId] = useState<string | null>(null);
    const [resendSuccessId, setResendSuccessId] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;

		async function loadPatients() {
			if (!user?.uid) return;
			setLoading(true);
			setError(null);
			setInviteSuccess(false);

			try {
				const patientsQuery = query(
					collection(firestore, "patients"),
					where("practitionerId", "==", user.uid),
					orderBy("createdAt", "desc"),
					limit(100)
				);
				const snapshot = await getDocs(patientsQuery);
				if (!isMounted) return;

				const docs = snapshot.docs.map((doc) => {
					const data = doc.data() as Record<string, unknown>;
					const createdAt = (data.createdAt as Timestamp | undefined)?.toDate?.();
					const upcoming =
						(data.nextConsultationAt as Timestamp | undefined)?.toDate?.() ?? null;
					const fullName =
						typeof data.fullName === "string"
							? data.fullName
							: `${(data.firstName as string | undefined) ?? ""} ${(data.lastName as string | undefined) ?? ""}`.trim();

					return {
						id: doc.id,
						email: (data.email as string) ?? "",
						fullName: fullName || undefined,
						phone: (data.phone as string | undefined) ?? undefined,
						status: (data.status as string | undefined) ?? "active",
						createdAt: createdAt ?? undefined,
						upcomingConsultation: upcoming,
					} satisfies Patient;
				});

				setPatients(docs);
			} catch (err) {
				console.error("Erreur Firestore patients", err);
				if (!isMounted) return;
				setError("Impossible de charger vos patients. Vérifiez votre configuration Firebase.");
				setPatients([]);
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		}

		loadPatients();

		return () => {
			isMounted = false;
		};
	}, [user?.uid]);

	async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (!inviteEmail || !user?.uid) return;

		setInviting(true);
		setError(null);
		setInviteSuccess(false);

		try {
			const callable = httpsCallable(functions, "invitePatient");
			await callable({
				email: inviteEmail,
				phone: invitePhone || undefined,
				practitionerId: user.uid,
			});
			setInviteEmail("");
			setInvitePhone("");
			setInviteSuccess(true);
			} catch (err: any) {
				console.error("Invitation patient", err);
				// Surface more context to help diagnose quickly
				const code = err?.code || err?.name || "unknown";
				const msg = err?.message || "Erreur inconnue";
				setError(`Erreur lors de l'envoi de l'invitation (${code}): ${msg}`);
		} finally {
			setInviting(false);
		}
	}

	async function handleResendInvitation(patient: Patient) {
		if (!user?.uid || !patient?.email) return;
		setError(null);
		setResendSuccessId(null);
		setResendingId(patient.id);

		try {
			const callable = httpsCallable(functions, "invitePatient");
			await callable({
				email: patient.email,
				phone: patient.phone || undefined,
				practitionerId: user.uid,
			});
			setResendSuccessId(patient.id);
		} catch (err) {
			console.error("Renvoyer invitation patient", err);
			setError("Impossible de renvoyer l'invitation pour ce patient.");
		} finally {
			setResendingId(null);
		}
	}

	const filteredPatients = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		if (!term) return patients;

		return patients.filter((patient) => {
			const normalizedPhone = (patient.phone ?? "").replace(/\s+/g, "");
			return (
				patient.email.toLowerCase().includes(term) ||
				(patient.fullName ?? "").toLowerCase().includes(term) ||
				normalizedPhone.includes(term)
			);
		});
	}, [patients, searchTerm]);

	return (
		<DashboardShell>
			<section className="space-y-8">
				<header className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white shadow-2xl shadow-nn-primary-500/5 backdrop-blur lg:flex-row lg:items-center lg:justify-between">
					<div className="flex items-start gap-4">
						<div className="rounded-2xl bg-nn-primary-500/20 p-3 text-nn-primary-200">
							<Users2 className="h-8 w-8" />
						</div>
						<div>
							<p className="text-xs uppercase tracking-[0.35em] text-white/60">
								Cohorte patient
							</p>
							<h1 className="mt-2 text-3xl font-semibold">Gestion des patients</h1>
							<p className="mt-2 max-w-xl text-sm text-white/65">
								Visualisez vos patients actifs, leurs consultations planifiées et invitez
								de nouveaux profils en un clic.
							</p>
						</div>
					</div>
					<form
						id="invite-form"
						onSubmit={handleInvite}
						className="flex w-full max-w-md flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/70 p-4"
					>
						<p className="text-xs font-semibold uppercase tracking-wider text-white/60">
							Inviter un patient
						</p>
						<input
							type="email"
							required
							value={inviteEmail}
							onChange={(event) => {
								setInviteEmail(event.target.value);
								setInviteSuccess(false);
							}}
							placeholder="Email du patient"
							className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
						/>
						<input
							type="tel"
							value={invitePhone}
							onChange={(event) => setInvitePhone(event.target.value)}
							placeholder="Téléphone (optionnel)"
							className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
						/>
						<button
							type="submit"
							disabled={inviting}
							className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-nn-primary-500 to-nn-accent-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-nn-primary-500/20 transition hover:from-nn-primary-400 hover:to-nn-accent-400 disabled:opacity-60"
						>
							<UserPlus className="h-4 w-4" />
							{inviting ? "Envoi en cours..." : "Envoyer l'invitation"}
						</button>
						{inviteSuccess ? (
							<p className="text-xs text-emerald-300">
								Invitation envoyée. Le patient recevra un email d'inscription.
							</p>
						) : null}
					</form>
				</header>

				<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
					<div className="relative w-full max-w-md">
						<Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
						<input
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder="Rechercher par nom, email, téléphone..."
							className="w-full rounded-xl border border-white/10 bg-white/5 pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-nn-primary-500/40 focus:outline-none focus:ring-2 focus:ring-nn-primary-500/40"
						/>
					</div>
					<p className="text-xs uppercase tracking-[0.35em] text-white/40">
						{filteredPatients.length} patient(s)
					</p>
				</div>

				{error ? (
					<div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
						<AlertCircle className="h-5 w-5" />
						{error}
					</div>
				) : null}

				{loading ? (
					<div className="flex justify-center rounded-3xl border border-white/10 bg-white/5 py-20 text-white/60">
						<div className="flex items-center gap-3">
							<Loader2 className="h-5 w-5 animate-spin" />
							Chargement des patients...
						</div>
					</div>
				) : filteredPatients.length === 0 ? (
					<div className="rounded-3xl border border-dashed border-white/15 bg-white/5 px-6 py-14 text-center text-white/60">
						<Users2 className="mx-auto h-10 w-10 text-white/30" />
						<p className="mt-4 text-sm">
							Aucun patient ne correspond à votre recherche. Invitez un nouveau patient pour
							démarrer un suivi.
						</p>
						<Link
							href="/patients/create"
							className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:border-white/30 hover:bg-white/10"
						>
							Lancer une invitation
							<ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				) : (
					<div className="grid gap-4">
						{filteredPatients.map((patient) => (
							<article
								key={patient.id}
								className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-white transition hover:border-nn-primary-500/30 hover:bg-nn-primary-500/10 md:flex-row md:items-center md:justify-between"
							>
								<div className="flex items-center gap-4">
									<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-nn-primary-500/15 text-lg font-semibold text-nn-primary-100">
										{(patient.fullName || patient.email)[0]?.toUpperCase()}
									</div>
									<div>
										<p className="text-base font-semibold text-white">
											{patient.fullName || patient.email}
										</p>
										<div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-white/50">
											<span className="inline-flex items-center gap-1">
												<Mail className="h-4 w-4" /> {patient.email}
											</span>
											{patient.phone ? (
												<span className="inline-flex items-center gap-1">
													<Phone className="h-4 w-4" /> {patient.phone}
												</span>
											) : null}
											{patient.createdAt ? (
												<span className="inline-flex items-center gap-1">
													<CalendarClock className="h-4 w-4" /> inscrit
													{" "}
													{formatDistanceToNow(patient.createdAt, {
														locale: fr,
														addSuffix: true,
													})}
												</span>
											) : null}
										</div>
									</div>
								</div>
									<div className="flex flex-col gap-3 text-sm text-white/70 md:items-end">
									<span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-widest">
										{patient.status === "active" ? (
											<>
												<CheckCircle2 className="h-4 w-4 text-emerald-300" />
												Actif
											</>
										) : patient.status === "pending" ? (
											<>
												<Hourglass className="h-4 w-4 text-amber-200" />
												En attente
											</>
										) : (
											<>
												<AlertCircle className="h-4 w-4 text-rose-300" />
												{patient.status ?? "Inconnu"}
											</>
										)}
									</span>
                                    {patient.status === "pending" ? (
                                        <div className="flex flex-col items-start md:items-end gap-2">
                                            <button
                                                onClick={() => handleResendInvitation(patient)}
                                                disabled={resendingId === patient.id}
                                                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white hover:border-nn-primary-400 hover:bg-nn-primary-500/10 disabled:opacity-60"
                                            >
                                                <Mail className="h-4 w-4" />
                                                {resendingId === patient.id ? "Renvoi..." : "Renvoyer l'invitation"}
                                            </button>
                                            {resendSuccessId === patient.id ? (
                                                <p className="text-[11px] text-emerald-300">Invitation renvoyée.</p>
                                            ) : null}
                                        </div>
                                    ) : null}
									{patient.upcomingConsultation ? (
										<p className="text-xs text-white/60">
											Prochaine séance
											{" "}
											{formatDistanceToNow(patient.upcomingConsultation, {
												locale: fr,
												addSuffix: true,
											})}
										</p>
									) : (
										<p className="text-xs text-white/40">Aucune consultation planifiée</p>
									)}
									<Link
										href={`/patients/${patient.id}`}
										className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-nn-accent-200"
									>
										Ouvrir la fiche
										<ArrowRight className="h-4 w-4" />
									</Link>
								</div>
							</article>
						))}
					</div>
				)}
			</section>
		</DashboardShell>
	);
}

