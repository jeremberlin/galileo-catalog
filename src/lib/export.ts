import type { CatalogRow } from '../types/catalog';

const COLUMNS: { key: keyof CatalogRow; label: string }[] = [
  { key: 'ecole', label: 'École' },
  { key: 'cpCode', label: 'Code cursus' },
  { key: 'cursus', label: 'Cursus pédagogique' },
  { key: 'nivCode', label: 'Code niveau' },
  { key: 'niveau', label: 'Niveau pédagogique' },
  { key: 'spec', label: 'Spécialisation' },
  { key: 'rythme', label: 'Rythme' },
  { key: 'annee', label: 'Année académique' },
  { key: 'session', label: 'Session' },
  { key: 'sessEff', label: 'Session effective' },
  { key: 'ccCode', label: 'Code commercial' },
  { key: 'cursCom', label: 'Cursus commercial' },
  { key: 'nivCom', label: 'Niveau commercial' },
  { key: 'uc', label: 'Unité commerciale' },
];

export function exportToCSV(rows: CatalogRow[], filename = 'catalogue_galileo_export.csv') {
  const header = COLUMNS.map(c => c.label).join(';');
  const lines = rows.map(r =>
    COLUMNS.map(c => `"${(r[c.key] || '').replace(/"/g, '""')}"`).join(';')
  );
  const blob = new Blob(['\uFEFF' + header + '\n' + lines.join('\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
