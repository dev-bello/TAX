import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAppShortcuts } from '../hooks/useKeyboardShortcuts';
import {
  LayoutDashboard,
  Calculator,
  LineChart,
  CalendarDays,
  BrainCircuit,
  Search,
  Bell,
  LogOut,
  TrendingUp,
  BookOpen,
  FileCheck,
  Menu,
  X,
  Loader2,
  User,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Building2
} from 'lucide-react';
import AIChatAssistant from './AIChatAssistant';
import { useToast } from './Toast';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessProfile } from '../hooks/useBusinessProfile';

interface LayoutProps {
  children: React.ReactNode;
}

const pathToId = (path: string): string => {
  if (path === '/') return 'dashboard';
  return path.replace(/^\//, '');
};

const idToPath = (id: string): string => {
  if (id === 'dashboard') return '/';
  return `/${id}`;
};

export default function Layout({ children }: LayoutProps) {
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const currentView = pathToId(location.pathname);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
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
  ];

  const currentViewLabel = navItems.find(item => item.id === currentView)?.label || 'Overview';
  const { user, logout } = useAuth();
  const { profile } = useBusinessProfile(user?.id);

  const businessContext = {
    companyRevenue: profile?.annualTurnover ?? 0,
    companySize: profile?.classification ?? 'Unknown',
    sector: profile?.sector ?? 'Unknown',
    currentView: currentViewLabel
  };

  // Keyboard shortcuts
  useAppShortcuts();

  const handleNavClick = (viewId: string) => {
    navigate(idToPath(viewId));
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
      navigate(idToPath(matched.id));
      setSearchQuery('');
      setShowSearch(false);
      addToast(`Found: ${matched.label}`, 'success');
    } else {
      addToast(`No results found for "${searchQuery}"`, 'warning');
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      addToast('Logged out successfully', 'success');
      setTimeout(() => {
        logout();
      }, 800);
    } catch (error) {
      console.error('Logout failed:', error);
      addToast('Logout failed. Please try again.', 'error');
      setIsLoggingOut(false);
    }
  };

  // Calculate real notifications from profile
  const notifications = useMemo(() => {
    const now = new Date();
    const items: Array<{ id: number; text: string; type: 'urgent' | 'warning' | 'info' | 'success'; time: string }> = [];
    
    if (profile?.vatRegistered) {
      const vatDeadline = new Date(now.getFullYear(), now.getMonth() + 1, 21);
      if (now.getDate() > 21) vatDeadline.setMonth(vatDeadline.getMonth() + 1);
      const daysLeft = Math.ceil((vatDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysLeft <= 7) {
        items.push({ id: 1, text: `VAT payment due in ${daysLeft} days`, type: 'urgent', time: 'Just now' });
      } else if (daysLeft <= 14) {
        items.push({ id: 1, text: `VAT payment due in ${daysLeft} days`, type: 'warning', time: 'Just now' });
      }
    }
    
    const citDeadline = new Date(now.getFullYear(), 2, 31);
    if (now > citDeadline) citDeadline.setFullYear(citDeadline.getFullYear() + 1);
    const citDaysLeft = Math.ceil((citDeadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (citDaysLeft <= 30) {
      items.push({ id: 2, text: `Company Tax filing deadline in ${citDaysLeft} days`, type: citDaysLeft <= 7 ? 'urgent' : 'warning', time: 'Just now' });
    }
    
    if (items.length === 0) {
      items.push({ id: 3, text: 'All tax filings are up to date', type: 'success', time: 'Just now' });
    }
    
    return items;
  }, [profile]);

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:flex fixed h-full bg-surface-container-lowest border-r border-outline-variant/20 flex-col z-20 transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`flex items-center ${sidebarCollapsed ? 'justify-center p-4' : 'justify-between p-6'}`}>
          {!sidebarCollapsed && (
            <h1 className="text-2xl font-extrabold text-primary tracking-tight">Tax FYP</h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 rounded-lg hover:bg-surface-container-low text-on-surface-variant transition-colors"
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className={`flex-1 mt-6 space-y-2 ${sidebarCollapsed ? 'px-2' : 'px-4'}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center rounded-xl transition-all duration-200 ${
                  sidebarCollapsed 
                    ? 'justify-center px-2 py-3' 
                    : 'gap-3 px-4 py-3'
                } ${
                  isActive
                    ? 'bg-primary-container/10 text-primary font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon size={20} className={isActive ? 'text-primary' : 'text-outline'} />
                {!sidebarCollapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Mini Profile Card - Bottom of Sidebar */}
        {!sidebarCollapsed && profile && (
          <div className="p-4 mx-4 mb-4 bg-surface-container-low rounded-2xl border border-outline-variant/15">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                {profile.businessName?.charAt(0).toUpperCase() || 'B'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-on-surface truncate">{profile.businessName}</p>
                <p className="text-xs text-on-surface-variant">{profile.classification}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Tax Rate</span>
                <span className="font-semibold text-primary">{profile.taxRate}%</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-on-surface-variant">Turnover</span>
                <span className="font-semibold text-on-surface">
                  ₦{(profile.annualTurnover / 1_000_000).toFixed(1)}M
                </span>
              </div>
              <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min((profile.annualTurnover / 100_000_000) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Collapsed version - just icon */}
        {sidebarCollapsed && profile && (
          <div className="p-2 mb-4 flex justify-center">
            <div className="w-10 h-10 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold" title={profile.businessName}>
              {profile.businessName?.charAt(0).toUpperCase() || 'B'}
            </div>
          </div>
        )}
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
      </aside>

      {/* Main Content */}
      <main className={`flex-1 flex flex-col min-h-screen w-full transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
      }`}>
        {/* Topbar */}
        <header className="h-16 lg:h-20 glass-header sticky top-0 z-40 border-b border-outline-variant/15 flex items-center justify-between px-4 lg:px-8">
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
              <button onClick={() => { setShowNotifications(!showNotifications); }}
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

            {/* Profile Avatar Dropdown */}
            <div className="relative">
              <button
                onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}
                className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-primary-container/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-sm hover:bg-primary-container/30 transition-colors"
                aria-label="Open profile menu"
              >
                {profile?.businessName?.charAt(0).toUpperCase() || 'B'}
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="p-3 border-b border-outline-variant/15">
                    <p className="font-bold text-on-surface text-sm truncate">{profile?.businessName || 'Business Account'}</p>
                    <p className="text-xs text-on-surface-variant truncate">{profile ? `${profile.classification}` : 'No profile'}</p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      to="/profile"
                      onClick={() => setShowProfileMenu(false)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors"
                    >
                      <User size={16} /> View Profile
                    </Link>
                    <button
                      onClick={() => { setShowProfileMenu(false); setShowLogoutConfirm(true); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-error hover:bg-error-container/10 transition-colors"
                    >
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
        {(showNotifications || showProfileMenu) && (
          <div className="fixed inset-0 z-30" onClick={() => { setShowNotifications(false); setShowProfileMenu(false); }} />
        )}

        {/* Page Content */}
        <div className="p-4 lg:p-8 flex-1 overflow-x-hidden">
          {children}
        </div>
      </main>

      {/* AI Chat Assistant */}
      <AIChatAssistant context={businessContext} />

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
