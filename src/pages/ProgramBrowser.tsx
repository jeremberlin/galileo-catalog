import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import { RythmeBadge } from '../components/table/RythmeBadge';

export function ProgramBrowser() {
  const { dedupedRows, meta } = useCatalogStore();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const programs = useMemo(() => {
    if (!meta) return [];
    const s = search.toLowerCase();
    return meta.cursus.filter(c => !s || c.toLowerCase().includes(s));
  }, [meta, search]);

  const programData = useMemo(() => {
    if (!selected) return null;
    const rows = dedupedRows.filter(r => r.cursus === selected);

    const ecoles = new Map<string, number>();
    const niveaux = new Map<string, Set<string>>();
    const rythmes = new Map<string, number>();
    const specs = new Set<string>();
    const sessions = new Set<string>();
    const annees = new Set<string>();

    for (const r of rows) {
      ecoles.set(r.ecole, (ecoles.get(r.ecole) || 0) + 1);
      if (r.niveau) {
        if (!niveaux.has(r.niveau)) niveaux.set(r.niveau, new Set());
        niveaux.get(r.niveau)!.add(r.rythme);
      }
      rythmes.set(r.rythme, (rythmes.get(r.rythme) || 0) + 1);
      if (r.spec) specs.add(r.spec);
      sessions.add(r.session);
      annees.add(r.annee);
    }

    return {
      totalSessions: rows.length,
      ecoles: [...ecoles.entries()].sort((a, b) => b[1] - a[1]),
      niveaux: [...niveaux.entries()].sort((a, b) => a[0].localeCompare(b[0], 'fr')),
      rythmes: [...rythmes.entries()].sort((a, b) => b[1] - a[1]),
      specs: [...specs].sort((a, b) => a.localeCompare(b, 'fr')),
      sessions: [...sessions].sort(),
      annees: [...annees].sort(),
    };
  }, [selected, dedupedRows]);

  return (
    <div className="flex h-full">
      {/* Left panel */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-3 border-b border-slate-200">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un cursus..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
            />
          </div>
          <div className="text-xs text-slate-400 mt-1.5">{programs.length} cursus</div>
        </div>
        <div className="flex-1 overflow-auto">
          {programs.map(p => (
            <button
              key={p}
              onClick={() => setSelected(p)}
              className={`w-full text-left px-3 py-2 text-sm border-b border-slate-50 transition-colors ${
                selected === p ? 'bg-indigo-50 text-indigo-700 font-medium' : 'hover:bg-slate-50 text-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 overflow-auto p-6">
        {!selected ? (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">
            Sélectionnez un cursus dans la liste
          </div>
        ) : !programData ? (
          <div className="text-slate-400">Chargement...</div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">{selected}</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-2xl font-bold text-indigo-600">{programData.ecoles.length}</div>
                <div className="text-xs text-slate-500">Écoles</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-2xl font-bold text-emerald-600">{programData.niveaux.length}</div>
                <div className="text-xs text-slate-500">Niveaux</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-2xl font-bold text-amber-600">{programData.totalSessions}</div>
                <div className="text-xs text-slate-500">Sessions</div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <div className="text-2xl font-bold text-violet-600">{programData.specs.length}</div>
                <div className="text-xs text-slate-500">Spécialisations</div>
              </div>
            </div>

            {/* Rythmes */}
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Rythmes disponibles</h3>
              <div className="flex flex-wrap gap-2">
                {programData.rythmes.map(([rythme, count]) => (
                  <div key={rythme} className="flex items-center gap-2">
                    <RythmeBadge value={rythme} />
                    <span className="text-xs text-slate-500">{count} sessions</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Schools offering this program */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700">
                  Écoles proposant ce cursus ({programData.ecoles.length})
                </h3>
              </div>
              <div className="divide-y divide-slate-100">
                {programData.ecoles.map(([ecole, count]) => (
                  <div key={ecole} className="px-4 py-2.5 flex justify-between items-center">
                    <span className="text-sm text-slate-800">{ecole}</span>
                    <span className="text-xs text-slate-500">{count} sessions</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Niveaux */}
            <div className="bg-white rounded-xl border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-sm font-semibold text-slate-700">Niveaux ({programData.niveaux.length})</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {programData.niveaux.map(([niveau, rythmes]) => (
                  <div key={niveau} className="px-4 py-2.5">
                    <div className="text-sm text-slate-800">{niveau}</div>
                    <div className="flex gap-1 mt-1">
                      {[...rythmes].map(r => <RythmeBadge key={r} value={r} />)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialisations */}
            {programData.specs.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Spécialisations</h3>
                <div className="flex flex-wrap gap-1.5">
                  {programData.specs.map(s => (
                    <span key={s} className="px-2 py-0.5 bg-violet-50 text-violet-700 rounded text-xs">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
