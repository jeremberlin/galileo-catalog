import { Download } from 'lucide-react';
import { FilterPanel } from '../components/filters/FilterPanel';
import { CatalogTable } from '../components/table/CatalogTable';
import { useCatalogData } from '../hooks/useCatalogData';
import { exportToCSV } from '../lib/export';

export function CatalogExplorer() {
  const { filteredRows, meta, loading } = useCatalogData();

  if (loading) {
    return <div className="p-6 text-slate-400">Chargement du catalogue...</div>;
  }

  return (
    <div className="p-6 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Catalogue Explorer</h2>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            <span className="font-semibold text-slate-700">{filteredRows.length.toLocaleString('fr')}</span> résultats
          </span>
          <button
            onClick={() => exportToCSV(filteredRows)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download size={14} />
            Exporter CSV
          </button>
        </div>
      </div>
      <FilterPanel meta={meta} />
      <div className="flex-1 min-h-0">
        <CatalogTable data={filteredRows} />
      </div>
    </div>
  );
}
