import { useCatalogStore } from '../../store/useCatalogStore';

export function Header() {
  const { meta } = useCatalogStore();

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div />
      {meta && (
        <div className="flex gap-4 text-xs text-slate-500">
          <span className="bg-slate-100 px-3 py-1 rounded-full">
            {meta.totalRows.toLocaleString('fr')} sessions
          </span>
          <span className="bg-slate-100 px-3 py-1 rounded-full">
            {meta.ecoles.length} écoles
          </span>
          <span className="bg-slate-100 px-3 py-1 rounded-full">
            {meta.cursus.length} cursus
          </span>
        </div>
      )}
    </header>
  );
}
