import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdvancedUserManagementPanel from '../../components/admin/AdvancedUserManagementPanel';
import ContentModerationPanel from '../../components/admin/ContentModerationPanel';
import AnalyticsPanel from '../../components/admin/AnalyticsPanel';
import SubscriptionSyncPanel from '../../components/admin/SubscriptionSyncPanel';
import { EnhancedAdminService, AdminDashboardStats } from '../../lib/admin/enhancedAdminService';
import { Users, DollarSign, MessageCircle, CreditCard, TrendingUp, Calendar, Database, PieChart, Shield, AlertTriangle } from 'lucide-react';
import StripeStatusIndicator from '../../components/ui/StripeStatusIndicator';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../lib/auth/AuthContext';

const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'moderation' | 'analytics' | 'subscriptions'>('dashboard');
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardStats();
    loadCurrentAdmin();
  }, []);

  const loadCurrentAdmin = async () => {
    try {
      const admin = await EnhancedAdminService.getCurrentAdmin();
      if (admin) {
        setCurrentAdminId(admin.id);
        // Update last login timestamp
        await EnhancedAdminService.updateLastLogin();
      }
    } catch (err) {
      console.error('Error loading current admin:', err);
    }
  };

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await EnhancedAdminService.getAdminDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError('Fehler beim Laden der Dashboard-Statistiken');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Lade Dashboard-Daten...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <h3 className="text-lg font-medium text-red-800 mb-2">Fehler</h3>
            <p className="text-red-600">{error}</p>
            <button 
              onClick={loadDashboardStats}
              className="mt-4 btn btn-outline"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
              <p className="text-gray-600">
                Willkommen im tigube Admin-Bereich. Hier finden Sie einen Überblick über die wichtigsten Platform-Metriken.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={loadDashboardStats}
                className="btn btn-outline btn-sm"
                disabled={loading}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Aktualisieren
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Übersicht
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Benutzerverwaltung
              </div>
            </button>
            <button
              onClick={() => setActiveTab('moderation')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'moderation'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Content Moderation
                {stats && stats.pending_reports > 0 && (
                  <span className="bg-red-500 text-white rounded-full text-xs px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                    {stats.pending_reports}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                Analytics
              </div>
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subscriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Subscription Sync
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Gesamt Nutzer</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(stats.total_users)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex text-sm text-gray-600">
                      <span>{formatNumber(stats.total_owners)} Besitzer</span>
                      <span className="mx-2">•</span>
                      <span>{formatNumber(stats.total_caretakers)} Betreuer</span>
                    </div>
                    <div className="text-sm text-green-600 mt-1">
                      +{formatNumber(stats.new_users_today)} heute
                    </div>
                  </div>
                </div>

                {/* Revenue */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <DollarSign className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Gesamt Umsatz</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatCurrency(stats.total_revenue)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      {formatCurrency(stats.revenue_this_month)} diesen Monat
                    </p>
                  </div>
                </div>

                {/* Active Subscriptions */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <CreditCard className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Aktive Abos</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(stats.active_subscriptions)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      Premium Subscriptions
                    </p>
                  </div>
                </div>

                {/* Pending Reports */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <AlertTriangle className={`h-8 w-8 ${stats.pending_reports > 0 ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Ausstehende Meldungen</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(stats.pending_reports)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">
                      {formatNumber(stats.reports_today)} heute gemeldet
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Overview */}
            {stats && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Activity */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Nutzer-Aktivität</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Aktiv heute</span>
                      <span className="font-medium">{formatNumber(stats.active_users_today)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Aktiv diese Woche</span>
                      <span className="font-medium">{formatNumber(stats.active_users_this_week)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Neue diese Woche</span>
                      <span className="font-medium">{formatNumber(stats.new_users_this_week)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gesperrte Nutzer</span>
                      <span className="font-medium text-red-600">{formatNumber(stats.suspended_users)}</span>
                    </div>
                  </div>
                </div>

                {/* Communication Stats */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Kommunikation</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gespräche heute</span>
                      <span className="font-medium">{formatNumber(stats.conversations_today)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Nachrichten heute</span>
                      <span className="font-medium">{formatNumber(stats.messages_today)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gesamt Gespräche</span>
                      <span className="font-medium">{formatNumber(stats.total_conversations)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Gesamt Nachrichten</span>
                      <span className="font-medium">{formatNumber(stats.total_messages)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && currentAdminId && (
          <AdvancedUserManagementPanel currentAdminId={currentAdminId} />
        )}

        {activeTab === 'moderation' && currentAdminId && (
          <ContentModerationPanel currentAdminId={currentAdminId} />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsPanel />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionSyncPanel />
        )}

        {/* System Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stripe Status */}
            <StripeStatusIndicator />
            
            {/* Database Status */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Database Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection:</span>
                  <span className="font-medium text-green-600">✅ Connected</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-medium text-gray-900">Production</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Sync Debug */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Subscription Sync Debug</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">🔧 Debug Tools</h4>
            <p className="text-sm text-yellow-700 mb-3">
              Diese Tools helfen dabei, Sync-Probleme zwischen Stripe und Supabase zu diagnostizieren.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => testSyncFunction()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
              >
                Test Sync Function
              </button>
              <button
                onClick={() => checkSubscriptionStatus()}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm ml-2"
              >
                Check Subscription Status
              </button>
              <button
                onClick={() => testUserFeatureUpdate()}
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm ml-2"
              >
                Test User Feature Update
              </button>
            </div>
          </div>
          
          <div id="sync-debug-output" className="mt-4 p-3 bg-gray-100 rounded font-mono text-sm max-h-64 overflow-y-auto">
            Debug output wird hier angezeigt...
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;

// Add these debug functions
const testSyncFunction = async () => {
  const output = document.getElementById('sync-debug-output');
  if (!output) return;
  
  output.innerHTML = '🚀 Testing sync function...\n';
  
  try {
    // Test with a dummy session ID
    const testSessionId = 'cs_test_debug_12345';
    
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        checkout_session_id: testSessionId
      })
    });

    const result = await response.json();
    output.innerHTML += `📋 Response Status: ${response.status}\n`;
    output.innerHTML += `📋 Response Body: ${JSON.stringify(result, null, 2)}\n`;
    
    if (response.ok) {
      output.innerHTML += '✅ Function is accessible and responding\n';
    } else {
      output.innerHTML += '❌ Function returned error\n';
    }
    
  } catch (error) {
    output.innerHTML += `❌ Error: ${error.message}\n`;
  }
};

const checkSubscriptionStatus = async () => {
  const output = document.getElementById('sync-debug-output');
  if (!output) return;
  
  output.innerHTML = '🔍 Checking recent subscriptions...\n';
  
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('id, user_id, plan_type, status, stripe_checkout_session_id, created_at')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      output.innerHTML += `❌ Database Error: ${error.message}\n`;
      return;
    }

    output.innerHTML += `📊 Recent Subscriptions (${data?.length || 0}):\n`;
    data?.forEach((sub, index) => {
      output.innerHTML += `${index + 1}. ${sub.plan_type} - ${sub.status} - ${sub.created_at}\n`;
      output.innerHTML += `   User: ${sub.user_id}\n`;
      output.innerHTML += `   Session: ${sub.stripe_checkout_session_id}\n\n`;
    });

  } catch (error) {
    output.innerHTML += `❌ Error: ${error.message}\n`;
  }
};

const testUserFeatureUpdate = async () => {
  const output = document.getElementById('sync-debug-output');
  if (!output) return;
  
  output.innerHTML = '🔄 Testing user feature update function...\n';
  
  try {
    // Get current user ID
    const currentUserId = user?.id;
    if (!currentUserId) {
      output.innerHTML += '❌ No current user ID available\n';
      return;
    }

    output.innerHTML += `👤 Testing with current user: ${currentUserId}\n`;

    // Call the update function
    const { data, error } = await supabase.rpc('update_user_premium_features', {
      p_user_id: currentUserId
    });

    if (error) {
      output.innerHTML += `❌ Function Error: ${error.message}\n`;
    } else {
      output.innerHTML += `✅ Function executed successfully\n`;
      output.innerHTML += `📋 Result: ${JSON.stringify(data, null, 2)}\n`;
    }

  } catch (error) {
    output.innerHTML += `❌ Error: ${error.message}\n`;
  }
}; 