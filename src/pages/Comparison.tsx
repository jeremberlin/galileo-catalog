import { useState, useMemo } from 'react';
import { Plus, X } from 'lucide-react';
import { useCatalogStore } from '../store/useCatalogStore';
import { RythmeBadge } from '../components/table/RythmeBadge';

export function Comparison() {
  const { dedupedRows, meta } = useCatalogStore();
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);

  const addSchool = (school: string) => {
    if (school && !selectedSchools.includes(school) && selectedSchools.length < 5) {
      setSelectedSchools([...selectedSchools, school]);
    }
  };

  const removeSchool = (school: string) => {
    setSelectedSchools(selectedSchools.filter(s => s !== school));
  };

  const comparisons = useMemo(() => {
    return selectedSchools.map(school => {
      const rows = dedupedRows.filter(r => r.ecole === school);
      const cursus = new Set(rows.map(r => r.cursus));
      const rythmes = new Map<string, number>();
      const sessions = new Set<string>();
      for (const r of rows) {
        rythmes.set(r.rythme, (rythmes.get(r.rythme) || 0) + 1);
        sessions.add(r.session);
      }
      return {
        school,
        cursusCount: cursus.size,
        cursusSet: cursus,
        sessionCount: rows.length,
        rythmes: [...rythmes.entries()].sort((a, b) => b[1] - a[1]),
        sessions: [...sessions].sort(),
      };
    });
  }, [selectedSchools, dedupedRows]);

  // Shared vs unique programs
  const sharedPrograms = useMemo(() => {
    if (comparisons.length < 2) return { shared: new Set<string>(), unique: new Map<string, Set<string>>() };
    const all = comparisons.map(c => c.cursusSet);
    const shared = new Set([...all[0]].filter(p => all.every(s => s.has(p))));
    const unique = new Map<string, Set<string>>();
    for (const c of comparisons) {
      const u = new Set([...c.cursusSet].filter(p => !shared.has(p) && comparisons.filter(o => o.cursusSet.has(p)).length === 1));
      unique.set(c.school, u);
    }
    return { shared, unique };
  }, [comparisons]);

  if (!meta) return null;

  const available = meta.ecoles.filter(e => !selectedSchools.includes(e));

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <h2 className="text-xl font-bold text-slate-800">Comparaison d'écoles</h2>

      {/* School selector */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          {selectedSchools.map(s => (
            <span key={s} className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
              {s}
              <button onClick={() => removeSchool(s)} className="hover:text-red-600">
                <X size={14} />
              </button>
            </span>
          ))}
          {selectedSchools.length < 5 && (
            <div className="flex items-center gap-1">
              <Plus size={14} className="text-slate-400" />
              <select
                value=""
                onChange={e => addSchool(e.target.value)}
                className="border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:border-indigo-500"
              >
                <option value="">Ajouter une école...</option>
                {available.map(e => (
                  <option key={e} value={e}>{e}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {comparisons.length === 0 && (
        <div className="text-center py-16 text-slate-400 text-sm">
          Sélectionnez au moins 2 écoles pour comparer
        </div>
      )}

      {/* Comparison cards */}
      {comparisons.length > 0 && (
        <div className={`grid gap-4 ${comparisons.length <= 3 ? `grid-cols-${comparisons.length}` : 'grid-cols-2 lg:grid-cols-3'}`}>
          {comparisons.map(c => (
            <div key={c.school} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
              <h3 className="font-semibold text-sm text-slate-800 truncate" title={c.school}>{c.school}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xl font-bold text-indigo-600">{c.cursusCount}</div>
                  <div className="text-[10px] text-slate-500">Cursus</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-emerald-600">{c.sessionCount}</div>
                  <div className="text-[10px] text-slate-500">Sessions</div>
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Rythmes</div>
                <div className="flex flex-wrap gap-1">
                  {c.rythmes.map(([r, n]) => (
                    <div key={r} className="flex items-center gap-1">
                      <RythmeBadge value={r} />
                      <span className="text-[10px] text-slate-400">{n}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold text-slate-500 uppercase mb-1">Sessions</div>
                <div className="flex flex-wrap gap-1">
                  {c.sessions.map(s => (
                    <span key={s} className="px-1.5 py-0.5 bg-slate-100 rounded text-[10px] text-slate-600">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Shared / Unique programs */}
      {comparisons.length >= 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">
              Programmes en commun ({sharedPrograms.shared.size})
            </h3>
            <div className="max-h-64 overflow-auto space-y-1">
              {[...sharedPrograms.shared].sort((a, b) => a.localeCompare(b, 'fr')).map(p => (
                <div key={p} className="text-xs text-slate-700 py-0.5">{p}</div>
              ))}
              {sharedPrograms.shared.size === 0 && (
                <div className="text-xs text-slate-400">Aucun programme en commun</div>
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Programmes uniques</h3>
            <div className="max-h-64 overflow-auto space-y-3">
              {[...sharedPrograms.unique.entries()].map(([school, progs]) => (
                <div key={school}>
                  <div className="text-xs font-medium text-indigo-600 mb-1">{school} ({progs.size})</div>
                  {[...progs].sort((a, b) => a.localeCompare(b, 'fr')).slice(0, 10).map(p => (
                    <div key={p} className="text-xs text-slate-600 py-0.5 pl-2">{p}</div>
                  ))}
                  {progs.size > 10 && <div className="text-xs text-slate-400 pl-2">...et {progs.size - 10} autres</div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
