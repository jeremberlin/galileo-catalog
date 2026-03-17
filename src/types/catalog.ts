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

export interface CatalogMeta {
  ecoles: string[];
  cursus: string[];
  niveaux: string[];
  rythmes: string[];
  annees: string[];
  sessions: string[];
  specs: string[];
  totalRows: number;
}

export interface Filters {
  search: string;
  ecole: string;
  cursus: string;
  niveau: string;
  rythme: string;
  annee: string;
  session: string;
  spec: string;
}

export const emptyFilters: Filters = {
  search: '',
  ecole: '',
  cursus: '',
  niveau: '',
  rythme: '',
  annee: '',
  session: '',
  spec: '',
};
