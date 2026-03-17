interface Props {
  value: string | number;
  label: string;
  color?: string;
}

export function KPICard({ value, label, color = 'text-indigo-600' }: Props) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === 'number' ? value.toLocaleString('fr') : value}
      </div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}
