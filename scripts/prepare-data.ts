import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_PATH = path.resolve(__dirname, '../../20260213 extraction bossnova - 2025-2026 & 2026-2027.csv');
const OUT_DIR = path.resolve(__dirname, '../public/data');

interface RawRow {
  upp_uuid: string;
  upp_code: string;
  upp_label: string;
  session_year: string;
  cursus_pedagogique_uuid: string;
  cursus_pedagogique_code: string;
  cursus_pedagogique: string;
  niv_pedagogique_uuid: string;
  niv_pedagogique_code: string;
  niv_pedagogique: string;
  specialisation_pedagogique_uuid: string;
  specialisation_pedagogique_code: string;
  specialisation_pedagogique: string;
  session_effective_uuid: string;
  session_effective: string;
  annee_academique_session_effective: string;
  rythme_session_effective: string;
  uc_label: string;
  cursus_commercial_uuid: string;
  cursus_commercial_code: string;
  cursus_commercial: string;
  niv_commercial_uuid: string;
  niv_commercial: string;
  session_commercial_uuid: string;
  session_catalogue: string;
  session_catalogue_uuid: string;
  annee_debut_niveau: string;
  annee_fin_niveau: string;
}

export interface CatalogRow {
  ecole: string;
  ecoleCode: string;
  cpCode: string;
  cursus: string;
  nivCode: string;
  niveau: string;
  spec: string;
  rythme: string;
  annee: string;
  session: string;
  sessEff: string;
  sessUuid: string;
  ccCode: string;
  cursCom: string;
  nivCom: string;
  uc: string;
  anneeDebut: string;
}

function trim(s: string | undefined): string {
  return (s || '').trim();
}

function transform(raw: RawRow): CatalogRow {
  return {
    ecole: trim(raw.upp_label),
    ecoleCode: trim(raw.upp_code),
    cpCode: trim(raw.cursus_pedagogique_code),
    cursus: trim(raw.cursus_pedagogique),
    nivCode: trim(raw.niv_pedagogique_code),
    niveau: trim(raw.niv_pedagogique),
    spec: trim(raw.specialisation_pedagogique),
    rythme: trim(raw.rythme_session_effective),
    annee: trim(raw.annee_academique_session_effective),
    session: trim(raw.session_catalogue),
    sessEff: trim(raw.session_effective),
    sessUuid: trim(raw.session_effective_uuid),
    ccCode: trim(raw.cursus_commercial_code),
    cursCom: trim(raw.cursus_commercial),
    nivCom: trim(raw.niv_commercial),
    uc: trim(raw.uc_label),
    anneeDebut: trim(raw.annee_debut_niveau),
  };
}

function deduplicate(rows: CatalogRow[]): CatalogRow[] {
  const groups = new Map<string, CatalogRow[]>();
  for (const row of rows) {
    const key = row.sessUuid;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }
  const result: CatalogRow[] = [];
  for (const [, group] of groups) {
    if (group.length === 1) {
      result.push(group[0]);
    } else {
      const own = group.find(r => r.uc === r.ecole);
      result.push(own || group[0]);
    }
  }
  return result;
}

function buildMeta(rows: CatalogRow[]) {
  const unique = (key: keyof CatalogRow) => {
    const set = new Set<string>();
    for (const r of rows) {
      const v = r[key];
      if (v) set.add(v);
    }
    return [...set].sort((a, b) => a.localeCompare(b, 'fr'));
  };

  return {
    ecoles: unique('ecole'),
    cursus: unique('cursus'),
    niveaux: unique('nivCode'),
    rythmes: unique('rythme'),
    annees: unique('annee'),
    sessions: unique('session'),
    specs: unique('spec'),
    totalRows: rows.length,
  };
}

// Main
console.log('Reading CSV...');
const csvText = fs.readFileSync(CSV_PATH, 'utf-8');

console.log('Parsing...');
const parsed = Papa.parse<RawRow>(csvText, {
  header: true,
  delimiter: ';',
  skipEmptyLines: true,
});

console.log(`Parsed ${parsed.data.length} rows (${parsed.errors.length} errors)`);

const allRows = parsed.data.map(transform);
const dedupedRows = deduplicate(allRows);

console.log(`After dedup: ${dedupedRows.length} rows (removed ${allRows.length - dedupedRows.length} duplicates)`);

// Ensure output dir
fs.mkdirSync(OUT_DIR, { recursive: true });

// Write full catalog (with commercial data)
const catalogPath = path.join(OUT_DIR, 'catalog.json');
fs.writeFileSync(catalogPath, JSON.stringify(allRows));
const catSize = fs.statSync(catalogPath).size;
console.log(`catalog.json: ${(catSize / 1024).toFixed(0)} KB`);

// Write deduped catalog
const dedupPath = path.join(OUT_DIR, 'catalog-deduped.json');
fs.writeFileSync(dedupPath, JSON.stringify(dedupedRows));
const dedupSize = fs.statSync(dedupPath).size;
console.log(`catalog-deduped.json: ${(dedupSize / 1024).toFixed(0)} KB`);

// Write meta
const meta = buildMeta(dedupedRows);
const metaPath = path.join(OUT_DIR, 'meta.json');
fs.writeFileSync(metaPath, JSON.stringify(meta));
console.log(`meta.json: ${JSON.stringify(meta).length} bytes`);

console.log('\nDone!');
console.log(`  Ecoles: ${meta.ecoles.length}`);
console.log(`  Cursus: ${meta.cursus.length}`);
console.log(`  Rythmes: ${meta.rythmes.join(', ')}`);
console.log(`  Annees: ${meta.annees.join(', ')}`);
