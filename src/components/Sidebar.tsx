import { useStore } from '../store/useStore';
import { LayoutDashboard, Database, Clock, FileText, ChevronLeft, ChevronRight, Shield, TrendingUp, GitBranch, Settings, Network } from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'processes', label: 'Process Registry', icon: Database },
  { id: 'temporal', label: 'Business Impact Analysis', icon: TrendingUp },
  { id: 'process-deps', label: 'Process Dependencies', icon: Network },
  { id: 'dependencies', label: 'Dependencies', icon: GitBranch },
  { id: 'recovery', label: 'Recovery Objectives', icon: Clock },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { currentView, setCurrentView, sidebarCollapsed, toggleSidebar } = useStore();

  return (
    <aside className={`fixed left-0 top-0 h-screen glass-sidebar z-50 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className={`flex items-center gap-3 p-4 border-b border-white/5 ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="flex-shrink-0 w-10 h-10 rounded-bia-md bg-gradient-to-br from-bia-primary to-bia-secondary flex items-center justify-center shadow-lg shadow-bia-primary/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div className={`transition-all duration-300 overflow-hidden ${sidebarCollapsed ? 'w-0 opacity-0' : 'w-40 opacity-100'}`}>
            <h1 className="text-lg font-bold text-bia-text-primary tracking-tight whitespace-nowrap">BIA MiniMax</h1>
            <p className="text-[10px] text-bia-text-tertiary font-bold uppercase tracking-widest whitespace-nowrap">Enterprise GRC</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`nav-item w-full ${currentView === item.id ? 'nav-item-active' : ''} ${sidebarCollapsed ? 'justify-center px-2' : ''}`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="p-3 border-t border-[rgba(255,255,255,0.05)] text-bia-text-secondary hover:text-bia-text-primary transition-colors flex items-center justify-center"
        >
          {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
