import { useState } from 'react';
import { Bell, Building2, ChevronRight, CreditCard, Eye, Globe, Lock, Mail, MapPin, Moon, Phone, Sun, User, Shield, Check, Save, Camera, EyeOff } from 'lucide-react';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'billing' | 'preferences';

const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 'billing', label: 'Billing', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'preferences', label: 'Preferences', icon: <Globe className="w-4 h-4" /> },
];

const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${checked ? 'bg-primary-500' : 'bg-slate-200'}`}
  >
    <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

export const CustomerSettings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [saved, setSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    serviceAlerts: true,
    promotions: false,
    weeklyReport: true,
    smsAlerts: false,
    appNotifications: true,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-slate-500 font-medium mt-2">Manage your account, notifications, and preferences.</p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md ${
            saved
              ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20'
              : 'bg-primary-500 text-white hover:bg-primary-600 shadow-md shadow-primary-500/20'
          }`}
        >
          {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-md p-3">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {tab.icon}
                    {tab.label}
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-40" />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Profile Information</h2>
              
              {/* Avatar Upload */}
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-100 to-teal-100 border-2 border-primary-200/50 flex items-center justify-center text-3xl font-bold text-primary-700">
                    R
                  </div>
                  <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-primary-600 transition-colors">
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Raj Malhotra</h3>
                  <p className="text-sm text-slate-500">raj.malhotra@kitchenbots.in</p>
                  <button className="mt-2 text-xs text-primary-600 font-semibold hover:text-primary-700 transition-colors">
                    Change photo
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { label: 'First Name', placeholder: 'Raj', icon: <User className="w-4 h-4" /> },
                  { label: 'Last Name', placeholder: 'Malhotra', icon: <User className="w-4 h-4" /> },
                  { label: 'Email Address', placeholder: 'raj.malhotra@kitchenbots.in', icon: <Mail className="w-4 h-4" />, type: 'email' },
                  { label: 'Phone Number', placeholder: '+91 98765 43210', icon: <Phone className="w-4 h-4" />, type: 'tel' },
                ].map((field) => (
                  <div key={field.label}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{field.label}</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">{field.icon}</span>
                      <input
                        type={field.type || 'text'}
                        defaultValue={field.placeholder}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                    </div>
                  </div>
                ))}

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business Address</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-slate-400"><MapPin className="w-4 h-4" /></span>
                    <textarea
                      defaultValue="12B, Food Court Complex, Andheri East, Mumbai - 400069"
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  Business Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: 'Company Name', placeholder: 'Raj Food Services Pvt. Ltd.' },
                    { label: 'GST Number', placeholder: '27AAABM1234C1ZP' },
                    { label: 'Industry', placeholder: 'Restaurant / Cloud Kitchen' },
                    { label: 'Website', placeholder: 'www.rajfoodservices.in' },
                  ].map((field) => (
                    <div key={field.label}>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{field.label}</label>
                      <input
                        type="text"
                        defaultValue={field.placeholder}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Notification Preferences</h2>
              <div className="space-y-5">
                {[
                  { key: 'orderUpdates', label: 'Order Updates', desc: 'Shipping, delivery, and status changes' },
                  { key: 'serviceAlerts', label: 'Service Alerts', desc: 'Maintenance schedules and equipment warnings' },
                  { key: 'promotions', label: 'Promotions', desc: 'New product launches and special offers' },
                  { key: 'weeklyReport', label: 'Weekly Report', desc: 'Summary of kitchen performance and orders' },
                  { key: 'smsAlerts', label: 'SMS Alerts', desc: 'Critical alerts via text message' },
                  { key: 'appNotifications', label: 'App Notifications', desc: 'Push notifications in the dashboard' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-slate-500">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={notifications[item.key as keyof typeof notifications]}
                      onChange={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifications] }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-md p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Change Password</h2>
                <div className="space-y-4 max-w-md">
                  {[
                    { label: 'Current Password', placeholder: '••••••••' },
                    { label: 'New Password', placeholder: 'Minimum 8 characters' },
                    { label: 'Confirm New Password', placeholder: 'Repeat new password' },
                  ].map((field, i) => (
                    <div key={field.label}>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{field.label}</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder={field.placeholder}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-12 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        />
                        {i > 0 && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button className="w-full bg-primary-500 text-white font-semibold py-3 rounded-xl hover:bg-primary-600 transition-colors shadow-md mt-2">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-md p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-2">Two-Factor Authentication</h2>
                <p className="text-slate-500 text-sm mb-6">Add an extra layer of security to your account.</p>
                <div className="flex items-center justify-between p-4 bg-primary-50 rounded-2xl border border-primary-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary-100 rounded-xl">
                      <Shield className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">2FA Status</p>
                      <p className="text-xs text-slate-500">Not enabled</p>
                    </div>
                  </div>
                  <button className="px-5 py-2.5 bg-primary-500 text-white text-sm font-semibold rounded-xl hover:bg-primary-600 transition-colors shadow-md">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Billing Tab */}
          {activeTab === 'billing' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Billing & Subscription</h2>
              
              {/* Current Plan */}
              <div className="p-6 bg-gradient-to-br from-primary-500 to-teal-600 rounded-2xl text-white mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-primary-100 text-sm font-medium">Current Plan</p>
                    <h3 className="text-2xl font-bold mt-1">Enterprise Pro</h3>
                  </div>
                  <span className="bg-white/20 px-3 py-1.5 rounded-full text-sm font-bold">ACTIVE</span>
                </div>
                <p className="text-primary-100 text-sm">₹49,999 / year • Renews on Jan 1, 2025</p>
                <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                  {[{ label: 'Zones', value: '10' }, { label: 'Users', value: 'Unlimited' }, { label: 'Support', value: '24/7' }].map(item => (
                    <div key={item.label} className="bg-white/10 rounded-xl p-2">
                      <p className="font-bold">{item.value}</p>
                      <p className="text-xs text-primary-100">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  Download Invoice
                </button>
                <button className="flex-1 py-3 bg-primary-500 rounded-xl text-sm font-semibold text-white hover:bg-primary-600 transition-colors shadow-md">
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 shadow-md p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6">App Preferences</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Language</label>
                  <select className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
                    <option>English (India)</option>
                    <option>Hindi</option>
                    <option>Marathi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Currency</label>
                  <select className="w-full max-w-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
                    <option>INR (₹)</option>
                    <option>USD ($)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Theme</label>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-primary-50 border border-primary-200 rounded-xl text-primary-700 text-sm font-semibold">
                      <Sun className="w-4 h-4" />
                      Light
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 rounded-xl text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                      <Moon className="w-4 h-4" />
                      Dark
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerSettings;
