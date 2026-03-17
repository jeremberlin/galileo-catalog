const styles: Record<string, string> = {
  Alternance: 'bg-blue-100 text-blue-800',
  Classique: 'bg-emerald-100 text-emerald-800',
  Apprentissage: 'bg-amber-100 text-amber-800',
  'Formation continue': 'bg-violet-100 text-violet-800',
  'Classique option Alternance': 'bg-pink-100 text-pink-800',
};

export function RythmeBadge({ value }: { value: string }) {
  const cls = styles[value] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${cls}`}>
      {value}
    </span>
  );
}
