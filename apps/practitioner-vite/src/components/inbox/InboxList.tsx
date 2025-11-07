import { firestore } from '@/lib/firebase';
import type { PractitionerInboxItem } from '@neuronutrition/shared-questionnaires';
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface Props {
  practitionerId: string;
}

/**
 * Liste des soumissions de questionnaires (inbox praticien)
 */
export default function InboxList({ practitionerId }: Props) {
  const [items, setItems] = useState<PractitionerInboxItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(firestore, `practitioners/${practitionerId}/inbox`),
      orderBy('submittedAt', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setItems(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            type: 'questionnaire_submission' as const,
            patientId: data.patientId,
            questionnaireId: data.questionnaireId,
            questionnaireTitle: data.questionnaireTitle,
            status: data.status || 'new',
            submittedAt: data.submittedAt?.toDate() || new Date(),
          };
        })
      );
      setLoading(false);
    });
    return () => unsub();
  }, [practitionerId]);

  const markRead = async (id: string) => {
    await updateDoc(doc(firestore, `practitioners/${practitionerId}/inbox/${id}`), {
      status: 'read',
    });
  };

  if (loading)
    return (
      <div className="p-4 text-white/70">
        <div className="flex items-center">
          <div className="mr-3 h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-nn-primary-500"></div>
          Chargement…
        </div>
      </div>
    );

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center text-white/60">
        Aucune soumission pour le moment
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <div key={it.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-white">{it.questionnaireTitle}</div>
              <div className="text-xs text-white/60">
                Patient: {it.patientId} • Questionnaire: {it.questionnaireId}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  it.status === 'new'
                    ? 'bg-amber-500/20 text-amber-300'
                    : it.status === 'read'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-white/10 text-white/60'
                }`}
              >
                {it.status === 'new' ? 'Nouveau' : it.status === 'read' ? 'Lu' : it.status}
              </span>
              <a
                href={`/patients/${it.patientId}/questionnaires/${it.questionnaireId}`}
                className="rounded-lg bg-nn-primary-500/20 px-3 py-1 text-xs text-nn-primary-500 hover:bg-nn-primary-500/30"
              >
                Ouvrir
              </a>
              {it.status !== 'read' && (
                <button
                  onClick={() => markRead(it.id)}
                  className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs text-emerald-300 hover:bg-emerald-500/30"
                >
                  Marquer lu
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
