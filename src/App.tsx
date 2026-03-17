import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { useCatalogStore } from './store/useCatalogStore';
import { Dashboard } from './pages/Dashboard';
import { CatalogExplorer } from './pages/CatalogExplorer';
import { SchoolBrowser } from './pages/SchoolBrowser';
import { ProgramBrowser } from './pages/ProgramBrowser';
import { Comparison } from './pages/Comparison';

function App() {
  const { load, loading, error } = useCatalogStore();

  useEffect(() => {
    load();
  }, [load]);

  return (
    <BrowserRouter>
      <div className="h-screen flex bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="flex-1 min-h-0 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <div className="text-sm text-slate-500">Chargement du catalogue...</div>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-red-500">
                  <div className="font-medium">Erreur de chargement</div>
                  <div className="text-sm mt-1">{error}</div>
                  <div className="text-xs mt-2 text-slate-400">
                    Avez-vous lancé <code className="bg-slate-100 px-1 rounded">npm run prepare-data</code> ?
                  </div>
                </div>
              </div>
            ) : (
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/explorer" element={<CatalogExplorer />} />
                <Route path="/ecoles" element={<SchoolBrowser />} />
                <Route path="/cursus" element={<ProgramBrowser />} />
                <Route path="/comparaison" element={<Comparison />} />
              </Routes>
            )}
          </main>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
