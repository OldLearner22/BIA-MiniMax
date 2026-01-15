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
        <div className={`flex items-center gap-3 p-4 border-b border-[rgba(255,255,255,0.05)] ${sidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="w-10 h-10 rounded-bia-md bg-gradient-to-br from-bia-primary to-bia-secondary flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-lg font-semibold text-bia-text-primary">BIA Tool</h1>
              <p className="text-xs text-bia-text-tertiary">ISO 22301:2019</p>
            </div>
          )}
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
