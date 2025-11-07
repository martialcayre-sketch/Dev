import { BrainCircuit, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface QuestionnaireCategory {
  name: string;
  slug: string;
  questionnaires: Array<{ name: string; filePath: string }>;
}

export function QuestionnaireLibrary() {
  const [categories, setCategories] = useState<QuestionnaireCategory[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Implémenter l'API /api/questionnaires ou charger depuis Firestore
    // Pour l'instant, on retourne une liste vide pour éviter l'erreur 404
    console.warn('[QuestionnaireLibrary] API /api/questionnaires not implemented yet');
    setCategories([]);
    setLoading(false);
  }, []);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-white/60">
            Bibliothèque clinique
          </p>
          <h2 className="text-xl font-semibold text-white">Questionnaires disponibles</h2>
        </div>
        <BrainCircuit className="hidden h-8 w-8 text-nn-primary-200 md:block" />
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center gap-2 text-white/60">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Chargement des questionnaires...</span>
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <div key={category.slug} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{category.name}</p>
                  <p className="text-xs text-white/50">
                    {category.questionnaires.length} questionnaires
                  </p>
                </div>
                <Link
                  to={`/tools/questionnaires/${category.slug}`}
                  className="text-xs font-semibold uppercase tracking-wide text-nn-primary-200 hover:text-nn-primary-100"
                >
                  Ouvrir
                </Link>
              </div>
              <div className="mt-3 space-y-1">
                {category.questionnaires.slice(0, 3).map((questionnaire) => (
                  <p key={questionnaire.filePath} className="text-xs text-white/55">
                    • {questionnaire.name}
                  </p>
                ))}
                {category.questionnaires.length > 3 ? (
                  <p className="text-[11px] uppercase tracking-wide text-white/40">
                    + {category.questionnaires.length - 3} autres
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-xl border border-dashed border-white/10 bg-white/5 px-4 py-5 text-white/60">
          Aucun questionnaire trouvé dans le dossier data/questionnaires.
        </div>
      )}
    </section>
  );
}
