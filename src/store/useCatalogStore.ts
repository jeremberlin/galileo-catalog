import { create } from 'zustand';
import { type CatalogRow, type CatalogMeta } from '../types/catalog';

interface CatalogState {
  allRows: CatalogRow[];
  dedupedRows: CatalogRow[];
  meta: CatalogMeta | null;
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  allRows: [],
  dedupedRows: [],
  meta: null,
  loading: false,
  error: null,
  load: async () => {
    if (get().allRows.length > 0) return;
    set({ loading: true, error: null });
    try {
      const [dedupRes, metaRes] = await Promise.all([
        fetch(`${import.meta.env.BASE_URL}data/catalog-deduped.json`),
        fetch(`${import.meta.env.BASE_URL}data/meta.json`),
      ]);
      const dedupedRows: CatalogRow[] = await dedupRes.json();
      const meta: CatalogMeta = await metaRes.json();
      set({ dedupedRows, meta, loading: false });
    } catch (e) {
      set({ error: String(e), loading: false });
    }
  },
}));
