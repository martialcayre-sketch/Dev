import Link from 'next/link'
import catalog from '@/src/data/questionnaires.catalog.json'

type Entry = { id: string; label: string; category: string; pdf: string }

export default function QuestionnairesIndexPage() {
  const byCategory = new Map<string, Entry[]>()
  ;(catalog as Entry[]).forEach(e => {
    if (!byCategory.has(e.category)) byCategory.set(e.category, [])
    byCategory.get(e.category)!.push(e)
  })

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-semibold">Questionnaires</h1>
      {[...byCategory.entries()].map(([cat, items]) => (
        <section key={cat} className="space-y-3">
          <h2 className="text-xl font-semibold">{cat}</h2>
          <ul className="space-y-2">
            {items.map(it => (
              <li key={it.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border rounded p-3">
                <div>
                  <div className="font-medium">{it.label}</div>
                  <div className="text-sm text-gray-500 break-all">{it.pdf}</div>
                </div>
                <div className="flex gap-2">
                  <Link className="px-3 py-2 border rounded" href={it.pdf} target="_blank">Télécharger PDF</Link>
                  <Link className="px-3 py-2 bg-black text-white rounded" href={`/questionnaires/${it.id}`}>Remplir</Link>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
