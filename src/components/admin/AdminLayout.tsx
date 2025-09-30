import React from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Shield,
  LogOut,
  ChevronDown,
  User,
  TrendingUp,
  Database,
  PieChart,
  CreditCard,
  FileText,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAdmin } from '../../lib/admin/useAdmin';
import { cn } from '../../lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab?: 'dashboard' | 'users' | 'moderation' | 'analytics' | 'subscriptions' | 'content' | 'advertisements' | 'verification';
  onTabChange?: (tab: 'dashboard' | 'users' | 'moderation' | 'analytics' | 'subscriptions' | 'content' | 'advertisements' | 'verification') => void;
  stats?: any;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, activeTab = 'dashboard', onTabChange, stats }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { adminUser, isAdmin, loading } = useAdmin();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  // Show access denied if not admin
  if (!isAdmin || !adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-8">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Zugriff verweigert</h1>
          <p className="text-gray-600 mb-6">
            Sie haben keine Berechtigung, auf das Admin Dashboard zuzugreifen.
          </p>
          <a 
            href="/"
            className="btn btn-primary"
          >
            Zurück zur Homepage
          </a>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    // Redirect to appropriate user dashboard based on user type
    if (adminUser?.user_type === 'caretaker') {
      window.location.href = '/dashboard-caretaker';
    } else if (adminUser?.user_type === 'owner') {
      window.location.href = '/dashboard-owner';
    } else {
      // Fallback to main dashboard if user type is unknown
      window.location.href = '/dashboard';
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Übersicht', icon: TrendingUp },
    { id: 'users', label: 'Benutzerverwaltung', icon: Database },
    { id: 'moderation', label: 'Content Moderation', icon: Shield, badge: stats?.pending_reports },
    { id: 'analytics', label: 'Analytics', icon: PieChart },
    { id: 'subscriptions', label: 'Subscription Sync', icon: CreditCard },
    { id: 'content', label: 'Blog & News', icon: FileText },
    { id: 'advertisements', label: 'Werbeverwaltung', icon: FileText },
    { id: 'verification', label: 'Verifizierung', icon: Shield },
  ];

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <img src="/Image/Logos/tigube_logo.svg" alt="Tigube Logo" className="h-18 w-auto" />
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange?.(item.id as any);
                    setSidebarOpen(false); // Close sidebar on mobile after selection
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <div className="flex items-center">
                    <Icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="bg-red-500 text-white rounded-full text-xs px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-sm font-medium text-primary-700">
                  {adminUser.first_name?.[0] || adminUser.email[0].toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {adminUser.first_name} {adminUser.last_name}
                </div>
                <div className="text-xs text-gray-500 capitalize truncate">
                  {adminUser.admin_role?.replace('_', ' ')}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full mt-3 flex items-center justify-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Zurück zum Profil
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <img src="/Image/Logos/tigube_logo.svg" alt="Tigube Logo" className="h-18 w-auto" />
              <div className="ml-3 text-lg font-semibold text-gray-900">
                Admin Dashboard
              </div>
            </div>
            <div className="w-10"></div> {/* Spacer for centering */}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout; 