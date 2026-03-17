import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import { RythmeBadge } from '../components/table/RythmeBadge';

export function SchoolBrowser() {
  const { dedupedRows, meta } = useCatalogStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const schools = useMemo(() => {
    if (!meta) return [];
    const s = search.toLowerCase();
    return meta.ecoles.filter(e => !s || e.toLowerCase().includes(s));
  }, [meta, search]);

  const schoolData = useMemo(() => {
    if (!selected) return null;
    const rows = dedupedRows.filter(r => r.ecole === selected);

    const cursusSet = new Set(rows.map(r => r.cursus));
    const niveaux = new Set(rows.map(r => r.niveau).filter(Boolean));
    const rythmeMap = new Map<string, number>();
    for (const r of rows) {
      rythmeMap.set(r.rythme, (rythmeMap.get(r.rythme) || 0) + 1);
    }
    const sessionSet = new Set(rows.map(r => r.session));
    const anneeSet = new Set(rows.map(r => r.annee));

    // Group by cursus
    const cursusGroups = new Map<string, { niveaux: Set<string>; rythmes: Set<string>; specs: Set<string>; sessions: number }>();
    for (const r of rows) {
      if (!cursusGroups.has(r.cursus)) {
        cursusGroups.set(r.cursus, { niveaux: new Set(), rythmes: new Set(), specs: new Set(), sessions: 0 });
      }
      const g = cursusGroups.get(r.cursus)!;
      if (r.niveau) g.niveaux.add(r.niveau);
      g.rythmes.add(r.rythme);
      if (r.spec) g.specs.add(r.spec);
      g.sessions++;
    }
    const cursusList = [...cursusGroups.entries()]
      .map(([name, g]) => ({ name, ...g }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));

    return {
      totalSessions: rows.length,
      totalCursus: cursusSet.size,
      totalNiveaux: niveaux.size,
      rythmes: [...rythmeMap.entries()].sort((a, b) => b[1] - a[1]),
      sessions: [...sessionSet].sort(),
      annees: [...anneeSet].sort(),
      cursusList,
    };
  }, [selected, dedupedRows]);

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-72 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une école..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div className="text-xs text-slate-400 mt-1.5">{schools.length} écoles</div>
        </div>
        <div className="flex-1 overflow-auto">
          {schools.map(s => (
            <button
              key={s}
              onClick={() => setSelected(s)}
              className={`w-full text-left px-3 py-2 text-sm border-b border-slate-50 transition-colors ${
                selected === s ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-auto p-6">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Sélectionnez une école dans la liste
          </div>
        ) : !schoolData ? (
          <div className="text-slate-400">Chargement...</div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">{selected}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-2xl font-bold text-indigo-600">{schoolData.totalCursus}</div>
                <div className="text-xs text-slate-500">Cursus</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-2xl font-bold text-emerald-600">{schoolData.totalNiveaux}</div>
                <div className="text-xs text-slate-500">Niveaux</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-2xl font-bold text-amber-600">{schoolData.totalSessions}</div>
                <div className="text-xs text-slate-500">Sessions</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-2xl font-bold text-violet-600">{schoolData.annees.length}</div>
                <div className="text-xs text-slate-500">Années académiques</div>
              </div>
            </div>

            {/* Rythmes */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Répartition par rythme</h3>
              <div className="flex flex-wrap gap-2">
                {schoolData.rythmes.map(([rythme, count]) => (
                  <div key={rythme} className="flex items-center gap-2">
                    <RythmeBadge value={rythme} />
                    <span className="text-xs text-slate-500">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sessions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Mois de rentrée</h3>
              <div className="flex flex-wrap gap-1.5">
                {schoolData.sessions.map(s => (
                  <span key={s} className="px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-700">{s}</span>
                ))}
              </div>
            </div>

            {/* Cursus list */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700">
                  Programmes ({schoolData.cursusList.length})
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {schoolData.cursusList.map(c => (
                  <div key={c.name} className="px-4 py-3">
                    <div className="font-medium text-sm text-slate-800">{c.name}</div>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      <span className="text-xs text-slate-500">{c.niveaux.size} niveaux</span>
                      <span className="text-xs text-slate-400">|</span>
                      <span className="text-xs text-slate-500">{c.sessions} sessions</span>
                      {c.specs.size > 0 && (
                        <>
                          <span className="text-xs text-slate-400">|</span>
                          <span className="text-xs text-slate-500">{c.specs.size} spéc.</span>
                        </>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[...c.rythmes].map(r => (
                        <RythmeBadge key={r} value={r} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
