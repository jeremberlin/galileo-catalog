import { create } from 'zustand';
import { type Filters, emptyFilters } from '../types/catalog';

interface FilterState {
  filters: Filters;
  showDeduped: boolean;
  setFilter: (key: keyof Filters, value: string) => void;
  setFilters: (filters: Partial<Filters>) => void;
  clearFilters: () => void;
  toggleDedup: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  filters: emptyFilters,
  showDeduped: true,
  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value } })),
  setFilters: (partial) =>
    set((state) => ({ filters: { ...state.filters, ...partial } })),
  clearFilters: () => set({ filters: emptyFilters }),
  toggleDedup: () => set((state) => ({ showDeduped: !state.showDeduped })),
}));
