import { useState, useEffect } from 'react';
import { ArrowRight, Blocks, CreditCard, ExternalLink, Lock, MoreVertical, Plus, Shield, Upload, User as UserIcon, Zap } from 'lucide-react';
import { settingsService } from '../../services/settingsService';
import { userService } from '../../services/userService';
import { AdminSettingsState } from '../../api/settings.api';
import { User } from '../../types';
import { ErrorState } from '../../components/common/ErrorState';
import { useToast } from '../../context/ToastContext';
import { PageContainer } from '../../components/layout/PageContainer';

export function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettingsState | null>(null);
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorState, setErrorState] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    setErrorState(null);
    try {
      const [settingsRes, usersRes] = await Promise.all([
        settingsService.getSettings(),
        userService.getUsers()
      ]);
      setSettings(settingsRes);
      setTeamMembers(usersRes.data);
    } catch (err) {
      console.error('Error fetching settings data', err);
      setErrorState('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await settingsService.updateSettings(settings);
      showToast('Settings saved', 'All changes synced to cloud.', 'success');
    } catch (err) {
      console.error('Error saving settings', err);
      showToast('Update failed', 'Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (field: keyof AdminSettingsState, value: any) => {
    setSettings(prev => prev ? { ...prev, [field]: value } : prev);
  };

  if (loading) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (errorState || !settings) {
    return (
      <div className="p-6 max-w-7xl mx-auto flex items-center justify-center min-h-screen">
        <ErrorState message={errorState || 'Failed to load settings'} onRetry={fetchData} />
      </div>
    );
  }
  return (
    <PageContainer
      title="Admin Settings"
      description="Manage your platform identity, team permissions, and global preferences."
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Settings' }
      ]}
      actions={
        <>
          <button className="px-6 py-2.5 bg-white text-slate-700 rounded-xl border border-slate-200 font-semibold hover:bg-slate-50 transition-colors" onClick={() => fetchData()}>
            Discard
          </button>
          <button 
            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl font-bold hover:bg-primary-600 transition-colors shadow-md shadow-primary-500/20 disabled:opacity-50"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Settings Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 lg:p-8 shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
                <UserIcon size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">General Profile</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-500 px-1">Instance Name</label>
                <input 
                  type="text" 
                  value={settings.instanceName}
                  onChange={(e) => handleSettingChange('instanceName', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-500 px-1">Default Language</label>
                <select 
                  value={settings.defaultLanguage}
                  onChange={(e) => handleSettingChange('defaultLanguage', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                >
                  <option>English (India)</option>
                  <option>Hindi</option>
                  <option>Bengali</option>
                </select>
              </div>
              
              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-500 px-1">Timezone</label>
                <select 
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                >
                  <option>(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi</option>
                  <option>(GMT+00:00) UTC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Team Permissions Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 lg:p-8 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-600">
                  <Shield size={20} />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Team Permissions</h3>
              </div>
              <button className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary-600 transition-colors shadow-[0_4px_12px_rgb(16,185,129,0.25)]">
                <Plus size={16} /> Invite Member
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {teamMembers.slice(0, 3).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100">
                  <div className="flex items-center gap-4">
                    <img src={member.avatar || "https://i.pravatar.cc/150"} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-bold text-slate-900">{member.name}</p>
                      <p className="text-sm text-slate-500">{member.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      member.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {member.role === 'admin' ? 'FULL ACCESS' : 'RESTRICTED'}
                    </span>
                    <button className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Branding Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 lg:p-8 shadow-sm border border-slate-200/60">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Branding</h3>
            <div className="flex flex-col gap-6">
              <div className="relative group cursor-pointer h-32 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary-400 transition-colors">
                <Upload className="text-slate-400 group-hover:text-primary-500" size={24} />
                <span className="text-sm font-medium text-slate-500 group-hover:text-primary-600">Update Logo</span>
              </div>
              
              <div className="flex flex-col gap-3">
                <p className="text-sm font-semibold text-slate-600">Primary Theme Color</p>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-500 ring-2 ring-offset-2 ring-primary-500 cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-[#1A7A3C] hover:scale-110 transition-transform cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-[#536500] hover:scale-110 transition-transform cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full bg-[#754800] hover:scale-110 transition-transform cursor-pointer"></div>
                  <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-400 hover:bg-slate-50 cursor-pointer">
                    <Plus size={16} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 lg:p-8 shadow-sm border border-slate-200/60">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Notifications</h3>
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Email Reports</span>
                <button 
                  onClick={() => handleSettingChange('emailReports', !settings.emailReports)}
                  className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors ${settings.emailReports ? 'bg-primary-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.emailReports ? 'translate-x-6' : ''}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Push Alerts</span>
                <button 
                  onClick={() => handleSettingChange('pushAlerts', !settings.pushAlerts)}
                  className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors ${settings.pushAlerts ? 'bg-primary-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.pushAlerts ? 'translate-x-6' : ''}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">Billing Updates</span>
                <button 
                  onClick={() => handleSettingChange('billingUpdates', !settings.billingUpdates)}
                  className={`w-12 h-6 rounded-full relative flex items-center px-1 transition-colors ${settings.billingUpdates ? 'bg-primary-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${settings.billingUpdates ? 'translate-x-6' : ''}`}></div>
                </button>
              </div>
            </div>
          </div>

          {/* Integrations Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 lg:p-8 shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Integrations</h3>
              <Zap className="text-primary-500" size={20} />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-500">
                  <Blocks size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Stripe Connect</p>
                  <p className="text-xs text-slate-500">Live Connection</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-primary-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-slate-500">
                  <Blocks size={16} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900">Zapier</p>
                  <p className="text-xs text-slate-500">Inactive</p>
                </div>
              </div>
              
              <button className="w-full py-2 text-primary-600 font-bold text-sm hover:underline mt-1">
                Manage API Keys
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Full-Width Sections */}
        <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Security Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 lg:p-8 shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                <Lock size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Security</h3>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div>
                  <p className="font-bold text-sm text-slate-900">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500 mt-1">Add an extra layer of security to your account.</p>
                </div>
                <button className="px-5 py-2 bg-primary-100 text-primary-700 rounded-xl font-bold text-sm hover:bg-primary-200 transition-colors">
                  Enable
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-slate-900">Active Sessions</p>
                  <p className="text-xs text-slate-500 mt-1">You are currently logged in on 3 sessions.</p>
                </div>
                <button className="text-slate-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition-colors">
                  <ExternalLink size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Billing Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 lg:p-8 shadow-sm border border-slate-200/60">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                <CreditCard size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Subscription & Billing</h3>
            </div>
            <div className="bg-gradient-to-br from-primary-50 to-primary-100/50 p-5 rounded-2xl flex items-center justify-between mb-5 border border-primary-200/60">
              <div>
                <p className="text-xs uppercase tracking-wider font-bold text-primary-600">Current Plan</p>
                <p className="text-xl font-black text-primary-700 mt-1">Enterprise Elite</p>
              </div>
              <button className="px-5 py-2 bg-primary-500 text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors shadow-[0_4px_12px_rgb(16,185,129,0.3)]">
                Upgrade
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Next invoice: Oct 12, 2024</span>
                <span className="font-bold text-slate-900">₹42,000 / month</span>
              </div>
              <a href="#" className="text-primary-600 font-bold text-sm flex items-center gap-1 hover:underline w-max">
                View Invoice History <ArrowRight size={14} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

export default AdminSettings;
