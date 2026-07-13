import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  FiHome, FiBook, FiVideo, FiFileText, FiDollarSign, FiAward,
  FiBarChart2, FiUser, FiLogOut, FiMenu, FiX, FiCpu, FiChevronLeft,
  FiSearch, FiBell, FiChevronDown, FiSettings, FiArrowLeft
} from 'react-icons/fi';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const userMenuRef = useRef(null);
  const { user, logout, isAdmin } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navItems = [
    { to: '/dashboard', icon: FiHome, label: t('nav.dashboard'), end: true },
    { to: '/library', icon: FiBook, label: t('nav.library') },
    { to: '/videos', icon: FiVideo, label: t('nav.videos') },
    { to: '/ai-chat', icon: FiCpu, label: t('nav.aiAssistant') },
    { to: '/exam', icon: FiFileText, label: t('exam.title') },
    { to: '/payment', icon: FiDollarSign, label: t('pricing.title') },
    { to: '/certificates', icon: FiAward, label: t('certificate.title') },
    { to: '/leaderboard', icon: FiBarChart2, label: t('leaderboard.title') },
  ];

  const adminItems = [
    { to: '/admin', icon: FiSettings, label: t('nav.adminPanel'), end: true },
    { to: '/admin/users', icon: FiUser, label: 'Users' },
    { to: '/admin/library', icon: FiBook, label: 'Library' },
    { to: '/admin/videos', icon: FiVideo, label: 'Videos' },
    { to: '/admin/ai-questions', icon: FiCpu, label: 'AI Questions' },
    { to: '/admin/team-members', icon: FiUser, label: 'Team' },
  ];

  const isActive = (path, end) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const sidebarWidth = sidebarCollapsed ? 'w-[72px]' : 'w-64';

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'rgb(var(--bg-page))' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${sidebarWidth}
        flex flex-col
        border-r
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `} style={{
        background: 'rgb(var(--sidebar-bg))',
        borderColor: 'rgb(var(--sidebar-border))',
      }}>
        {/* Sidebar Header */}
        <div className={`flex items-center h-16 px-4 border-b shrink-0`} style={{ borderColor: 'rgb(var(--sidebar-border))' }}>
          <div className={`flex items-center gap-3 min-w-0 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <img src="/logo.png" alt="Logo" className="h-9 w-auto shrink-0" />
            {!sidebarCollapsed && (
              <span className="text-sm font-bold truncate" style={{ color: 'rgb(var(--text-primary))' }}>
                Road Rules
              </span>
            )}
          </div>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`hidden lg:flex p-1.5 rounded-lg transition-colors ml-auto ${sidebarCollapsed ? 'hidden' : ''}`}
            style={{ color: 'rgb(var(--text-tertiary))' }}
            title={sidebarCollapsed ? 'Expand' : 'Collapse'}
          >
            <FiChevronLeft size={16} className={`transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
          <div className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--text-tertiary))' }}>
              Menu
            </p>
          </div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              title={sidebarCollapsed ? item.label : undefined}
              className={({ isActive: active }) => {
                const matched = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
                return `flex items-center gap-3 rounded-lg transition-all duration-150 group relative ${
                  sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                } ${
                  matched
                    ? 'text-primary-600 dark:text-primary-400 font-medium'
                    : 'hover:bg-gray-100 dark:hover:bg-white/5'
                }`;
              }}
              style={({ isActive: active }) => {
                const matched = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
                return matched ? {
                  background: 'rgb(var(--sidebar-active))',
                  color: undefined,
                } : {
                  color: 'rgb(var(--text-secondary))',
                };
              }}
            >
              {({ isActive: active }) => {
                const matched = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
                return (
                  <>
                    {matched && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary-500" />
                    )}
                    <item.icon size={19} className="shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="text-sm truncate">{item.label}</span>
                    )}
                  </>
                );
              }}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              <div className={`my-2 border-t`} style={{ borderColor: 'rgb(var(--border))' }} />
              <div className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
                <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgb(var(--text-tertiary))' }}>
                  Admin
                </p>
              </div>
              {adminItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={({ isActive: active }) => {
                    const matched = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
                    return `flex items-center gap-3 rounded-lg transition-all duration-150 relative ${
                      sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
                    } ${
                      matched
                        ? 'text-purple-600 dark:text-purple-400 font-medium'
                        : 'hover:bg-gray-100 dark:hover:bg-white/5'
                    }`;
                  }}
                  style={({ isActive: active }) => {
                    const matched = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
                    return matched ? {
                      background: 'rgb(147 51 234 / 0.08)',
                    } : {
                      color: 'rgb(var(--text-secondary))',
                    };
                  }}
                >
                  {({ isActive: active }) => {
                    const matched = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
                    return (
                      <>
                        {matched && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-purple-500" />
                        )}
                        <item.icon size={19} className="shrink-0" />
                        {!sidebarCollapsed && (
                          <span className="text-sm truncate">{item.label}</span>
                        )}
                      </>
                    );
                  }}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Sidebar Footer */}
        <div className={`border-t py-3 px-2.5 space-y-1 shrink-0`} style={{ borderColor: 'rgb(var(--sidebar-border))' }}>
          <NavLink
            to="/"
            title={sidebarCollapsed ? 'Back to Home' : undefined}
            className={`flex items-center gap-3 rounded-lg transition-colors duration-150 ${
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
            }`}
            style={{ color: 'rgb(var(--text-secondary))' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(var(--text-primary))'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(var(--text-secondary))'}
          >
            <FiArrowLeft size={19} className="shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">Back to Home</span>}
          </NavLink>
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? t('nav.logout') : undefined}
            className={`flex items-center gap-3 rounded-lg transition-colors duration-150 w-full text-danger-500 hover:bg-red-50 dark:hover:bg-red-900/10 ${
              sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
            }`}
          >
            <FiLogOut size={19} className="shrink-0" />
            {!sidebarCollapsed && <span className="text-sm">{t('nav.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 shrink-0 flex items-center gap-4 px-4 lg:px-6 border-b backdrop-blur-md z-30" style={{
          background: 'rgb(var(--surface) / 0.85)',
          borderColor: 'rgb(var(--border))',
        }}>
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg transition-colors"
            style={{ color: 'rgb(var(--text-secondary))' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(var(--sidebar-hover))'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <FiMenu size={20} />
          </button>

          {/* Search */}
          <div className={`hidden sm:flex items-center flex-1 max-w-md transition-all duration-200 ${searchFocused ? 'max-w-lg' : ''}`}>
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2" size={16} style={{ color: 'rgb(var(--text-tertiary))' }} />
              <input
                type="text"
                placeholder="Search..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-9 pr-4 py-2 rounded-lg border text-sm outline-none transition-all duration-200"
                style={{
                  background: 'rgb(var(--surface-elevated))',
                  borderColor: searchFocused ? 'rgb(var(--input-focus))' : 'rgb(var(--border))',
                  color: 'rgb(var(--text-primary))',
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            <ThemeToggle />

            {/* Notifications */}
            <button className="relative p-2.5 rounded-lg transition-colors" style={{ color: 'rgb(var(--text-secondary))' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(var(--sidebar-hover))'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <FiBell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg transition-colors"
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(var(--sidebar-hover))'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {user?.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left min-w-0">
                  <p className="text-sm font-medium truncate leading-tight" style={{ color: 'rgb(var(--text-primary))' }}>
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-[11px] capitalize leading-tight" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    {user?.role || 'user'}
                  </p>
                </div>
                <FiChevronDown size={14} className={`hidden md:block transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} style={{ color: 'rgb(var(--text-tertiary))' }} />
              </button>

              {/* Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border shadow-elevated py-1.5 animate-scale-in z-50" style={{
                  background: 'rgb(var(--card-bg))',
                  borderColor: 'rgb(var(--card-border))',
                }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
                    <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{user?.full_name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgb(var(--text-tertiary))' }}>{user?.email}</p>
                  </div>
                  <NavLink to="/profile" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: 'rgb(var(--text-secondary))' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(var(--sidebar-hover))'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiUser size={16} /> Profile
                  </NavLink>
                  <NavLink to="/dashboard" onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                    style={{ color: 'rgb(var(--text-secondary))' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgb(var(--sidebar-hover))'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <FiHome size={16} /> Dashboard
                  </NavLink>
                  <div className="my-1 border-t" style={{ borderColor: 'rgb(var(--border))' }} />
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm w-full text-left text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                  >
                    <FiLogOut size={16} /> {t('nav.logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
