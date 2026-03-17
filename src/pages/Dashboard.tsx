import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useCatalogStore } from '../store/useCatalogStore';
import { KPICard } from '../components/dashboard/KPICard';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

export function Dashboard() {
  const { dedupedRows, meta } = useCatalogStore();

  const stats = useMemo(() => {
    if (!dedupedRows.length) return null;

    // Programs per school (top 15)
    const schoolMap = new Map<string, Set<string>>();
    for (const r of dedupedRows) {
      if (!schoolMap.has(r.ecole)) schoolMap.set(r.ecole, new Set());
      schoolMap.get(r.ecole)!.add(r.cursus);
    }
    const programsBySchool = [...schoolMap.entries()]
      .map(([name, cursus]) => ({ name: name.length > 25 ? name.slice(0, 25) + '...' : name, count: cursus.size }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Rythme distribution
    const rythmeMap = new Map<string, number>();
    for (const r of dedupedRows) {
      rythmeMap.set(r.rythme, (rythmeMap.get(r.rythme) || 0) + 1);
    }
    const rythmeData = [...rythmeMap.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Sessions by month
    const monthOrder = ['JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE'];
    const monthMap = new Map<string, number>();
    for (const r of dedupedRows) {
      monthMap.set(r.session, (monthMap.get(r.session) || 0) + 1);
    }
    const sessionsByMonth = monthOrder
      .filter(m => monthMap.has(m))
      .map(m => ({ name: m.slice(0, 3), fullName: m, count: monthMap.get(m)! }));
    // Add non-standard sessions
    for (const [k, v] of monthMap) {
      if (!monthOrder.includes(k)) {
        sessionsByMonth.push({ name: k.slice(0, 5), fullName: k, count: v });
      }
    }

    // Unique cursus count
    const uniqueCursus = new Set(dedupedRows.map(r => r.cursus)).size;
    const uniqueEcoles = new Set(dedupedRows.map(r => r.ecole)).size;
    const uniqueSessions = new Set(dedupedRows.map(r => r.sessUuid)).size;
    const withSpec = dedupedRows.filter(r => r.spec).length;
    const specPct = Math.round((withSpec / dedupedRows.length) * 100);

    return { programsBySchool, rythmeData, sessionsByMonth, uniqueCursus, uniqueEcoles, uniqueSessions, specPct };
  }, [dedupedRows]);

  if (!stats || !meta) {
    return <div className="p-6 text-slate-400">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6 overflow-auto">
      <h2 className="text-xl font-bold text-slate-800">Dashboard</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard value={stats.uniqueEcoles} label="Écoles" />
        <KPICard value={stats.uniqueCursus} label="Cursus pédagogiques" color="text-emerald-600" />
        <KPICard value={stats.uniqueSessions} label="Sessions effectives" color="text-amber-600" />
        <KPICard value={`${stats.specPct}%`} label="Avec spécialisation" color="text-violet-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programs per school */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Programmes par école (top 15)</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stats.programsBySchool} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={160} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rythme distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Répartition par rythme</h3>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={stats.rythmeData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={140}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {stats.rythmeData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions by month */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Sessions par mois de rentrée</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.sessionsByMonth}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''} />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
