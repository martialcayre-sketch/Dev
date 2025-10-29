"use client";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit, doc, getDoc } from "firebase/firestore";
import { auth } from "@/src/lib/firebase";
import { db } from "@/src/lib/firebase";
import RequireAuth from "@/src/components/RequireAuth";
import { getProfile, upsertProfile } from "@/src/lib/firestore";

export default function ProfilePage() {
  const [displayName, setDisplayName] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [badges, setBadges] = useState<Array<{ id: string; label: string; value: string }>>([]);
  useEffect(() => { (async () => {
    const p = await getProfile().catch(() => null);
    if (p?.displayName) setDisplayName(p.displayName);
  })(); }, []);

  const onSave = async () => {
    setSaved(null);
    await upsertProfile({ displayName });
    setSaved("Enregistré");
  };

  return (
    <RequireAuth>
      <div className="max-w-md space-y-3">
        <h2 className="text-2xl font-semibold">Profil</h2>
        <input className="w-full border px-3 py-2 rounded" value={displayName} onChange={e=>setDisplayName(e.target.value)} placeholder="Nom d’affichage" />
        <button className="px-3 py-2 bg-black text-white rounded" onClick={onSave}>Sauvegarder</button>
        {saved && <p className="text-green-700 text-sm">{saved}</p>}

        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-2">Derniers résultats</h3>
          <Badges setBadges={setBadges} />
          <div className="flex flex-wrap gap-2">
            {badges.map(b => (
              <span key={b.id} className="inline-flex items-center gap-2 border rounded px-2 py-1 text-sm bg-gray-50">
                <span className="text-gray-600">{b.label}:</span>
                <span className="font-medium">{b.value}</span>
              </span>
            ))}
            {badges.length === 0 && <p className="text-sm text-gray-500">Aucun résultat récent.</p>}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}

function Badges({ setBadges }: { setBadges: (b: Array<{id:string;label:string;value:string}>) => void }){
  useEffect(() => {
    const run = async () => {
      const u = auth.currentUser; if (!u) return;
      try {
        // 1) Lire les badges depuis le profil s'ils existent
        const pref = doc(db, 'profiles', u.uid)
        const psnap = await getDoc(pref)
        const pData: any = psnap.exists() ? psnap.data() : {}
        const items: Array<{ id: string; label: string; value: string }> = [];
        if (pData?.badges) {
          if (pData.badges.plaintes) {
            const total = pData.badges.plaintes.total
            items.push({ id: 'plaintes', label: 'Plaintes', value: total != null ? `${total}` : '—' })
          }
          if (pData.badges.siin) {
            const lvl = pData.badges.siin.activite_globale || '—'
            const kcal = pData.badges.siin.kcal_estime != null ? `, ${pData.badges.siin.kcal_estime} kcal/j` : ''
            items.push({ id: 'siin', label: 'Activité (SIIN)', value: `${lvl}${kcal}` })
          }
          if (pData.badges.contexte) {
            const total = pData.badges.contexte.total
            items.push({ id: 'contexte', label: 'Contexte', value: total != null ? `${total}` : '—' })
          }
        }
        // 2) Compléter avec les dernières entrées si rien en profil
        const q = query(
          collection(db, 'intakes'),
          where('ownerUid', '==', u.uid),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        const snaps = await getDocs(q);
        for (const d of snaps.docs) {
          const data: any = d.data();
          const qid = String(data.id || 'QUESTIONNAIRE');
          const score = data._score || {};
          if (qid.includes('mes-plaintes-actuelles-et-troubles-ressentis')) {
            if (!items.find(x => x.id === 'plaintes')) {
              const total = typeof score.total === 'number' ? score.total : undefined;
              items.push({ id: 'plaintes', label: 'Plaintes', value: total != null ? `${total}` : '—' });
            }
          } else if (qid.includes('questionnaire-dactivite-et-de-depense-energetique-globale-siin')) {
            if (!items.find(x => x.id === 'siin')) {
              const lvl = score.activite_globale || '—';
              const kcal = score.kcal_estime != null ? `, ${score.kcal_estime} kcal/j` : '';
              items.push({ id: 'siin', label: 'Activité (SIIN)', value: `${lvl}${kcal}` });
            }
          } else if (qid.includes('questionnaire-contextuel-mode-de-vie')) {
            if (!items.find(x => x.id === 'contexte')) {
              const total = typeof score.total === 'number' ? score.total : undefined;
              items.push({ id: 'contexte', label: 'Contexte', value: total != null ? `${total}` : '—' });
            }
          }
        }
        setBadges(items);
      } catch (e) {
        // ignore
      }
    };
    run();
  }, [setBadges]);
  return null;
}
