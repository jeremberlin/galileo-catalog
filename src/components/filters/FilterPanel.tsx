import { Search, X } from 'lucide-react';
import { useFilterStore } from '../../store/useFilterStore';
import type { CatalogMeta } from '../../types/catalog';

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="px-2 py-1.5 border border-slate-200 rounded-lg text-sm bg-white hover:border-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-colors"
      >
        <option value="">Tous</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

export function FilterPanel({ meta }: { meta: CatalogMeta | null }) {
  const { filters, setFilter, clearFilters } = useFilterStore();

  if (!meta) return null;

  const hasFilters = Object.values(filters).some(Boolean);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher dans le catalogue..."
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
          />
        </div>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
          >
            <X size={14} />
            Effacer filtres
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <FilterSelect label="École" value={filters.ecole} options={meta.ecoles} onChange={(v) => setFilter('ecole', v)} />
        <FilterSelect label="Cursus" value={filters.cursus} options={meta.cursus} onChange={(v) => setFilter('cursus', v)} />
        <FilterSelect label="Niveau" value={filters.niveau} options={meta.niveaux} onChange={(v) => setFilter('niveau', v)} />
        <FilterSelect label="Rythme" value={filters.rythme} options={meta.rythmes} onChange={(v) => setFilter('rythme', v)} />
        <FilterSelect label="Année" value={filters.annee} options={meta.annees} onChange={(v) => setFilter('annee', v)} />
        <FilterSelect label="Session" value={filters.session} options={meta.sessions} onChange={(v) => setFilter('session', v)} />
        <FilterSelect label="Spécialisation" value={filters.spec} options={meta.specs} onChange={(v) => setFilter('spec', v)} />
      </div>
    </div>
  );
}
