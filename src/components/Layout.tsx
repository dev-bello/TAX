import React, { useState, useEffect } from 'react';
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
  LogOut,
  TrendingUp,
  BookOpen,
  FileCheck,
  Menu,
  X,
  Loader2,
  User,
  CheckCircle2,
  Clock
} from 'lucide-react';
import AIChatAssistant from './AIChatAssistant';
import ProfileModal from './ProfileModal';
import { useToast } from './Toast';
import { useBusinessProfile } from '../hooks/useBusinessProfile';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  setCurrentView: (view: string) => void;
}

export default function Layout({ children, currentView, setCurrentView }: LayoutProps) {
  const { addToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'calculator', label: 'Calculate Taxes', icon: Calculator },
    { id: 'scenario', label: 'Plan Ahead', icon: LineChart },
    { id: 'forecasting', label: 'Forecasting & Insights', icon: TrendingUp },
    { id: 'calendar', label: 'Important Dates', icon: CalendarDays },
    { id: 'compliance', label: 'Compliance', icon: FileCheck },
    { id: 'expenses', label: 'Track Expenses', icon: BrainCircuit },
    { id: 'learning', label: 'Tax Academy', icon: BookOpen },
    { id: 'onboarding', label: 'Business Profile', icon: ShieldCheck },
  ];

  const currentViewLabel = navItems.find(item => item.id === currentView)?.label || 'Overview';
  const { profile } = useBusinessProfile();

  const businessContext = {
    companyRevenue: profile?.annualTurnover ?? 0,
    companySize: profile?.classification ?? 'Unknown',
    sector: profile?.sector ?? 'Unknown',
    currentView: currentViewLabel
  };

  // Listen for custom navigation events
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setCurrentView(customEvent.detail);
        addToast(`Navigated to ${navItems.find(n => n.id === customEvent.detail)?.label || customEvent.detail}`, 'info');
      }
    };
    window.addEventListener('navigateTo', handler);
    return () => window.removeEventListener('navigateTo', handler);
  }, [setCurrentView, addToast, navItems]);

  const handleNavClick = (viewId: string) => {
    setCurrentView(viewId);
    setMobileMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    const query = searchQuery.toLowerCase();
    const matched = navItems.find(item => 
      item.label.toLowerCase().includes(query) || 
      item.id.toLowerCase().includes(query)
    );
    
    if (matched) {
      setCurrentView(matched.id);
      setSearchQuery('');
      setShowSearch(false);
      addToast(`Found: ${matched.label}`, 'success');
    } else {
      addToast(`No results found for "${searchQuery}"`, 'warning');
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    // Clear all app data
    localStorage.clear();
    addToast('Logged out successfully', 'success');
    // Reload to reset all state and return to onboarding
    window.location.reload();
  };

  const notifications = [
    { id: 1, text: 'VAT payment due in 3 days', type: 'urgent', time: '2 hours ago' },
    { id: 2, text: 'Company Tax filing deadline approaching', type: 'warning', time: '5 hours ago' },
    { id: 3, text: '5 new deductions available to claim', type: 'info', time: '1 day ago' },
    { id: 4, text: 'Bank statement successfully parsed', type: 'success', time: '2 days ago' },
  ];

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 fixed h-full bg-surface-container-lowest border-r border-outline-variant/20 flex-col z-20">
        <div className="p-6">
          <h1 className="text-2xl font-extrabold text-primary tracking-tight">Tax FYP</h1>
        </div>
        
        <nav className="flex-1 px-4 mt-6 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
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
          <button onClick={handleLogout} disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50">
            {isLoggingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} className="text-outline" />}
            <span>{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Mobile Drawer */}
      <aside className={`
        fixed inset-y-0 left-0 w-[280px] bg-surface-container-lowest border-r border-outline-variant/20 flex-col z-50 lg:hidden
        transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-primary tracking-tight">Tax FYP</h1>
          <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-3 mt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary-container/10 text-primary font-semibold' 
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
              >
                <Icon size={20} className={isActive ? 'text-primary' : 'text-outline'} />
                <span className="text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-outline-variant/20">
          <button onClick={handleLogout} disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-50">
            {isLoggingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} className="text-outline" />}
            <span className="text-sm">{isLoggingOut ? 'Logging out...' : 'Log Out'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen w-full">
        {/* Topbar */}
        <header className="h-16 lg:h-20 glass-header sticky top-0 z-10 border-b border-outline-variant/15 flex items-center justify-between px-4 lg:px-8">
          <div className="flex items-center gap-3 flex-1">
            <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant">
              <Menu size={20} />
            </button>

            {/* Desktop Search */}
            <form onSubmit={handleSearch} className="relative hidden sm:block flex-1 max-w-md lg:w-96 lg:max-w-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ledgers, scenarios, or help..." 
                className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            <button onClick={() => setShowSearch(!showSearch)} className="sm:hidden p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors">
              <Search size={20} />
            </button>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-outline-variant/15">
                    <h3 className="font-bold text-on-surface">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="p-4 border-b border-outline-variant/10 hover:bg-surface-container-low transition-colors cursor-pointer">
                        <div className="flex items-start gap-3">
                          {n.type === 'urgent' && <div className="w-2 h-2 rounded-full bg-error mt-1.5 shrink-0" />}
                          {n.type === 'warning' && <div className="w-2 h-2 rounded-full bg-tertiary mt-1.5 shrink-0" />}
                          {n.type === 'info' && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                          {n.type === 'success' && <div className="w-2 h-2 rounded-full bg-tertiary mt-1.5 shrink-0" />}
                          <div>
                            <p className="text-sm text-on-surface">{n.text}</p>
                            <p className="text-xs text-on-surface-variant mt-1">{n.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-outline-variant/15">
                    <button onClick={() => setShowNotifications(false)} className="w-full text-center text-sm text-primary font-medium hover:underline">
                      Mark all as read
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <button onClick={() => addToast('Settings panel coming soon!', 'info')}
              className="hidden sm:block p-2 rounded-full hover:bg-surface-container-low text-on-surface-variant transition-colors">
              <Settings size={20} />
            </button>

            {/* Profile */}
            <div className="relative">
              <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm lg:ml-2 hover:bg-primary-container/30 transition-colors">
                {profile?.businessName?.charAt(0).toUpperCase() || 'B'}
              </button>
              
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-outline-variant/15">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold">
                        {profile?.businessName?.charAt(0).toUpperCase() || 'B'}
                      </div>
                      <div>
                        <p className="font-bold text-on-surface">{profile?.businessName || 'Business Account'}</p>
                        <p className="text-xs text-on-surface-variant">{profile ? `${profile.classification} - ${profile.sector.charAt(0).toUpperCase() + profile.sector.slice(1)}` : 'No profile'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { setShowProfile(false); setShowProfileModal(true); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                      <User size={16} /> Profile
                    </button>
                    <button onClick={() => { setShowProfile(false); addToast('Settings coming soon!', 'info'); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors">
                      <Settings size={16} /> Settings
                    </button>
                    <button onClick={() => { setShowProfile(false); setShowLogoutConfirm(true); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-error hover:bg-error-container/10 transition-colors">
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Search Overlay */}
        {showSearch && (
          <div className="sm:hidden fixed inset-x-0 top-16 z-20 bg-surface-container-lowest border-b border-outline-variant/15 p-4 animate-in fade-in slide-in-from-top duration-200">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..." 
                autoFocus
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary"
              />
              <button type="button" onClick={() => setShowSearch(false)} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline">
                <X size={16} />
              </button>
            </form>
          </div>
        )}

        {/* Click outside to close dropdowns */}
        {(showNotifications || showProfile) && (
          <div className="fixed inset-0 z-30" onClick={() => { setShowNotifications(false); setShowProfile(false); }} />
        )}

        {/* Page Content */}
        <div className="p-4 lg:p-8 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* AI Chat Assistant */}
      <AIChatAssistant context={businessContext} />

      {/* Profile Modal */}
      <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-surface-container-lowest rounded-3xl shadow-2xl border border-outline-variant/20 max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-error/10 rounded-xl flex items-center justify-center">
                <LogOut size={20} className="text-error" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">Log Out?</h3>
                <p className="text-sm text-on-surface-variant">This will clear all your data and return you to the start.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl font-semibold text-on-surface-variant border border-outline-variant/30 hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); handleLogout(); }}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 rounded-xl font-semibold bg-error text-white hover:bg-error/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                {isLoggingOut ? 'Logging out...' : 'Log Out'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
