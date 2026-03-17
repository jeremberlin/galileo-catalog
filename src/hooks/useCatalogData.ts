import { useMemo } from 'react';
import { useCatalogStore } from '../store/useCatalogStore';
import { useFilterStore } from '../store/useFilterStore';
import type { CatalogRow, CatalogMeta } from '../types/catalog';

function matchesFilters(
  row: CatalogRow,
  filters: Record<string, string>,
  excludeKey?: string,
) {
  if (excludeKey !== 'ecole' && filters.ecole && row.ecole !== filters.ecole) return false;
  if (excludeKey !== 'cursus' && filters.cursus && row.cursus !== filters.cursus) return false;
  if (excludeKey !== 'niveau' && filters.niveau && row.nivCode !== filters.niveau) return false;
  if (excludeKey !== 'rythme' && filters.rythme && row.rythme !== filters.rythme) return false;
  if (excludeKey !== 'annee' && filters.annee && row.annee !== filters.annee) return false;
  if (excludeKey !== 'session' && filters.session && row.session !== filters.session) return false;
  if (excludeKey !== 'spec' && filters.spec && row.spec !== filters.spec) return false;
  if (filters.search) {
    const hay = `${row.ecole} ${row.cursus} ${row.niveau} ${row.spec} ${row.rythme} ${row.sessEff}`.toLowerCase();
    if (!hay.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

function uniqueSorted(values: Iterable<string>): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b, 'fr'));
}

export function useCatalogData() {
  const { dedupedRows, meta, loading, error } = useCatalogStore();
  const { filters } = useFilterStore();

  const filteredRows = useMemo(() => {
    return dedupedRows.filter((row) => matchesFilters(row, filters));
  }, [dedupedRows, filters]);

  // Compute available options for each filter based on all OTHER active filters
  const availableOptions = useMemo((): CatalogMeta | null => {
    if (!meta) return null;

    const collect = (excludeKey: string, extract: (r: CatalogRow) => string) => {
      const vals: Set<string> = new Set();
      for (const row of dedupedRows) {
        if (matchesFilters(row, filters, excludeKey)) {
          vals.add(extract(row));
        }
      }
      return uniqueSorted(vals);
    };

    return {
      ecoles: collect('ecole', (r) => r.ecole),
      cursus: collect('cursus', (r) => r.cursus),
      niveaux: collect('niveau', (r) => r.nivCode),
      rythmes: collect('rythme', (r) => r.rythme),
      annees: collect('annee', (r) => r.annee),
      sessions: collect('session', (r) => r.session),
      specs: collect('spec', (r) => r.spec),
      totalRows: meta.totalRows,
    };
  }, [dedupedRows, filters, meta]);

  return { filteredRows, meta: availableOptions, loading, error };
}
