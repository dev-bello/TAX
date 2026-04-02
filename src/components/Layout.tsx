import React from 'react';
import { 
  LayoutDashboard, 
  Calculator, 
  LineChart, 
  CalendarDays, 
  BrainCircuit, 
  ShieldCheck,
  Search,
  Bell,
  Settings,
  LogOut
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Layout({ children, currentView, setCurrentView }: LayoutProps) {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'calculator', label: 'Calculate Taxes', icon: Calculator },
    { id: 'scenario', label: 'Plan Ahead', icon: LineChart },
    { id: 'calendar', label: 'Important Dates', icon: CalendarDays },
    { id: 'expenses', label: 'Track Expenses', icon: BrainCircuit },
    { id: 'onboarding', label: 'Business Profile', icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside className="w-64 fixed h-full bg-surface-container-lowest border-r border-outline-variant/20 flex flex-col z-20">
        <div className="p-6">
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Sovereign.</h1>
        </div>
        
        <nav className="flex-1 px-4 mt-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-container/10 text-primary font-semibold' 
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : 'text-outline'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-outline-variant/20">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-colors">
            <LogOut size={20} className="text-outline" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="h-20 glass-header sticky top-0 z-10 border-b border-outline-variant/15 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={20} />
              <input 
                type="text" 
                placeholder="Search ledgers, scenarios, or help..." 
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
            </button>
            <button className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors">
              <Settings size={20} />
            </button>
            <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold ml-2">
              OA
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
