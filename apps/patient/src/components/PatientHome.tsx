"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarClock,
  Check,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Droplet,
  FileText as FileTextIcon,
  Flame,
  HeartPulse,
  Leaf,
  MessageSquare,
  Moon,
  ShieldCheck,
  Upload,
  UtensilsCrossed,
  Video,
} from "lucide-react";
import {
  joinTeleconsult,
  startQuestionnaire,
  markTodoAsRead,
  openDocument,
  sendMeasurement,
  sendDocument,
  bookAppointment,
  messagePractitioner,
  toggleMeal,
  toggleSupplement,
  addRecipeToPlan,
} from "@/src/services/patient";
import type {
  NextAppointment,
  ProgressData,
  RecipeItem,
  TodayPlan,
  TodoItem,
  UserMe,
} from "@/src/types/patient";

interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  variant?: "default" | "success" | "error";
}

const initialUser: UserMe = {
  id: "patient-demo",
  firstName: "Clara",
  lastName: "Martin",
  unreadMessages: 2,
};

const initialAppointment: NextAppointment = {
  id: "appt-42",
  startsAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
  practitionerName: "Dr Sandrine Dupont",
  mode: "teleconsultation",
  instructions: "Connectez-vous 5 minutes avant avec vos derniers relevés.",
  location: "En ligne",
};

const initialTodos: TodoItem[] = [
  {
    id: "todo-questionnaire-symptoms",
    kind: "questionnaire",
    title: "Questionnaire plaintes et douleurs",
    description: "Décrivez vos symptômes actuels et leur fréquence.",
    relatedId: "plaintes-douleurs",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    completed: false,
    read: false,
  },
  {
    id: "todo-questionnaire-lifestyle",
    kind: "questionnaire",
    title: "Questionnaire mode de vie",
    description: "Habitudes de sommeil, activité physique et stress.",
    relatedId: "mode-de-vie",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    completed: false,
    read: false,
  },
  {
    id: "todo-questionnaire-food",
    kind: "questionnaire",
    title: "Questionnaire alimentaire",
    description: "Vos repas types et préférences nutritionnelles.",
    relatedId: "questionnaire-alimentaire",
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
    completed: false,
    read: false,
  },
  {
    id: "todo-document-plan",
    kind: "document",
    title: "Plan de suivi nutritionnel",
    description: "Retrouvez le plan personnalisé transmis par votre praticien.",
    relatedId: "plan-nutrition",
    dueDate: undefined,
    completed: false,
    read: false,
  },
];

const initialPlan: TodayPlan = {
  meals: [
    {
      id: "meal-breakfast",
      title: "Petit déjeuner",
      time: "08:00",
      description: "Commencez la journée avec des fibres et des protéines.",
      items: ["Porridge avoine", "Compote pomme-poire", "Infusion gingembre"],
      done: false,
    },
    {
      id: "meal-lunch",
      title: "Déjeuner",
      time: "12:30",
      description: "Privilégiez les légumes verts et les oméga-3.",
      items: ["Saumon vapeur", "Quinoa", "Salade croquante"],
      done: false,
    },
    {
      id: "meal-dinner",
      title: "Dîner",
      time: "19:30",
      description: "Repas léger pour optimiser le sommeil.",
      items: ["Velouté potimarron", "Pois chiches grillés", "Tisane camomille"],
      done: false,
    },
  ],
  supplements: [
    {
      id: "supp-magnesium",
      title: "Magnésium marin",
      time: "22:00",
      dosage: "2 gélules",
      done: false,
    },
    {
      id: "supp-omega3",
      title: "Oméga 3",
      time: "13:00",
      dosage: "1 capsule",
      done: true,
    },
  ],
};

const initialProgress: ProgressData = {
  planAdherence: 82,
  hydration: 76,
  sleep: 71,
  stress: 43,
  energy: 68,
};

const initialRecipes: RecipeItem[] = [
  {
    id: "recipe-green-smoothie",
    title: "Smoothie vert anti-stress",
    calories: 240,
    durationMinutes: 10,
    tags: ["Boisson", "Détox"],
    url: "/recipes/green-smoothie",
  },
  {
    id: "recipe-buddha-bowl",
    title: "Buddha bowl énergisant",
    calories: 520,
    durationMinutes: 20,
    tags: ["Déjeuner", "Plats", "Végé"],
    url: "/recipes/buddha-bowl",
  },
  {
    id: "recipe-chia-pudding",
    title: "Pudding chia fruits rouges",
    calories: 310,
    durationMinutes: 15,
    tags: ["Petit déjeuner", "Riche en fibres"],
    url: "/recipes/chia-pudding",
  },
];

type LoadingMap = Record<string, boolean>;

type ToastInput = Omit<ToastMessage, "id">;

const formatDateTime = (iso: string): string =>
  new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

const formatDueDate = (iso?: string): string | undefined =>
  iso
    ? new Intl.RelativeTimeFormat("fr", { numeric: "auto" }).format(
        Math.round((new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
        "day",
      )
    : undefined;

export default function PatientHome(): JSX.Element {
  const router = useRouter();
  const [user] = useState<UserMe>(initialUser);
  const [appointment] = useState<NextAppointment>(initialAppointment);
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [todayPlan, setTodayPlan] = useState<TodayPlan>(initialPlan);
  const [progress] = useState<ProgressData>(initialProgress);
  const [recipes] = useState<RecipeItem[]>(initialRecipes);
  const [loadingMap, setLoadingMap] = useState<LoadingMap>({});
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    ({ title, description, variant = "default" }: ToastInput) => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
      setToast({ id: Date.now(), title, description, variant });
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, 2600);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const setLoading = useCallback((key: string, value: boolean) => {
    setLoadingMap((previous) => {
      if (value) {
        return { ...previous, [key]: true };
      }
      const { [key]: _omitted, ...rest } = previous;
      return rest;
    });
  }, []);

  const isLoading = useCallback(
    (key: string) => Boolean(loadingMap[key]),
    [loadingMap],
  );

  const pendingTodos = useMemo(() => todos.filter((todo) => !todo.completed), [todos]);
  const questionnaireTodos = useMemo(
    () => todos.filter((todo) => todo.kind === "questionnaire"),
    [todos],
  );
  const documentTodos = useMemo(
    () => todos.filter((todo) => todo.kind === "document"),
    [todos],
  );

  const progressEntries = useMemo(
    () => [
      {
        key: "planAdherence",
        label: "Plan alimentaire",
        value: progress.planAdherence,
        icon: Flame,
      },
      {
        key: "hydration",
        label: "Hydratation",
        value: progress.hydration,
        icon: Droplet,
      },
      {
        key: "sleep",
        label: "Sommeil",
        value: progress.sleep,
        icon: Moon,
      },
      {
        key: "stress",
        label: "Gestion du stress",
        value: progress.stress,
        icon: HeartPulse,
      },
      {
        key: "energy",
        label: "Énergie",
        value: progress.energy,
        icon: Leaf,
      },
    ],
    [progress],
  );

  const handleJoinTeleconsult = useCallback(async () => {
    const key = "join-teleconsult";
    setLoading(key, true);
    try {
      await joinTeleconsult();
      router.push("/teleconsult");
      showToast({
        title: "Connexion à la visio",
        description: "Votre rendez-vous démarre.",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Impossible de rejoindre la visio",
        variant: "error",
      });
    } finally {
      setLoading(key, false);
    }
  }, [router, setLoading, showToast]);

  const handleBookAppointment = useCallback(async () => {
    const key = "book-appointment";
    setLoading(key, true);
    try {
      await bookAppointment();
      router.push("/rdv");
      showToast({
        title: "Prendre un rendez-vous",
        description: "Choisissez un créneau pour votre prochaine séance.",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Rendez-vous indisponible",
        variant: "error",
      });
    } finally {
      setLoading(key, false);
    }
  }, [router, setLoading, showToast]);

  const handleStartQuestionnaire = useCallback(
    async (todo: TodoItem) => {
      const key = `questionnaire-${todo.id}`;
      setLoading(key, true);
      try {
        await startQuestionnaire(todo.relatedId);
        router.push(`/questionnaires/${todo.relatedId}`);
        showToast({
          title: "Questionnaire ouvert",
          description: todo.title,
          variant: "success",
        });
      } catch (error) {
        console.error(error);
        showToast({
          title: "Questionnaire indisponible",
          variant: "error",
        });
      } finally {
        setLoading(key, false);
      }
    },
    [router, setLoading, showToast],
  );

  const handleMarkAsRead = useCallback(
    async (todoId: string) => {
      const key = `todo-${todoId}-mark`;
      let previousSnapshot: TodoItem | undefined;
      setLoading(key, true);
      setTodos((current) =>
        current.map((todo) => {
          if (todo.id === todoId) {
            previousSnapshot = { ...todo };
            return { ...todo, read: true, completed: true };
          }
          return todo;
        }),
      );

      try {
        await markTodoAsRead(todoId);
        showToast({
          title: "Document marqué comme lu",
          variant: "success",
        });
      } catch (error) {
        console.error(error);
        if (previousSnapshot) {
          setTodos((current) =>
            current.map((todo) => (todo.id === todoId ? previousSnapshot! : todo)),
          );
        }
        showToast({
          title: "Échec du marquage",
          description: "Réessayez dans un instant.",
          variant: "error",
        });
      } finally {
        setLoading(key, false);
      }
    },
    [setLoading, showToast],
  );

  const handleOpenDocument = useCallback(
    async (todo: TodoItem) => {
      const key = `open-doc-${todo.id}`;
      setLoading(key, true);
      try {
        await openDocument(todo.relatedId);
        router.push(`/documents/${todo.relatedId}`);
      } catch (error) {
        console.error(error);
        showToast({
          title: "Document indisponible",
          variant: "error",
        });
      } finally {
        setLoading(key, false);
      }
    },
    [router, setLoading, showToast],
  );

  const handleSendMeasurement = useCallback(async () => {
    const key = "send-measurement";
    setLoading(key, true);
    try {
      await sendMeasurement("poids");
      router.push("/upload/measurement");
      showToast({
        title: "Mesure à jour",
        description: "Ajoutez vos relevés et syncro.",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Envoi impossible",
        variant: "error",
      });
    } finally {
      setLoading(key, false);
    }
  }, [router, setLoading, showToast]);

  const handleSendDocument = useCallback(async () => {
    const key = "send-document";
    setLoading(key, true);
    try {
      await sendDocument("analyse-bio");
      router.push("/upload/document");
      showToast({
        title: "Document prêt",
        description: "Téléversez vos nouveaux résultats.",
        variant: "success",
      });
    } catch (error) {
      console.error(error);
      showToast({
        title: "Envoi impossible",
        variant: "error",
      });
    } finally {
      setLoading(key, false);
    }
  }, [router, setLoading, showToast]);

  const handleMessagePractitioner = useCallback(async () => {
    const key = "message-practitioner";
    setLoading(key, true);
    try {
      await messagePractitioner();
      router.push("/messages");
    } catch (error) {
      console.error(error);
      showToast({
        title: "Message non envoyé",
        variant: "error",
      });
    } finally {
      setLoading(key, false);
    }
  }, [router, setLoading, showToast]);

  const handleToggleMeal = useCallback(
    async (mealId: string) => {
      const key = `meal-${mealId}`;
      let nextDone = false;
      let previousState: TodayPlan["meals"][number] | undefined;
      setTodayPlan((current) => ({
        ...current,
        meals: current.meals.map((meal) => {
          if (meal.id === mealId) {
            previousState = { ...meal };
            nextDone = !meal.done;
            return { ...meal, done: nextDone };
          }
          return meal;
        }),
      }));
      setLoading(key, true);
      try {
        await toggleMeal(mealId, nextDone);
        showToast({
          title: nextDone ? "Repas terminé" : "Repas réactivé",
          description: previousState?.title,
          variant: "success",
        });
      } catch (error) {
        console.error(error);
        if (previousState) {
          setTodayPlan((current) => ({
            ...current,
            meals: current.meals.map((meal) => (meal.id === mealId ? previousState! : meal)),
          }));
        }
        showToast({
          title: "Mise à jour impossible",
          variant: "error",
        });
      } finally {
        setLoading(key, false);
      }
    },
    [setLoading, showToast],
  );

  const handleToggleSupplement = useCallback(
    async (supplementId: string) => {
      const key = `supplement-${supplementId}`;
      let nextDone = false;
      let previousState: TodayPlan["supplements"][number] | undefined;
      setTodayPlan((current) => ({
        ...current,
        supplements: current.supplements.map((supplement) => {
          if (supplement.id === supplementId) {
            previousState = { ...supplement };
            nextDone = !supplement.done;
            return { ...supplement, done: nextDone };
          }
          return supplement;
        }),
      }));
      setLoading(key, true);
      try {
        await toggleSupplement(supplementId, nextDone);
        showToast({
          title: nextDone ? "Complément pris" : "Complément à prendre",
          description: previousState?.title,
          variant: "success",
        });
      } catch (error) {
        console.error(error);
        if (previousState) {
          setTodayPlan((current) => ({
            ...current,
            supplements: current.supplements.map((supplement) =>
              supplement.id === supplementId ? previousState! : supplement,
            ),
          }));
        }
        showToast({
          title: "Échec de mise à jour",
          variant: "error",
        });
      } finally {
        setLoading(key, false);
      }
    },
    [setLoading, showToast],
  );

  const handleAddRecipe = useCallback(
    async (recipe: RecipeItem) => {
      const key = `recipe-${recipe.id}`;
      setLoading(key, true);
      try {
        await addRecipeToPlan(recipe.id);
        router.push(recipe.url ?? `/recipes/${recipe.id}`);
        showToast({
          title: "Recette ajoutée",
          description: `${recipe.title} est maintenant dans votre plan.`,
          variant: "success",
        });
      } catch (error) {
        console.error(error);
        showToast({
          title: "Ajout impossible",
          variant: "error",
        });
      } finally {
        setLoading(key, false);
      }
    },
    [router, setLoading, showToast],
  );

  return (
    <div className="min-h-screen bg-slate-950 pb-24 text-slate-100">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-900/40 p-10 shadow-2xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                Bonjour {user.firstName}
              </p>
              <h1 className="text-3xl font-semibold text-white lg:text-4xl">
                Votre tableau de bord santé quotidienne
              </h1>
              <p className="text-sm text-white/60">
                Suivez vos questionnaires, rendez-vous et actions conseillées par votre praticien. Les
                mises à jour sont synchronisées en temps réel avec votre dossier.
              </p>
              <div className="flex flex-wrap gap-3 pt-1" role="group" aria-label="Actions prioritaires">
                <button
                  type="button"
                  onClick={handleJoinTeleconsult}
                  className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:from-emerald-400 hover:to-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={isLoading("join-teleconsult")}
                >
                  <Video className="h-4 w-4" aria-hidden="true" />
                  Rejoindre la visio
                </button>
                <button
                  type="button"
                  onClick={handleBookAppointment}
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isLoading("book-appointment")}
                >
                  <CalendarClock className="h-4 w-4" aria-hidden="true" />
                  Prendre RDV
                </button>
              </div>
            </div>
            <div className="min-w-[260px] rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-6 text-sm text-emerald-100">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/80">
                <CalendarClock className="h-4 w-4" aria-hidden="true" />
                Prochain rendez-vous
              </p>
              <p className="mt-4 text-lg font-semibold text-white">
                {formatDateTime(appointment.startsAt)}
              </p>
              <p className="mt-1 text-sm text-emerald-100/80">Avec {appointment.practitionerName}</p>
              <p className="mt-4 text-xs text-emerald-100/70">{appointment.instructions}</p>
              <span className="mt-5 inline-flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-100">
                <Video className="h-4 w-4" aria-hidden="true" />
                {appointment.mode === "teleconsultation" ? "Téléconsultation" : "Présentiel"}
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8">
            <header className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">À faire</h2>
                <p className="text-xs text-white/60">
                  {pendingTodos.length} action{pendingTodos.length > 1 ? "s" : ""} à compléter
                </p>
              </div>
              <ClipboardList className="h-5 w-5 text-white/50" aria-hidden="true" />
            </header>
            <div className="space-y-4" role="list">
              {questionnaireTodos.map((todo) => {
                const dueLabel = formatDueDate(todo.dueDate);
                const key = `questionnaire-${todo.id}`;
                const loading = isLoading(key);
                return (
                  <article
                    key={todo.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 transition hover:border-white/25"
                    role="listitem"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-white">
                          <ClipboardCheck className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                          {todo.title}
                        </p>
                        <p className="mt-1 text-sm text-white/60">{todo.description}</p>
                        {dueLabel ? (
                          <p className="mt-2 text-xs text-white/40">À compléter {dueLabel}</p>
                        ) : null}
                      </div>
                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <button
                          type="button"
                          onClick={() => handleStartQuestionnaire(todo)}
                          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={loading}
                        >
                          Commencer
                          <ChevronRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDocument(todo)}
                          className="inline-flex items-center gap-2 text-xs text-white/60 hover:text-white"
                          disabled={isLoading(`open-doc-${todo.id}`)}
                        >
                          Consulter le détail
                          <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
              {documentTodos.map((todo) => {
                const loading = isLoading(`todo-${todo.id}-mark`);
                const openLoading = isLoading(`open-doc-${todo.id}`);
                return (
                  <article
                    key={todo.id}
                    className="rounded-2xl border border-white/10 bg-slate-900/40 p-5 transition hover:border-white/25"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-white">
                          <FileTextIcon className="h-4 w-4 text-cyan-300" aria-hidden="true" />
                          {todo.title}
                        </p>
                        <p className="mt-1 text-sm text-white/60">{todo.description}</p>
                      </div>
                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <button
                          type="button"
                          onClick={() => handleOpenDocument(todo)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={openLoading}
                        >
                          Ouvrir
                          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          data-testid={`todo-mark-${todo.id}`}
                          onClick={() => handleMarkAsRead(todo.id)}
                          className="inline-flex items-center gap-2 text-xs text-white/60 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={todo.read || loading}
                          aria-pressed={todo.read}
                        >
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          {todo.read ? "Lu" : "Marquer comme lu"}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Actions rapides
              </h3>
              <div className="mt-4 grid gap-3">
                <button
                  type="button"
                  onClick={handleSendMeasurement}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/30 hover:text-white"
                  disabled={isLoading("send-measurement")}
                >
                  <span className="flex items-center gap-3">
                    <HeartPulse className="h-4 w-4" aria-hidden="true" />
                    Ajouter une mesure
                  </span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleSendDocument}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/30 hover:text-white"
                  disabled={isLoading("send-document")}
                >
                  <span className="flex items-center gap-3">
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Transmettre un document
                  </span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handleMessagePractitioner}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/40 px-4 py-3 text-left text-sm text-white/70 transition hover:border-white/30 hover:text-white"
                  disabled={isLoading("message-practitioner")}
                >
                  <span className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    Contacter mon praticien
                    {user.unreadMessages > 0 ? (
                      <span className="ml-2 inline-flex min-w-[1.75rem] items-center justify-center rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                        {user.unreadMessages}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em] text-white/70">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Conformité HDS
              </h3>
              <p className="mt-3 text-xs text-white/60">
                Vos données sont chiffrées et hébergées sur une infrastructure conforme aux exigences HDS.
                Activez l’authentification multi-facteurs pour sécuriser davantage votre espace.
              </p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
          <div className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-8">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Programme du jour</h2>
              <UtensilsCrossed className="h-5 w-5 text-white/50" aria-hidden="true" />
            </header>
            <div className="space-y-5">
              {todayPlan.meals.map((meal) => {
                const key = `meal-${meal.id}`;
                const loading = isLoading(key);
                return (
                  <div key={meal.id} className="rounded-2xl border border-white/10 bg-slate-900/40 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-white">
                          <UtensilsCrossed className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                          {meal.title}
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-medium text-white/60">
                            {meal.time}
                          </span>
                        </p>
                        <p className="mt-1 text-sm text-white/60">{meal.description}</p>
                        <ul className="mt-2 flex flex-wrap gap-2 text-xs text-white/40" aria-label="Détails du repas">
                          {meal.items.map((item) => (
                            <li
                              key={`${meal.id}-${item}`}
                              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1"
                            >
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <button
                        type="button"
                        data-testid={`meal-toggle-${meal.id}`}
                        onClick={() => handleToggleMeal(meal.id)}
                        className={`inline-flex items-center gap-2 self-start rounded-xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] transition ${
                          meal.done
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                            : "border-white/15 bg-white/5 text-white"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                        aria-pressed={meal.done}
                        disabled={loading}
                      >
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                        {meal.done ? "Terminé" : "À faire"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-6">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-white">
                <Leaf className="h-4 w-4 text-lime-300" aria-hidden="true" />
                Compléments
              </h3>
              <ul className="mt-4 space-y-3" aria-label="Liste des compléments">
                {todayPlan.supplements.map((supplement) => {
                  const key = `supplement-${supplement.id}`;
                  const loading = isLoading(key);
                  return (
                    <li
                      key={supplement.id}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
                    >
                      <div>
                        <p className="font-medium text-white">{supplement.title}</p>
                        <p className="text-xs text-white/50">
                          {supplement.dosage} • {supplement.time}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleToggleSupplement(supplement.id)}
                        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                          supplement.done
                            ? "border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                            : "border-white/20 bg-transparent text-white"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                        aria-pressed={supplement.done}
                        disabled={loading}
                      >
                        {supplement.done ? "Pris" : "À prendre"}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-lg font-semibold text-white">Progression</h2>
              <p className="text-xs text-white/60">Suivi glissant sur 7 jours</p>
              <div className="mt-5 space-y-4">
                {progressEntries.map(({ key, label, value, icon: Icon }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-white/60">
                      <span className="flex items-center gap-2 text-white">
                        <Icon className="h-4 w-4 text-white/60" aria-hidden="true" />
                        {label}
                      </span>
                      <span className="text-white">{value}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400"
                        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                        role="presentation"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h2 className="text-lg font-semibold text-white">Recettes suggérées</h2>
              <p className="text-xs text-white/60">Sélectionnées selon vos objectifs actuels</p>
              <div className="mt-5 space-y-4">
                {recipes.map((recipe) => {
                  const key = `recipe-${recipe.id}`;
                  const loading = isLoading(key);
                  return (
                    <article
                      key={recipe.id}
                      className="rounded-2xl border border-white/10 bg-slate-900/40 p-5"
                    >
                      <p className="text-sm font-semibold text-white">{recipe.title}</p>
                      <p className="mt-1 text-xs text-white/50">
                        {recipe.calories} kcal • {recipe.durationMinutes} min
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.3em] text-white/40">
                        {recipe.tags.map((tag) => (
                          <span
                            key={`${recipe.id}-${tag}`}
                            className="rounded-full border border-white/10 px-2 py-0.5"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAddRecipe(recipe)}
                        className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white transition hover:border-white/30 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={loading}
                      >
                        Ajouter au plan
                        <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-rose-500/10 p-8 text-rose-50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.35em] text-rose-100">
              <AlertCircle className="h-5 w-5" aria-hidden="true" />
              Rappel onboarding patient
            </div>
            <p className="max-w-3xl text-sm text-rose-100/80">
              Après la validation de votre compte, votre praticien planifie le premier rendez-vous et vous envoie
              systématiquement trois questionnaires : plaintes et douleurs ressenties, mode de vie, et questionnaire
              alimentaire. Les scores et graphiques associés sont visibles dans le tableau de bord praticien.
            </p>
          </div>
        </section>
      </main>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-50" role="status" aria-live="assertive">
          <div
            className={`min-w-[240px] rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              toast.variant === "error"
                ? "border-rose-500/40 bg-rose-500/20 text-rose-50"
                : toast.variant === "success"
                ? "border-emerald-400/40 bg-emerald-400/20 text-emerald-50"
                : "border-white/20 bg-slate-900/80 text-white"
            }`}
          >
            <p className="font-semibold">{toast.title}</p>
            {toast.description ? (
              <p className="mt-1 text-xs opacity-80">{toast.description}</p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
