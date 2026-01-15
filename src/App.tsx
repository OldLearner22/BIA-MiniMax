import { useStore } from './store/useStore';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ProcessRegistry } from './components/ProcessRegistry';

import { RecoveryObjectives } from './components/RecoveryObjectives';
import { Reports } from './components/Reports';
import { TemporalAnalysis } from './components/TemporalAnalysis';
import { Dependencies } from './components/Dependencies';
import { ProcessDependencies } from './components/ProcessDependencies';
import { Settings } from './components/Settings';
import { GlossaryModal } from './components/GlossaryModal';

function App() {
  const { currentView, sidebarCollapsed } = useStore();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'processes': return <ProcessRegistry />;

      case 'temporal': return <TemporalAnalysis />;
      case 'process-deps': return <ProcessDependencies />;
      case 'dependencies': return <Dependencies />;
      case 'recovery': return <RecoveryObjectives />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-bia-bg-start to-bia-bg-end">
      <Sidebar />
      <main className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} p-8`}>
        {renderView()}
      </main>
      <GlossaryModal />
    </div>
  );
}

export default App;
